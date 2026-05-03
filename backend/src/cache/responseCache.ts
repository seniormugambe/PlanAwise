export interface CachedResponse {
  response: unknown;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export class ResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private maxSize = 100;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate a cache key from query parameters
   */
  private generateKey(agent: string, query: string): string {
    return `${agent}:${query}`.substring(0, 200);
  }

  /**
   * Get a cached response if it exists and hasn't expired
   */
  get<T>(agent: string, query: string): T | null {
    const key = this.generateKey(agent, query);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.response as T;
  }

  /**
   * Set a cached response
   */
  set<T>(agent: string, query: string, response: T, ttl?: number): void {
    const key = this.generateKey(agent, query);
    const finalTtl = ttl || 15 * 60 * 1000; // Default 15 minutes

    // Prevent cache from growing too large
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl: finalTtl,
    });
  }

  /**
   * Clear specific cache entries by agent
   */
  clearByAgent(agent: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(`${agent}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }

  /**
   * Destroy the cache and stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export const globalCache = new ResponseCache();
