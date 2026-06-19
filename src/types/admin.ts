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

export type UserRole = "USER" | "ADMIN";

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
  createdAt: string;
  orderCount: number;
}

export interface AdminDashboardStats {
  users: number;
  products: number;
  orders: number;
  categories: number;
  coupons: number;
  revenue: number;
}

export interface AdminChartPoint {
  name: string;
  revenue: number;
  orders: number;
}
