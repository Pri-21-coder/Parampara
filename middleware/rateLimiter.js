/**
 * Heuristic Rate Limiting and Adaptive Throttling Middleware
 * Uses an in-memory Map to track tokens and dynamically delays responses to tarpit abusive users.
 */
class HeuristicRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxTokens = options.maxTokens || 100;
    this.message = options.message || 'Too many requests, please try again later.';
    this.exclude = options.exclude || null;
    this.baseDelayMs = options.baseDelayMs || 2000;
    this.burstThreshold = options.burstThreshold || 5;
    this.costMultiplier = options.costMultiplier || 2;
    this.cleanupIntervalMs = options.cleanupIntervalMs || Math.min(this.windowMs, 60000);
    this.useRedis = options.useRedis || false;

    if (this.useRedis) {
      try {
        const Redis = require('ioredis');
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB || 0
        });
      } catch (error) {
        console.error('[RateLimiter] Redis initialization failed, falling back to memory store:', error.message);
        this.useRedis = false;
        this.store = new Map();
      }
    } else {
      this.store = new Map();
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cleanupIntervalMs);

    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  cleanupExpiredEntries() {
    const now = Date.now();
    if (this.useRedis) {
      // Redis cleanup is handled by TTL
      return;
    }

    for (const [ip, bucket] of this.store.entries()) {
      if (now - bucket.lastRefill > this.windowMs) {
        this.store.delete(ip);
      }
    }
  }

  async getBucket(ip) {
    if (this.useRedis) {
      try {
        const data = await this.redis.get(`rate:${ip}`);
        if (data) {
          return JSON.parse(data);
        }
        return null;
      } catch (error) {
        console.error('[RateLimiter] Redis get error:', error.message);
        return null;
      }
    }
    return this.store.get(ip) || null;
  }

  async setBucket(ip, bucket) {
    if (this.useRedis) {
      try {
        await this.redis.setex(`rate:${ip}`, Math.ceil(this.windowMs / 1000), JSON.stringify(bucket));
      } catch (error) {
        console.error('[RateLimiter] Redis set error:', error.message);
      }
    } else {
      this.store.set(ip, bucket);
    }
  }

  calculateCost(req) {
    let cost = 1;
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      cost = 3;
    }
    if (req.path.includes('/search') || req.path.includes('/report')) {
      cost += 2;
    }
    return cost;
  }

  middleware() {
    return async (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();

      if (process.env.NODE_ENV === 'test') return next();

      try {
        if (this.exclude && this.exclude(req)) return next();
      } catch (err) {
        console.error('[RateLimiter] Error in exclude function:', err);
      }

      try {
        let bucket = await this.getBucket(ip);

        if (!bucket) {
          bucket = {
            tokens: this.maxTokens,
            lastRefill: now,
            lastRequestTime: 0,
            burstCount: 0
          };
        } else {
          const timePassed = now - bucket.lastRefill;
          const refillRate = this.maxTokens / this.windowMs;
          const tokensToAdd = timePassed * refillRate;
          if (tokensToAdd > 0) {
            bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
            bucket.lastRefill = now;
          }
        }

        const timeSinceLastRequest = now - bucket.lastRequestTime;
        if (timeSinceLastRequest < 500) {
          bucket.burstCount++;
        } else if (timeSinceLastRequest > 2000) {
          bucket.burstCount = Math.max(0, bucket.burstCount - 1);
        }
        bucket.lastRequestTime = now;

        let cost = this.calculateCost(req);
        if (bucket.burstCount > this.burstThreshold) {
          cost *= this.costMultiplier;
        }

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

        bucket.tokens -= cost;

        const healthPercentage = bucket.tokens / this.maxTokens;
        let delayMs = 0;

        if (healthPercentage < 0.3) {
          const delayFactor = (0.3 - healthPercentage) / 0.3;
          delayMs = Math.floor(this.baseDelayMs * delayFactor);
        }

        await this.setBucket(ip, bucket);

        if (delayMs > 50) {
          console.log(`[RateLimiter] THROTTLING ${req.method} ${req.originalUrl} from ${ip} (Delay: ${delayMs}ms, Health: ${Math.round(healthPercentage*100)}%)`);
          setTimeout(() => next(), delayMs);
        } else {
          next();
        }

      } catch (error) {
        console.error('[RateLimiter] Error:', error.message);
        next();
      }
    };
  }

  async reset(ip) {
    if (this.useRedis) {
      await this.redis.del(`rate:${ip}`);
    } else {
      this.store.delete(ip);
    }
  }

  async getStatus(ip) {
    if (this.useRedis) {
      const data = await this.redis.get(`rate:${ip}`);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    }
    return this.store.get(ip) || null;
  }

  async healthCheck() {
    try {
      if (this.useRedis) {
        await this.redis.ping();
        return { status: 'healthy', store: 'redis' };
      }
      return { status: 'healthy', store: 'memory', size: this.store.size };
    } catch (error) {
      return { status: 'unhealthy', store: this.useRedis ? 'redis' : 'memory', error: error.message };
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.useRedis && this.redis) {
      this.redis.quit();
    }
  }
}

module.exports = HeuristicRateLimiter;