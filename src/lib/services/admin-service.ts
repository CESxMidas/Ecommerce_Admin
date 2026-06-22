import apiClient from "@/lib/api/client";
import {
  buildChartFromOrders,
  normalizeBanners,
  normalizeBanner,
  normalizeBlog,
  normalizeBlogs,
  normalizeCategories,
  normalizeCategory,
  normalizeCoupons,
  normalizeCoupon,
  normalizeDashboardStats,
  normalizeOrder,
  normalizeOrders,
  normalizeProduct,
  normalizeProducts,
  normalizeStaff,
  normalizeStaffList,
  normalizeUser,
  normalizeUserDetail,
  normalizeUsers,
} from "@/lib/api/normalizers";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  AdminBanner,
  AdminBlog,
  AdminCategory,
  AdminChartPoint,
  AdminAnalyticsOverview,
  AdminCoupon,
  AdminDashboardStats,
  AdminOrder,
  AdminProduct,
  AdminSiteSettings,
  AdminStaff,
  AdminTicket,
  AdminAuditLog,
  AdminSearchResult,
  AdminAlert,
  AdminUser,
  AdminUserDetail,
  AdminUserDetailData,
  BannerWritePayload,
  BlogWritePayload,
  CategoryWritePayload,
  CouponWritePayload,
  ProductWritePayload,
  SiteSettingsWritePayload,
  StaffCreatePayload,
  StaffPasswordPayload,
  StaffUpdatePayload,
  UserWritePayload,
} from "@/types/admin";

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { items?: T[] }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.stats);
  return normalizeDashboardStats(data);
}

export async function fetchProducts(): Promise<AdminProduct[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.products);
  return normalizeProducts(unwrapList(data));
}

export async function fetchProduct(id: string): Promise<AdminProduct> {
  const { data } = await apiClient.get(API_ENDPOINTS.products.detail(id));
  return normalizeProduct(data);
}

export async function createProduct(payload: ProductWritePayload): Promise<AdminProduct> {
  const { data } = await apiClient.post(API_ENDPOINTS.products.list, payload);
  return normalizeProduct(data);
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductWritePayload>,
): Promise<AdminProduct> {
  const { data } = await apiClient.put(API_ENDPOINTS.products.detail(id), payload);
  return normalizeProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.products.detail(id));
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  if (!isActive) {
    await deleteProduct(id);
    return;
  }

  await updateProduct(id, { isActive: true });
}

export async function bulkSetProductsActive(
  productIds: number[],
  isActive: boolean,
): Promise<void> {
  await Promise.all(productIds.map((id) => setProductActive(String(id), isActive)));
}

export type ProductReview = {
  id: string;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  isHidden?: boolean;
  createdAt: string;
};

export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.productReviews(productId));
  return unwrapList<ProductReview>(data);
}

export async function hideProductReview(reviewId: string, isHidden: boolean): Promise<ProductReview> {
  const { data } = await apiClient.patch(API_ENDPOINTS.admin.review(reviewId), { isHidden });
  return data as ProductReview;
}

export async function deleteProductReview(reviewId: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.admin.review(reviewId));
}

export async function fetchTickets(params?: {
  status?: string;
  priority?: string;
  q?: string;
}): Promise<AdminTicket[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.tickets, { params });
  return unwrapList<AdminTicket>(data);
}

export async function fetchTicket(id: string): Promise<AdminTicket> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.ticket(id));
  return data as AdminTicket;
}

export async function updateTicket(
  id: string,
  payload: { status?: AdminTicket["status"]; priority?: AdminTicket["priority"] },
): Promise<AdminTicket> {
  const { data } = await apiClient.patch(API_ENDPOINTS.admin.ticket(id), payload);
  return data as AdminTicket;
}

export async function replyTicket(
  id: string,
  payload: { message: string; status?: AdminTicket["status"] },
): Promise<AdminTicket> {
  const { data } = await apiClient.post(API_ENDPOINTS.admin.ticketReplies(id), payload);
  return data as AdminTicket;
}

export async function fetchAuditLogs(params?: {
  page?: number;
  limit?: number;
  q?: string;
  action?: string;
  entityType?: string;
}): Promise<{
  items: AdminAuditLog[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.audit, { params });
  return data as {
    items: AdminAuditLog[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export async function globalSearch(query: string): Promise<AdminSearchResult[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.search, {
    params: { q: query },
  });
  return (data as { results: AdminSearchResult[] }).results;
}

export async function fetchAdminNotifications(): Promise<{
  alerts: AdminAlert[];
  unreadCount: number;
}> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.notifications);
  return data as { alerts: AdminAlert[]; unreadCount: number };
}

export async function uploadAdminImage(
  file: File,
  folder = "products",
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const { data } = await apiClient.post(API_ENDPOINTS.admin.upload, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data as { url: string; publicId: string };
}

export async function fetchCategories(): Promise<AdminCategory[]> {
  const { data } = await apiClient.get(`${API_ENDPOINTS.categories.list}?flat=true`);
  return normalizeCategories(data);
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.categories);
  return normalizeCategories(unwrapList(data));
}

export async function fetchCategory(id: string): Promise<AdminCategory> {
  const { data } = await apiClient.get(API_ENDPOINTS.categories.detail(id));
  return normalizeCategory(data);
}

export async function createCategory(payload: CategoryWritePayload): Promise<AdminCategory> {
  const { data } = await apiClient.post(API_ENDPOINTS.categories.list, payload);
  return normalizeCategory(data);
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryWritePayload>,
): Promise<AdminCategory> {
  const { data } = await apiClient.put(API_ENDPOINTS.categories.detail(id), payload);
  return normalizeCategory(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.categories.detail(id));
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  if (!isActive) {
    await deleteCategory(id);
    return;
  }

  await updateCategory(id, { isActive: true });
}

export async function bulkSetCategoriesActive(
  categoryIds: number[],
  isActive: boolean,
): Promise<void> {
  await Promise.all(categoryIds.map((id) => setCategoryActive(String(id), isActive)));
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.users);
  return normalizeUsers(unwrapList(data));
}

export async function fetchAdminUser(id: string): Promise<AdminUserDetailData> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.user(id));
  const payload = data as {
    user: unknown;
    orders: unknown;
    orderStats: AdminUserDetailData["orderStats"];
  };

  return {
    user: normalizeUserDetail(payload.user),
    orders: normalizeOrders(payload.orders),
    orderStats: payload.orderStats,
  };
}

export async function updateUser(
  id: string,
  payload: UserWritePayload,
): Promise<AdminUser> {
  const { data } = await apiClient.patch(API_ENDPOINTS.admin.user(id), payload);
  return normalizeUser(data);
}

export async function bulkSetUsersStatus(
  userIds: string[],
  status: AdminUser["status"],
): Promise<void> {
  await Promise.all(userIds.map((id) => updateUser(id, { status })));
}

export async function fetchStaff(): Promise<AdminStaff[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.staff);
  return normalizeStaffList(data);
}

export async function createStaff(payload: StaffCreatePayload): Promise<AdminStaff> {
  const { data } = await apiClient.post(API_ENDPOINTS.admin.staff, payload);
  return normalizeStaff(data);
}

export async function updateStaff(
  id: string,
  payload: StaffUpdatePayload,
): Promise<AdminStaff> {
  const { data } = await apiClient.patch(API_ENDPOINTS.admin.staffMember(id), payload);
  return normalizeStaff(data);
}

export async function bulkSetStaffStatus(
  staffIds: string[],
  status: AdminStaff["status"],
): Promise<void> {
  await Promise.all(staffIds.map((id) => updateStaff(id, { status })));
}

export async function resetStaffPassword(
  id: string,
  payload: StaffPasswordPayload,
): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.admin.staffPassword(id), payload);
}

export async function fetchAnalyticsOverview(params?: {
  from?: string;
  to?: string;
}): Promise<AdminAnalyticsOverview> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.analyticsOverview, {
    params,
  });
  return data as AdminAnalyticsOverview;
}

export async function fetchSiteSettings(): Promise<AdminSiteSettings> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.settings);
  return data as AdminSiteSettings;
}

export async function updateSiteSettings(
  payload: SiteSettingsWritePayload,
): Promise<AdminSiteSettings> {
  const { data } = await apiClient.patch(API_ENDPOINTS.admin.settings, payload);
  return data as AdminSiteSettings;
}

export async function fetchOrders(): Promise<AdminOrder[]> {
  const { data } = await apiClient.get(`${API_ENDPOINTS.orders.list}?all=true`);
  return normalizeOrders(data);
}

export async function fetchBanners(): Promise<AdminBanner[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.banners);
  return normalizeBanners(data);
}

export async function createBanner(payload: BannerWritePayload): Promise<AdminBanner> {
  const { data } = await apiClient.post(API_ENDPOINTS.admin.banners, payload);
  return normalizeBanner(data);
}

export async function updateBanner(
  id: string,
  payload: Partial<BannerWritePayload>,
): Promise<AdminBanner> {
  const { data } = await apiClient.put(API_ENDPOINTS.admin.banner(id), payload);
  return normalizeBanner(data);
}

export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.admin.banner(id));
}

export async function setBannerActive(id: string, isActive: boolean): Promise<void> {
  if (!isActive) {
    await deleteBanner(id);
    return;
  }

  await updateBanner(id, { isActive: true });
}

export async function bulkSetBannersActive(
  bannerIds: string[],
  isActive: boolean,
): Promise<void> {
  await Promise.all(bannerIds.map((id) => setBannerActive(id, isActive)));
}

export async function fetchBlogs(): Promise<AdminBlog[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.blogs);
  return normalizeBlogs(data);
}

export async function createBlog(payload: BlogWritePayload): Promise<AdminBlog> {
  const { data } = await apiClient.post(API_ENDPOINTS.admin.blogs, payload);
  return normalizeBlog(data);
}

export async function updateBlog(
  id: string,
  payload: Partial<BlogWritePayload>,
): Promise<AdminBlog> {
  const { data } = await apiClient.put(API_ENDPOINTS.admin.blog(id), payload);
  return normalizeBlog(data);
}

export async function deleteBlog(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.admin.blog(id));
}

export async function setBlogActive(id: string, isActive: boolean): Promise<void> {
  if (!isActive) {
    await deleteBlog(id);
    return;
  }

  await updateBlog(id, { isActive: true });
}

export async function bulkSetBlogsActive(
  blogIds: string[],
  isActive: boolean,
): Promise<void> {
  await Promise.all(blogIds.map((id) => setBlogActive(id, isActive)));
}

export async function fetchCoupons(): Promise<AdminCoupon[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.coupons);
  return normalizeCoupons(data);
}

export async function createCoupon(payload: CouponWritePayload): Promise<AdminCoupon> {
  const { data } = await apiClient.post(API_ENDPOINTS.admin.coupons, payload);
  return normalizeCoupon(data);
}

export async function updateCoupon(
  id: string,
  payload: Partial<CouponWritePayload>,
): Promise<AdminCoupon> {
  const { data } = await apiClient.put(API_ENDPOINTS.admin.coupon(id), payload);
  return normalizeCoupon(data);
}

export async function deleteCoupon(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.admin.coupon(id));
}

export async function setCouponActive(id: string, isActive: boolean): Promise<void> {
  if (!isActive) {
    await deleteCoupon(id);
    return;
  }

  await updateCoupon(id, { isActive: true });
}

export async function bulkSetCouponsActive(
  couponIds: string[],
  isActive: boolean,
): Promise<void> {
  await Promise.all(couponIds.map((id) => setCouponActive(id, isActive)));
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<AdminOrder> {
  const { data } = await apiClient.patch(API_ENDPOINTS.orders.updateStatus(orderId), {
    status,
  });
  return normalizeOrder(data);
}

export type DashboardData = {
  stats: AdminDashboardStats;
  products: AdminProduct[];
  orders: AdminOrder[];
  coupons: AdminCoupon[];
  chartData: AdminChartPoint[];
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const [stats, products, orders, coupons] = await Promise.all([
    fetchDashboardStats(),
    fetchProducts(),
    fetchOrders(),
    fetchCoupons(),
  ]);

  return {
    stats,
    products,
    orders: orders.slice(0, 10),
    coupons,
    chartData: buildChartFromOrders(orders),
  };
}

export type KeyPoolStats = {
  available: number;
  reserved: number;
  sold: number;
  revoked: number;
  total: number;
};

export type KeyPoolEntry = {
  _id: string;
  key: string;
  status: string;
  orderId?: string | null;
  soldAt?: string | null;
  createdAt: string;
};

export async function fetchProductKeyStats(productId: string): Promise<KeyPoolStats> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.productKeyStats(productId));
  return data as KeyPoolStats;
}

export async function fetchProductKeys(
  productId: string,
  params?: { status?: string; page?: number; limit?: number },
): Promise<{
  items: KeyPoolEntry[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.productKeys(productId), {
    params,
  });
  return data as {
    items: KeyPoolEntry[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export async function importProductKeys(
  productId: string,
  payload: { keys?: string[]; text?: string },
): Promise<{ imported: number; skippedDuplicates: number; available: number }> {
  const { data } = await apiClient.post(
    API_ENDPOINTS.admin.importProductKeys(productId),
    payload,
  );
  return data as { imported: number; skippedDuplicates: number; available: number };
}

export async function revokeProductKey(productId: string, keyId: string) {
  const { data } = await apiClient.delete(
    API_ENDPOINTS.admin.revokeProductKey(productId, keyId),
  );
  return data as { message: string; key: string };
}

export type AccountPoolStats = KeyPoolStats;

export type AccountPoolEntry = {
  _id: string;
  username: string;
  password: string;
  note?: string;
  status: string;
  orderId?: string | null;
  soldAt?: string | null;
  createdAt: string;
};

export async function fetchProductAccountStats(
  productId: string,
): Promise<AccountPoolStats> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.productAccountStats(productId));
  return data as AccountPoolStats;
}

export async function fetchProductAccounts(
  productId: string,
  params?: { status?: string; page?: number; limit?: number },
): Promise<{
  items: AccountPoolEntry[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.productAccounts(productId), {
    params,
  });
  return data as {
    items: AccountPoolEntry[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export async function importProductAccounts(
  productId: string,
  payload: { accounts?: string[]; text?: string },
): Promise<{ imported: number; skippedDuplicates: number; available: number }> {
  const { data } = await apiClient.post(
    API_ENDPOINTS.admin.importProductAccounts(productId),
    payload,
  );
  return data as { imported: number; skippedDuplicates: number; available: number };
}

export async function revokeProductAccount(productId: string, accountId: string) {
  const { data } = await apiClient.delete(
    API_ENDPOINTS.admin.revokeProductAccount(productId, accountId),
  );
  return data as { message: string; username: string };
}
