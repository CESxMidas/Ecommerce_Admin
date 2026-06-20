export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
  },
  categories: {
    list: "/categories",
    detail: (id: string) => `/categories/${id}`,
  },
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
    updateStatus: (id: string) => `/orders/${id}`,
  },
  admin: {
    stats: "/admin/stats",
    products: "/admin/products",
    banners: "/admin/banners",
    banner: (id: string) => `/admin/banners/${id}`,
    blogs: "/admin/blogs",
    blog: (id: string) => `/admin/blogs/${id}`,
    upload: "/admin/upload",
    coupons: "/admin/coupons",
    coupon: (id: string) => `/admin/coupons/${id}`,
    productKeyStats: (productId: string) =>
      `/admin/products/${productId}/keys/stats`,
    productKeys: (productId: string) => `/admin/products/${productId}/keys`,
    importProductKeys: (productId: string) =>
      `/admin/products/${productId}/keys/import`,
    revokeProductKey: (productId: string, keyId: string) =>
      `/admin/products/${productId}/keys/${keyId}`,
    categories: "/admin/categories",
    users: "/admin/users",
    user: (id: string) => `/admin/users/${id}`,
  },
} as const;
