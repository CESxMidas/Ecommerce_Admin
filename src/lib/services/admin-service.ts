import apiClient from "@/lib/api/client";
import {
  buildChartFromOrders,
  normalizeBanners,
  normalizeBlogs,
  normalizeCategories,
  normalizeCoupons,
  normalizeDashboardStats,
  normalizeOrder,
  normalizeOrders,
  normalizeProduct,
  normalizeProducts,
} from "@/lib/api/normalizers";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  AdminBanner,
  AdminBlog,
  AdminCategory,
  AdminChartPoint,
  AdminCoupon,
  AdminDashboardStats,
  AdminOrder,
  AdminProduct,
  ProductWritePayload,
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

export async function fetchOrders(): Promise<AdminOrder[]> {
  const { data } = await apiClient.get(`${API_ENDPOINTS.orders.list}?all=true`);
  return normalizeOrders(data);
}

export async function fetchBanners(): Promise<AdminBanner[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.banners);
  return normalizeBanners(data);
}

export async function fetchBlogs(): Promise<AdminBlog[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.blogs);
  return normalizeBlogs(data);
}

export async function fetchCoupons(): Promise<AdminCoupon[]> {
  const { data } = await apiClient.get(API_ENDPOINTS.admin.coupons);
  return normalizeCoupons(data);
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
