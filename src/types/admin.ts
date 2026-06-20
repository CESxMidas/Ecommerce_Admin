/** Admin UI types — aligned with Ecommerce_Backend Mongoose models */

export type ProductType =
  | "license_key"
  | "redeem_code"
  | "account"
  | "manual_service"
  | "hardware";

export type DeliveryType =
  | "instant_key"
  | "account_credentials"
  | "manual_delivery"
  | "physical";

export type OrderStatus =
  | "PendingPayment"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Failed"
  | "Refunded";

export type PaymentStatus =
  | "paid"
  | "pending"
  | "awaiting_cod"
  | "failed"
  | "refunded";

export type CouponType = "percent" | "fixed";

export type BannerPlacement = "home_slider" | "ads";

export type StaffRole = "OWNER" | "MANAGER" | "STAFF" | "ADMIN";
export type AssignableStaffRole = "MANAGER" | "STAFF";
export type UserRole = StaffRole | "USER";

export interface AdminProduct {
  id: string;
  productId: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  thumbnail: string;
  images: string[];
  categoryId: number | null;
  categoryName: string;
  price: number;
  discountPrice: number | null;
  currency: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  productType: ProductType;
  deliveryType: DeliveryType;
  requiresOnlinePayment: boolean;
  keyPrefix: string;
  seoTitle: string;
  seoDescription: string;
  usesKeyPool?: boolean;
  isActive: boolean;
}

export type ProductWritePayload = {
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  price: number;
  discountPrice?: number | null;
  currency?: string;
  stock?: number;
  categoryId?: number | null;
  categoryName?: string;
  images?: string[];
  thumbnail?: string;
  productType?: ProductType;
  deliveryType?: DeliveryType;
  requiresOnlinePayment?: boolean;
  keyPrefix?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive?: boolean;
};

export interface AdminOrderItem {
  productId: number;
  name: string;
  thumbnail: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
}

export interface AdminOrder {
  orderId: string;
  paymentId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  createdAt: string;
  items: AdminOrderItem[];
}

export interface AdminCategory {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  parentId: number | null;
  parentName?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export type CategoryWritePayload = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
};

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  placement: BannerPlacement;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminBlog {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  publishedAt: string;
  isActive: boolean;
}

export type BannerWritePayload = {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  placement?: BannerPlacement;
  sortOrder?: number;
  isActive?: boolean;
};

export type CouponWritePayload = {
  code: string;
  type?: CouponType;
  value: number;
  minOrder?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

export type BlogWritePayload = {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  isActive?: boolean;
};

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  verifyEmail: boolean;
  authProvider: "local" | "google";
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
  orderCount: number;
}

export type UserWritePayload = {
  status?: "Active" | "Inactive" | "Suspended";
};

export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: StaffRole;
  status: "Active" | "Inactive" | "Suspended";
  verifyEmail: boolean;
  authProvider: "local" | "google";
  createdAt: string;
  lastLoginAt: string | null;
}

export type StaffCreatePayload = {
  name: string;
  email: string;
  password: string;
  role: AssignableStaffRole;
};

export type StaffUpdatePayload = {
  name?: string;
  role?: AssignableStaffRole;
  status?: "Active" | "Inactive" | "Suspended";
};

export interface AdminUserDetail extends AdminUser {
  mobile: string;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  gender: string;
  dateOfBirth: string | null;
}

export type AdminUserDetailData = {
  user: AdminUserDetail;
  orders: AdminOrder[];
  orderStats: {
    total: number;
    paid: number;
    totalSpent: number;
  };
};

export interface AdminDashboardStats {
  users: number;
  products: number;
  orders: number;
  categories: number;
  coupons: number;
  revenue?: number;
}

export interface AdminChartPoint {
  name: string;
  revenue: number;
  orders: number;
}

export interface AdminAnalyticsOverview {
  range: {
    from: string;
    to: string;
  };
  summary: {
    revenue: number;
    paidOrders: number;
    totalOrders: number;
    aov: number;
    previousRevenue: number;
    previousPaidOrders: number;
    revenueChangePercent: number;
  };
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: number;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface AdminSiteSettings {
  siteName: string;
  logoAlt: string;
  logoUrl: string;
  faviconUrl: string;
  updatedAt: string | null;
}

export type SiteSettingsWritePayload = Partial<
  Pick<AdminSiteSettings, "siteName" | "logoAlt" | "logoUrl" | "faviconUrl">
>;

export type StaffPasswordPayload = {
  password: string;
};

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high";

export interface AdminTicketReply {
  id: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface AdminTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  replies: AdminTicketReply[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminSearchResult {
  type: "product" | "order" | "user";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface AdminAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  count?: number;
}
