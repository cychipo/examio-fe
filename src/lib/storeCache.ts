/**
 * Store Cache Manager
 * Quản lý cache cho các API calls trong Zustand stores
 * Giúp tránh gọi API nhiều lần không cần thiết
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isLoading: boolean;
}

class StoreCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Kiểm tra xem cache có còn valid không
   */
  private isValid(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const expiryTime = ttl || this.defaultTTL;
    const isExpired = Date.now() - entry.timestamp > expiryTime;

    return !isExpired;
  }

  /**
   * Lấy data từ cache nếu còn valid
   */
  get<T>(key: string, ttl?: number): T | null {
    if (this.isValid(key, ttl)) {
      const entry = this.cache.get(key);
      return entry?.data || null;
    }
    return null;
  }

  /**
   * Lưu data vào cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isLoading: false,
    });
  }

  /**
   * Xóa một cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Xóa tất cả cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Kiểm tra xem đang loading hay không
   */
  isLoading(key: string): boolean {
    const entry = this.cache.get(key);
    return entry?.isLoading || false;
  }

  /**
   * Set trạng thái loading
   */
  setLoading(key: string, isLoading: boolean): void {
    const entry = this.cache.get(key);
    if (entry) {
      entry.isLoading = isLoading;
    } else {
      this.cache.set(key, {
        data: null,
        timestamp: Date.now(),
        isLoading,
      });
    }
  }

  /**
   * Wrapper function để fetch data với cache
   * Tự động xử lý cache, loading state và error handling
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const { ttl, forceRefresh = false } = options || {};

    // Nếu đang loading, chờ một chút rồi retry
    if (this.isLoading(key)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.fetchWithCache(key, fetcher, options);
    }

    // Nếu có cache và không force refresh, trả về cache
    if (!forceRefresh) {
      const cached = this.get<T>(key, ttl);
      if (cached !== null) {
        return cached;
      }
    }

    // Set loading state
    this.setLoading(key, true);

    try {
      // Fetch data mới
      const data = await fetcher();

      // Lưu vào cache
      this.set(key, data);

      // Clear loading state
      this.setLoading(key, false);

      return data;
    } catch (error) {
      // Clear loading state khi error
      this.setLoading(key, false);
      throw error;
    }
  }

  /**
   * Tạo cache key từ params
   */
  createKey(prefix: string, params?: Record<string, any>): string {
    if (!params) return prefix;
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${JSON.stringify(params[key])}`)
      .join("|");
    return `${prefix}:${sortedParams}`;
  }
}

// Export singleton instance
export const storeCache = new StoreCacheManager();

// Export preset TTL values
export const CacheTTL = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
} as const;
