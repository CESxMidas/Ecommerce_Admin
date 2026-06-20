/** Nhãn tiếng Việt — production */

export const ORDER_STATUS_VI: Record<string, string> = {
  PendingPayment: "Chờ thanh toán",
  Processing: "Đang xử lý",
  Shipped: "Đã giao hàng",
  Delivered: "Hoàn thành",
  Cancelled: "Đã hủy",
  Failed: "Thất bại",
  Refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_VI: Record<string, string> = {
  paid: "Đã thanh toán",
  pending: "Chờ thanh toán",
  awaiting_cod: "Chờ COD",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export const PRODUCT_TYPE_VI: Record<string, string> = {
  license_key: "Mã license",
  redeem_code: "Mã nạp",
  account: "Tài khoản",
  manual_service: "Dịch vụ thủ công",
  hardware: "Phần cứng",
};

export const DELIVERY_TYPE_VI: Record<string, string> = {
  instant_key: "Giao key tức thì",
  account_credentials: "Thông tin tài khoản",
  manual_delivery: "Giao thủ công",
  physical: "Vật lý",
};

export function tOrderStatus(status: string) {
  return ORDER_STATUS_VI[status] ?? status;
}

export function tPaymentStatus(status: string) {
  return PAYMENT_STATUS_VI[status] ?? status;
}

export function tProductType(type: string) {
  return PRODUCT_TYPE_VI[type] ?? type;
}

export function tDeliveryType(type: string) {
  return DELIVERY_TYPE_VI[type] ?? type;
}

export const KEY_STATUS_VI: Record<string, string> = {
  available: "Khả dụng",
  reserved: "Đang giữ",
  sold: "Đã bán",
  revoked: "Thu hồi",
};

export function tKeyStatus(status: string) {
  return KEY_STATUS_VI[status] ?? status;
}

export function tActive(isActive: boolean) {
  return isActive ? "Đang bán" : "Ngừng bán";
}

export function tPublished(isActive: boolean) {
  return isActive ? "Đã xuất bản" : "Bản nháp";
}

export function tCouponActive(isActive: boolean) {
  return isActive ? "Đang hoạt động" : "Đã hết hạn";
}

export function tRole(role: string) {
  return role === "ADMIN" ? "Quản trị viên" : "Khách hàng";
}

export function tVerified(verified: boolean) {
  return verified ? "Đã xác minh" : "Chưa xác minh";
}

export function tAuthProvider(provider: string) {
  return provider === "google" ? "Google" : "Email";
}

export const USER_STATUS_VI: Record<string, string> = {
  Active: "Hoạt động",
  Inactive: "Không hoạt động",
  Suspended: "Đình chỉ",
};

export function tUserStatus(status: string) {
  return USER_STATUS_VI[status] ?? status;
}

export function userStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "Active") return "success";
  if (status === "Inactive") return "neutral";
  if (status === "Suspended") return "danger";
  return "neutral";
}

export function tGender(gender: string) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  if (gender === "other") return "Khác";
  return "—";
}

export function tPlacement(placement: string) {
  return placement === "home_slider" ? "Slider trang chủ" : "Quảng cáo";
}

export function tCouponType(type: string) {
  return type === "percent" ? "Phần trăm" : "Số tiền cố định";
}

export function tNoExpiry() {
  return "Không giới hạn";
}

export const PAYMENT_METHOD_VI: Record<string, string> = {
  vnpay: "VNPay",
  momo: "MoMo",
  cod: "Thanh toán khi nhận (COD)",
  stripe: "Stripe",
  paypal: "PayPal",
  bank_transfer: "Chuyển khoản",
};

export function tPaymentMethod(method: string) {
  return PAYMENT_METHOD_VI[method.toLowerCase()] ?? method;
}

export const MONTH_SHORT_VI = [
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
] as const;

export function tMonthShort(index: number) {
  return MONTH_SHORT_VI[index] ?? `T${index + 1}`;
}
