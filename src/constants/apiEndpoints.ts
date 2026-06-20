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
    analyticsOverview: "/admin/analytics/overview",
    settings: "/admin/settings",
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
    staff: "/admin/staff",
    staffMember: (id: string) => `/admin/staff/${id}`,
    staffPassword: (id: string) => `/admin/staff/${id}/password`,
    user: (id: string) => `/admin/users/${id}`,
    search: "/admin/search",
    notifications: "/admin/notifications",
    audit: "/admin/audit",
    tickets: "/admin/tickets",
    ticket: (id: string) => `/admin/tickets/${id}`,
    ticketReplies: (id: string) => `/admin/tickets/${id}/replies`,
    review: (id: string) => `/admin/reviews/${id}`,
    productReviews: (productId: string) => `/admin/products/${productId}/reviews`,
  },
} as const;
