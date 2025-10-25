/**
 * Ví dụ cách sử dụng Store Cache trong các Zustand stores
 */

import { create } from "zustand";
import { storeCache, CacheTTL } from "@/lib/storeCache";

// ===== VÍ DỤ 1: Store đơn giản với cache =====
interface UserState {
  users: any[];
  loading: boolean;
  fetchUsers: (forceRefresh?: boolean) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async (forceRefresh = false) => {
    set({ loading: true });
    try {
      const users = await storeCache.fetchWithCache(
        "users", // Cache key
        async () => {
          // API call thực tế
          const response = await fetch("/api/users");
          return response.json();
        },
        {
          ttl: CacheTTL.FIVE_MINUTES, // Cache trong 5 phút
          forceRefresh, // Force refresh nếu cần
        }
      );
      set({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

// ===== VÍ DỤ 2: Store với params động =====
interface PostState {
  posts: any[];
  loading: boolean;
  fetchPosts: (params: { page: number; category?: string }) => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  loading: false,

  fetchPosts: async (params) => {
    set({ loading: true });
    try {
      // Tạo cache key động dựa trên params
      const cacheKey = storeCache.createKey("posts", params);

      const posts = await storeCache.fetchWithCache(
        cacheKey,
        async () => {
          const queryString = new URLSearchParams(params as any).toString();
          const response = await fetch(`/api/posts?${queryString}`);
          return response.json();
        },
        {
          ttl: CacheTTL.TEN_MINUTES,
        }
      );
      set({ posts });
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

// ===== VÍ DỤ 3: Invalidate cache khi có mutation =====
interface ProductState {
  products: any[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await storeCache.fetchWithCache(
        "products",
        async () => {
          const response = await fetch("/api/products");
          return response.json();
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
        }
      );
      set({ products });
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (data) => {
    set({ loading: true });
    try {
      await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("products");

      // Fetch lại data mới (với forceRefresh)
      const products = await storeCache.fetchWithCache(
        "products",
        async () => {
          const response = await fetch("/api/products");
          return response.json();
        },
        { forceRefresh: true }
      );
      set({ products });
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, data) => {
    set({ loading: true });
    try {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      // Invalidate cache
      storeCache.invalidate("products");

      // Refresh data
      const products = await storeCache.fetchWithCache(
        "products",
        async () => {
          const response = await fetch("/api/products");
          return response.json();
        },
        { forceRefresh: true }
      );
      set({ products });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });

      // Invalidate và refresh
      storeCache.invalidate("products");
      const products = await storeCache.fetchWithCache(
        "products",
        async () => {
          const response = await fetch("/api/products");
          return response.json();
        },
        { forceRefresh: true }
      );
      set({ products });
    } finally {
      set({ loading: false });
    }
  },
}));

// ===== VÍ DỤ 4: Multiple cache keys cho cùng một store =====
interface DashboardState {
  stats: any;
  recentActivities: any[];
  notifications: any[];
  loading: Record<string, boolean>;
  fetchStats: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  recentActivities: [],
  notifications: [],
  loading: {},

  fetchStats: async () => {
    set((state) => ({
      loading: { ...state.loading, stats: true },
    }));
    try {
      const stats = await storeCache.fetchWithCache(
        "dashboard:stats",
        async () => {
          const response = await fetch("/api/dashboard/stats");
          return response.json();
        },
        { ttl: CacheTTL.ONE_MINUTE } // Stats cập nhật nhanh hơn
      );
      set({ stats });
    } finally {
      set((state) => ({
        loading: { ...state.loading, stats: false },
      }));
    }
  },

  fetchActivities: async () => {
    set((state) => ({
      loading: { ...state.loading, activities: true },
    }));
    try {
      const activities = await storeCache.fetchWithCache(
        "dashboard:activities",
        async () => {
          const response = await fetch("/api/dashboard/activities");
          return response.json();
        },
        { ttl: CacheTTL.FIVE_MINUTES }
      );
      set({ recentActivities: activities });
    } finally {
      set((state) => ({
        loading: { ...state.loading, activities: false },
      }));
    }
  },

  fetchNotifications: async () => {
    set((state) => ({
      loading: { ...state.loading, notifications: true },
    }));
    try {
      const notifications = await storeCache.fetchWithCache(
        "dashboard:notifications",
        async () => {
          const response = await fetch("/api/dashboard/notifications");
          return response.json();
        },
        { ttl: CacheTTL.ONE_MINUTE }
      );
      set({ notifications });
    } finally {
      set((state) => ({
        loading: { ...state.loading, notifications: false },
      }));
    }
  },
}));

// ===== CÁCH SỬ DỤNG TRONG COMPONENT =====

/*
// Component với auto cache
function MyComponent() {
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    // Lần đầu: Call API
    // Lần 2-n (trong 5 phút): Lấy từ cache
    fetchUsers();
  }, []);

  return <div>{users.map(...)}</div>;
}

// Force refresh khi cần
function RefreshButton() {
  const { fetchUsers } = useUserStore();

  const handleRefresh = () => {
    // Force call API bỏ qua cache
    fetchUsers(true);
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}

// Clear toàn bộ cache
function LogoutButton() {
  const handleLogout = () => {
    storeCache.clear(); // Xóa toàn bộ cache
    // ... logout logic
  };

  return <button onClick={handleLogout}>Logout</button>;
}
*/
