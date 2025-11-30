/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by monitoring service health
 */

const logger = require('./logger');

class CircuitBreaker {
  constructor(failureThreshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.failureThreshold = failureThreshold;
    this.timeout = timeout; // Time to wait before retry (ms)
    this.state = 'CLOSED'; // CLOSED = normal, OPEN = blocking, HALF_OPEN = testing
    this.nextAttempt = Date.now();
    this.successCount = 0;
  }

  /**
   * Execute function with circuit breaker protection
   */
  async call(fn) {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const waitTime = Math.ceil((this.nextAttempt - Date.now()) / 1000);
        logger.warn(`Circuit breaker OPEN - Service unavailable. Retry in ${waitTime}s`);
        throw new Error(`Circuit breaker is OPEN - service unavailable (retry in ${waitTime}s)`);
      }
      // Time to test if service recovered
      this.state = 'HALF_OPEN';
      logger.info('Circuit breaker HALF_OPEN - Testing service');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful call
   */
  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      // Require 2 successful calls to close circuit
      if (this.successCount >= 2) {
        this.state = 'CLOSED';
        this.successCount = 0;
        logger.info('Circuit breaker CLOSED - Service recovered');
      }
    }
  }

  /**
   * Handle failed call
   */
  onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      logger.error(`Circuit breaker OPEN - ${this.failureCount} failures detected`);
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset() {
    this.failureCount = 0;
    this.successCount = 0;
    this.state = 'CLOSED';
    logger.info('Circuit breaker manually reset');
  }
}

module.exports = CircuitBreaker;
