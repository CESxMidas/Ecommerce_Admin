import { resolveMediaUrl } from "@/lib/utils/media";
import type {
  AdminBanner,
  AdminBlog,
  AdminCategory,
  AdminChartPoint,
  AdminCoupon,
  AdminDashboardStats,
  AdminOrder,
  AdminOrderItem,
  AdminProduct,
  AdminStaff,
  AdminUser,
  AdminUserDetail,
  BannerPlacement,
  CouponType,
  DeliveryType,
  OrderStatus,
  PaymentStatus,
  ProductType,
  StaffRole,
  UserRole,
} from "@/types/admin";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = ""): string {
  return value != null ? String(value) : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asBool(value: unknown, fallback = false): boolean {
  return value === undefined ? fallback : Boolean(value);
}

export function normalizeProduct(raw: unknown): AdminProduct {
  const doc = asRecord(raw);
  const id = asString(doc.id ?? doc.productId ?? doc._id);
  const thumbnail = resolveMediaUrl(
    asString(doc.thumbnail || doc.image || asArray<string>(doc.images)[0]),
  );

  return {
    id,
    productId: asNumber(doc.productId ?? doc.id),
    name: asString(doc.name || doc.title),
    slug: asString(doc.slug),
    sku: asString(doc.sku),
    description: asString(doc.description),
    thumbnail,
    images: asArray<string>(doc.images).map((url) => resolveMediaUrl(url)),
    categoryId:
      doc.categoryId != null && doc.categoryId !== ""
        ? asNumber(doc.categoryId)
        : null,
    categoryName: asString(doc.categoryName),
    price: asNumber(doc.price),
    discountPrice: asNullableNumber(doc.discountPrice ?? doc.salePrice),
    currency: asString(doc.currency, "VND"),
    stock: asNumber(doc.stock),
    rating: asNumber(doc.rating),
    reviewsCount: asNumber(doc.reviewsCount),
    productType: asString(doc.productType, "manual_service") as ProductType,
    deliveryType: asString(doc.deliveryType, "manual_delivery") as DeliveryType,
    requiresOnlinePayment: doc.requiresOnlinePayment !== false,
    keyPrefix: asString(doc.keyPrefix),
    seoTitle: asString(doc.seoTitle),
    seoDescription: asString(doc.seoDescription),
    usesKeyPool: Boolean(doc.usesKeyPool) || undefined,
    isActive: doc.isActive !== false,
  };
}

export function normalizeProducts(raw: unknown): AdminProduct[] {
  return asArray<unknown>(raw).map(normalizeProduct);
}

export function normalizeOrderItem(raw: unknown): AdminOrderItem {
  const doc = asRecord(raw);
  const product = asRecord(doc.product);

  return {
    productId: asNumber(doc.productId),
    name: asString(product.name || product.title, `Sản phẩm #${doc.productId}`),
    thumbnail: resolveMediaUrl(asString(product.thumbnail || product.image)),
    quantity: asNumber(doc.quantity, 1),
    unitPrice: asNumber(doc.unitPrice),
    lineTotal: asNumber(doc.lineTotal),
    currency: asString(doc.currency, "VND"),
  };
}

export function normalizeOrder(raw: unknown): AdminOrder {
  const doc = asRecord(raw);

  return {
    orderId: asString(doc.id ?? doc.orderId),
    paymentId: asString(doc.paymentId),
    name: asString(doc.name),
    phone: asString(doc.phone),
    email: asString(doc.email),
    address: asString(doc.address),
    total: asNumber(doc.total),
    currency: asString(doc.currency, "VND"),
    status: asString(doc.status, "PendingPayment") as OrderStatus,
    paymentMethod: asString(doc.paymentMethod),
    paymentStatus: asString(doc.paymentStatus, "pending") as PaymentStatus,
    couponCode: doc.couponCode ? asString(doc.couponCode) : undefined,
    createdAt: doc.createdAt
      ? new Date(asString(doc.createdAt)).toISOString()
      : new Date().toISOString(),
    items: asArray<unknown>(doc.items).map(normalizeOrderItem),
  };
}

export function normalizeOrders(raw: unknown): AdminOrder[] {
  return asArray<unknown>(raw).map(normalizeOrder);
}

export function normalizeCategory(
  raw: unknown,
  parentNameMap: Map<string, string> = new Map(),
): AdminCategory {
  const doc = asRecord(raw);
  const categoryId = asNumber(doc.categoryId ?? doc.id);
  const parentIdRaw = doc.parentId;

  return {
    id: asString(doc.id ?? doc.categoryId),
    categoryId,
    name: asString(doc.name),
    slug: asString(doc.slug),
    image: resolveMediaUrl(asString(doc.image), ""),
    description: asString(doc.description),
    parentId:
      parentIdRaw != null && parentIdRaw !== ""
        ? asNumber(parentIdRaw)
        : null,
    parentName:
      parentIdRaw != null && parentIdRaw !== ""
        ? parentNameMap.get(asString(parentIdRaw))
        : undefined,
    sortOrder: asNumber(doc.sortOrder),
    isActive: doc.isActive !== false,
    productCount: asNumber(doc.productCount),
  };
}

export function normalizeCategories(raw: unknown): AdminCategory[] {
  const rows = asArray<unknown>(raw);
  const nameMap = new Map<string, string>();

  rows.forEach((row) => {
    const doc = asRecord(row);
    nameMap.set(asString(doc.id ?? doc.categoryId), asString(doc.name));
  });

  return rows.map((row) => normalizeCategory(row, nameMap));
}

export function normalizeUser(raw: unknown): AdminUser {
  const doc = asRecord(raw);

  return {
    id: asString(doc.id ?? doc._id),
    name: asString(doc.name),
    email: asString(doc.email),
    avatar: resolveMediaUrl(asString(doc.avatar), ""),
    role: asString(doc.role, "USER") as UserRole,
    verifyEmail: Boolean(doc.verifyEmail ?? doc.verify_email),
    authProvider: asString(doc.authProvider, "local") as AdminUser["authProvider"],
    status: asString(doc.status, "Active") as AdminUser["status"],
    createdAt: doc.createdAt
      ? new Date(asString(doc.createdAt)).toISOString()
      : new Date().toISOString(),
    orderCount: asNumber(doc.orderCount),
  };
}

export function normalizeUsers(raw: unknown): AdminUser[] {
  return asArray<unknown>(raw).map(normalizeUser);
}

export function normalizeStaff(raw: unknown): AdminStaff {
  const doc = asRecord(raw);

  return {
    id: asString(doc.id ?? doc._id),
    name: asString(doc.name),
    email: asString(doc.email),
    avatar: resolveMediaUrl(asString(doc.avatar), ""),
    role: asString(doc.role, "STAFF") as StaffRole,
    verifyEmail: Boolean(doc.verifyEmail ?? doc.verify_email),
    authProvider: asString(doc.authProvider, "local") as AdminStaff["authProvider"],
    status: asString(doc.status, "Active") as AdminStaff["status"],
    createdAt: doc.createdAt
      ? new Date(asString(doc.createdAt)).toISOString()
      : new Date().toISOString(),
    lastLoginAt: doc.lastLoginAt
      ? new Date(asString(doc.lastLoginAt)).toISOString()
      : doc.last_login_date
        ? new Date(asString(doc.last_login_date)).toISOString()
        : null,
  };
}

export function normalizeStaffList(raw: unknown): AdminStaff[] {
  return asArray<unknown>(raw).map(normalizeStaff);
}

export function normalizeUserDetail(raw: unknown): AdminUserDetail {
  const doc = asRecord(raw);

  return {
    ...normalizeUser(raw),
    mobile: asString(doc.mobile),
    phoneVerified: Boolean(doc.phoneVerified),
    twoFactorEnabled: Boolean(doc.twoFactorEnabled),
    lastLoginAt: doc.lastLoginAt
      ? new Date(asString(doc.lastLoginAt)).toISOString()
      : null,
    gender: asString(doc.gender),
    dateOfBirth: doc.dateOfBirth
      ? new Date(asString(doc.dateOfBirth)).toISOString()
      : null,
  };
}

export function normalizeBanner(raw: unknown): AdminBanner {
  const doc = asRecord(raw);

  return {
    id: asString(doc._id ?? doc.id),
    title: asString(doc.title),
    subtitle: asString(doc.subtitle),
    image: resolveMediaUrl(asString(doc.image)),
    link: asString(doc.link),
    placement: asString(doc.placement, "home_slider") as BannerPlacement,
    sortOrder: asNumber(doc.sortOrder),
    isActive: asBool(doc.isActive, true),
  };
}

export function normalizeBanners(raw: unknown): AdminBanner[] {
  return asArray<unknown>(raw).map(normalizeBanner);
}

export function normalizeBlog(raw: unknown): AdminBlog {
  const doc = asRecord(raw);

  return {
    id: asString(doc._id ?? doc.id),
    title: asString(doc.title),
    description: asString(doc.description),
    image: resolveMediaUrl(asString(doc.image), ""),
    category: asString(doc.category),
    publishedAt: doc.publishedAt
      ? new Date(asString(doc.publishedAt)).toISOString()
      : new Date().toISOString(),
    isActive: asBool(doc.isActive, true),
  };
}

export function normalizeBlogs(raw: unknown): AdminBlog[] {
  return asArray<unknown>(raw).map(normalizeBlog);
}

export function normalizeCoupon(raw: unknown): AdminCoupon {
  const doc = asRecord(raw);

  return {
    id: asString(doc._id ?? doc.id),
    code: asString(doc.code),
    type: asString(doc.type, "percent") as CouponType,
    value: asNumber(doc.value),
    minOrder: asNumber(doc.minOrder),
    maxDiscount: asNullableNumber(doc.maxDiscount),
    usageLimit: asNullableNumber(doc.usageLimit),
    usedCount: asNumber(doc.usedCount),
    expiresAt: doc.expiresAt
      ? new Date(asString(doc.expiresAt)).toISOString()
      : null,
    isActive: asBool(doc.isActive, true),
  };
}

export function normalizeCoupons(raw: unknown): AdminCoupon[] {
  return asArray<unknown>(raw).map(normalizeCoupon);
}

export function normalizeDashboardStats(raw: unknown): AdminDashboardStats {
  const doc = asRecord(raw);

  return {
    users: asNumber(doc.users),
    products: asNumber(doc.products),
    orders: asNumber(doc.orders),
    categories: asNumber(doc.categories),
    coupons: asNumber(doc.coupons),
    ...(doc.revenue != null ? { revenue: asNumber(doc.revenue) } : {}),
  };
}

const MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

export function buildChartFromOrders(orders: AdminOrder[]): AdminChartPoint[] {
  const buckets = new Map<string, { revenue: number; orders: number }>();

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = buckets.get(key) ?? { revenue: 0, orders: 0 };
    current.orders += 1;

    if (order.paymentStatus === "paid") {
      current.revenue += order.total;
    }

    buckets.set(key, current);
  });

  const sortedKeys = Array.from(buckets.keys()).sort();
  const recentKeys = sortedKeys.slice(-7);

  if (recentKeys.length === 0) {
    return MONTH_LABELS.slice(0, 7).map((name) => ({
      name,
      revenue: 0,
      orders: 0,
    }));
  }

  return recentKeys.map((key) => {
    const [, month] = key.split("-");
    const bucket = buckets.get(key)!;

    return {
      name: MONTH_LABELS[Number(month) - 1] ?? `T${month}`,
      revenue: bucket.revenue,
      orders: bucket.orders,
    };
  });
}
