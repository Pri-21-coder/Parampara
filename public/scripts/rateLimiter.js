/**
 * A modular frontend rate limiting utility.
 * Can be reused across different forms/components to prevent spam.
 * Uses a highly efficient Token Bucket algorithm with O(1) memory footprint.
 */
class RateLimiter {
  /**
   * @param {number} maxRequests - Maximum allowed requests in the window.
   * @param {number} windowMs - Rolling window duration in milliseconds.
   */
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.tokens = maxRequests;
    this.lastRefill = Date.now();
  }

  /**
   * Checks if a new request is allowed and registers it if so.
   * @returns {{ allowed: boolean, remainingMs: number }}
   */
  check() {
    const now = Date.now();
    
    // Refill tokens
    const timePassed = now - this.lastRefill;
    const refillRate = this.maxRequests / this.windowMs; // tokens per ms
    const tokensToAdd = timePassed * refillRate;
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxRequests, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }

    if (this.tokens < 1) {
      // Calculate remaining wait time for 1 token
      const timeToNextToken = (1 - this.tokens) / refillRate;
      return { allowed: false, remainingMs: Math.ceil(timeToNextToken) };
    }

    // Consume current request
    this.tokens -= 1;
    return { allowed: true, remainingMs: 0 };
  }
}
