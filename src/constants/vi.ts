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
  license_key: "Key bản quyền",
  redeem_code: "Mã nạp",
  account: "Tài khoản Pro",
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
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return "Chủ shop";
    case "MANAGER":
      return "Quản lý";
    case "STAFF":
      return "Nhân viên";
    default:
      return "Khách hàng";
  }
}

export function staffRoleTone(role: string): "info" | "success" | "warning" | "neutral" {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return "info";
    case "MANAGER":
      return "success";
    case "STAFF":
      return "warning";
    default:
      return "neutral";
  }
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

const TICKET_STATUS_VI: Record<string, string> = {
  open: "Mới",
  pending: "Chờ khách",
  resolved: "Đã xử lý",
  closed: "Đóng",
};

const TICKET_PRIORITY_VI: Record<string, string> = {
  low: "Thấp",
  normal: "Bình thường",
  high: "Cao",
};

export function tTicketStatus(status: string) {
  return TICKET_STATUS_VI[status] ?? status;
}

export function tTicketPriority(priority: string) {
  return TICKET_PRIORITY_VI[priority] ?? priority;
}

export function ticketStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" | "info" {
  if (status === "resolved") return "success";
  if (status === "closed") return "neutral";
  if (status === "pending") return "warning";
  return "info";
}

export function ticketPriorityTone(
  priority: string,
): "success" | "warning" | "danger" | "neutral" | "info" {
  if (priority === "high") return "danger";
  if (priority === "low") return "neutral";
  return "info";
}

export const AUDIT_ENTITY_TYPE_VI: Record<string, string> = {
  order: "Đơn hàng",
  ticket: "Hỗ trợ",
  review: "Đánh giá",
  product: "Sản phẩm",
  category: "Danh mục",
  banner: "Banner",
  blog: "Bài viết",
  coupon: "Mã giảm giá",
  settings: "Cài đặt",
  product_keys: "Kho key",
  product_accounts: "Kho tài khoản",
  staff: "Nhân viên",
  customer: "Khách hàng",
  content_revision: "Duyệt nội dung",
};

export const AUDIT_ACTION_VI: Record<string, string> = {
  "order.status_change": "Đổi trạng thái đơn",
  "ticket.update": "Cập nhật ticket",
  "ticket.reply": "Trả lời ticket",
  "review.hide": "Ẩn đánh giá",
  "review.unhide": "Hiện đánh giá",
  "review.delete": "Xóa đánh giá",
  "product.create": "Tạo sản phẩm",
  "product.update": "Cập nhật sản phẩm",
  "product.deactivate": "Ngừng sản phẩm",
  "category.create": "Tạo danh mục",
  "category.update": "Cập nhật danh mục",
  "category.deactivate": "Ngừng danh mục",
  "banner.create": "Tạo banner",
  "banner.update": "Cập nhật banner",
  "banner.deactivate": "Ngừng banner",
  "blog.create": "Tạo bài viết",
  "blog.update": "Cập nhật bài viết",
  "blog.deactivate": "Ngừng bài viết",
  "coupon.create": "Tạo mã giảm giá",
  "coupon.update": "Cập nhật mã giảm giá",
  "coupon.deactivate": "Ngừng mã giảm giá",
  "settings.update": "Cập nhật cài đặt",
  "keys.import": "Import key",
  "keys.revoke": "Thu hồi key",
  "accounts.import": "Import tài khoản",
  "accounts.revoke": "Thu hồi tài khoản",
  "staff.create": "Tạo nhân viên",
  "staff.update": "Cập nhật nhân viên",
  "staff.reset_password": "Đặt lại mật khẩu NV",
  "customer.update": "Cập nhật khách hàng",
  "content.submit_review": "Gửi duyệt nội dung",
  "content.approve": "Duyệt nội dung",
  "content.reject": "Từ chối nội dung",
};

export const AUDIT_ENTITY_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "order", label: "Đơn hàng" },
  { value: "ticket", label: "Hỗ trợ" },
  { value: "review", label: "Đánh giá" },
  { value: "product", label: "Sản phẩm" },
  { value: "category", label: "Danh mục" },
  { value: "banner", label: "Banner" },
  { value: "blog", label: "Bài viết" },
  { value: "coupon", label: "Mã giảm giá" },
  { value: "settings", label: "Cài đặt" },
  { value: "product_keys", label: "Kho key" },
  { value: "product_accounts", label: "Kho tài khoản" },
  { value: "staff", label: "Nhân viên" },
  { value: "customer", label: "Khách hàng" },
  { value: "content_revision", label: "Duyệt nội dung" },
] as const;

export const REVISION_STATUS_VI: Record<string, string> = {
  draft: "Bản nháp",
  pending_review: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
  superseded: "Đã thay thế",
};

export const REVISION_CHANGE_TYPE_VI: Record<string, string> = {
  create: "Tạo mới",
  update: "Cập nhật",
  deactivate: "Ngừng hiển thị",
};

export function tRevisionStatus(status: string) {
  return REVISION_STATUS_VI[status] ?? status;
}

export function tRevisionChangeType(changeType: string) {
  return REVISION_CHANGE_TYPE_VI[changeType] ?? changeType;
}

export const REVISION_ENTITY_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "product", label: "Sản phẩm" },
  { value: "category", label: "Danh mục" },
  { value: "banner", label: "Banner" },
  { value: "blog", label: "Bài viết" },
  { value: "coupon", label: "Mã giảm giá" },
] as const;

export const REVISION_STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "all", label: "Tất cả trạng thái" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "draft", label: "Bản nháp" },
] as const;

export function revisionStatusTone(
  status: string,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "pending_review":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "draft":
      return "info";
    default:
      return "neutral";
  }
}

export function tAuditEntityType(entityType: string) {
  return AUDIT_ENTITY_TYPE_VI[entityType] ?? entityType;
}

export function tAuditAction(action: string) {
  return AUDIT_ACTION_VI[action] ?? action;
}

