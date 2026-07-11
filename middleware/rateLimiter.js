/**
 * Heuristic Rate Limiting and Adaptive Throttling Middleware
 * Uses an in-memory Map to track tokens and dynamically delays responses to tarpit abusive users.
 */
class HeuristicRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxTokens = options.maxTokens || 100; // Total tokens in bucket
    this.message = options.message || 'Too many requests, please try again later.';
    this.exclude = options.exclude || null;
    this.baseDelayMs = options.baseDelayMs || 2000; // Max artificial delay to introduce (2 seconds)
    
    this.store = new Map();

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, bucket] of this.store.entries()) {
        if (now - bucket.lastRefill > this.windowMs) {
          this.store.delete(ip);
        }
      }
    }, this.windowMs);

    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  // Calculate heuristic cost of a request
  calculateCost(req) {
    let cost = 1; // Base cost for GET
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      cost = 3; // Modifying operations are 3x as expensive
    }
    // High risk endpoints (e.g., search, reports) cost more
    if (req.path.includes('/search') || req.path.includes('/report')) {
      cost += 2; 
    }
    return cost;
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();

      // Skip rate limiting in test environment
      if (process.env.NODE_ENV === 'test') return next();

      try {
        if (this.exclude && this.exclude(req)) return next();
      } catch (err) {
        console.error('[RateLimiter] Error in exclude function:', err);
      }

      let bucket = this.store.get(ip);
      if (!bucket) {
        bucket = { tokens: this.maxTokens, lastRefill: now, lastRequestTime: 0, burstCount: 0 };
        this.store.set(ip, bucket);
      } else {
        const timePassed = now - bucket.lastRefill;
        const refillRate = this.maxTokens / this.windowMs; 
        const tokensToAdd = timePassed * refillRate;
        if (tokensToAdd > 0) {
          bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
          bucket.lastRefill = now;
        }
      }

      // Burst Detection Heuristics
      const timeSinceLastRequest = now - bucket.lastRequestTime;
      if (timeSinceLastRequest < 500) { // Less than 500ms between requests
        bucket.burstCount++;
      } else if (timeSinceLastRequest > 2000) {
        bucket.burstCount = Math.max(0, bucket.burstCount - 1);
      }
      bucket.lastRequestTime = now;

      // Calculate cost
      let cost = this.calculateCost(req);
      if (bucket.burstCount > 5) cost *= 2; // Burst penalty

      const remaining = Math.max(0, Math.floor(bucket.tokens) - cost);

      let retryAfterSeconds = 0;
      if (bucket.tokens < cost) {
         const timeToNextToken = (cost - bucket.tokens) / (this.maxTokens / this.windowMs);
         retryAfterSeconds = Math.ceil(timeToNextToken / 1000);
      }

      res.setHeader('X-RateLimit-Limit', this.maxTokens);
      res.setHeader('X-RateLimit-Remaining', remaining);
      if (retryAfterSeconds > 0) res.setHeader('Retry-After', retryAfterSeconds);

      if (bucket.tokens < cost) {
        console.warn(`[RateLimiter] BLOCKED ${req.method} ${req.originalUrl} from ${ip} (Burst: ${bucket.burstCount}, Cost: ${cost})`);
        return res.status(429).json({ error: this.message, retryAfter: retryAfterSeconds });
      }

      // Consume tokens
      bucket.tokens -= cost;

      // Adaptive Throttling (Tarpitting)
      // If tokens drop below 30%, start introducing artificial delay
      const healthPercentage = bucket.tokens / this.maxTokens;
      let delayMs = 0;
      
      if (healthPercentage < 0.3) {
        // Linearly increase delay from 0 to baseDelayMs as health drops from 30% to 0%
        const delayFactor = (0.3 - healthPercentage) / 0.3; // 0 to 1
        delayMs = Math.floor(this.baseDelayMs * delayFactor);
      }

      if (delayMs > 50) {
        console.log(`[RateLimiter] THROTTLING ${req.method} ${req.originalUrl} from ${ip} (Delay: ${delayMs}ms, Health: ${Math.round(healthPercentage*100)}%)`);
        setTimeout(() => next(), delayMs);
      } else {
        next();
      }
    };
  }
}

module.exports = HeuristicRateLimiter;
