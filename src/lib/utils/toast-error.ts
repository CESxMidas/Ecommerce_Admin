import axios from "axios";

type ErrorPattern = { pattern: RegExp; message: string };

const TOAST_ERROR_PATTERNS: ErrorPattern[] = [
  { pattern: /^CredentialsSignin$/i, message: "Email hoặc mật khẩu không đúng" },
  { pattern: /^AccessDenied$/i, message: "Bạn không có quyền truy cập" },
  { pattern: /^Configuration$/i, message: "Cấu hình đăng nhập chưa đúng" },
  { pattern: /^OAuthSignin$/i, message: "Đăng nhập mạng xã hội thất bại" },
  { pattern: /^OAuthCallback$/i, message: "Đăng nhập mạng xã hội thất bại" },
  { pattern: /^AdminAccessRequired$/i, message: "Yêu cầu quyền quản trị. Vui lòng dùng tài khoản Admin." },
  { pattern: /^ADMIN_ACCESS_REQUIRED$/i, message: "Tài khoản này không có quyền quản trị." },
  { pattern: /invalid email or password/i, message: "Email hoặc mật khẩu không đúng" },
  { pattern: /account is not active/i, message: "Tài khoản chưa được kích hoạt" },
  { pattern: /^network error$/i, message: "Không thể kết nối máy chủ. Kiểm tra mạng và thử lại." },
  { pattern: /^request failed$/i, message: "Đã xảy ra lỗi. Vui lòng thử lại." },
  { pattern: /failed to fetch/i, message: "Không thể kết nối máy chủ. Kiểm tra mạng và thử lại." },
  { pattern: /product not found/i, message: "Không tìm thấy sản phẩm" },
  { pattern: /order not found/i, message: "Không tìm thấy đơn hàng" },
  { pattern: /ticket not found/i, message: "Không tìm thấy ticket" },
  { pattern: /review not found/i, message: "Không tìm thấy đánh giá" },
  { pattern: /staff member not found/i, message: "Không tìm thấy nhân viên" },
  { pattern: /invalid order status/i, message: "Trạng thái đơn hàng không hợp lệ" },
  { pattern: /invalid ticket status/i, message: "Trạng thái ticket không hợp lệ" },
  { pattern: /invalid ticket priority/i, message: "Độ ưu tiên ticket không hợp lệ" },
  { pattern: /password must be at least 8 characters/i, message: "Mật khẩu phải có ít nhất 8 ký tự" },
  { pattern: /email already registered/i, message: "Email đã được đăng ký" },
  { pattern: /no valid keys to import/i, message: "Không có key hợp lệ để nhập" },
  { pattern: /no valid accounts to import/i, message: "Không có tài khoản hợp lệ để nhập" },
  { pattern: /reply message is required/i, message: "Vui lòng nhập nội dung phản hồi" },
  { pattern: /not allowed/i, message: "Bạn không có quyền thực hiện thao tác này" },
];

const VIETNAMESE_CHAR_PATTERN =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function translateToastMessage(
  message: string,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  const trimmed = message.trim();

  if (!trimmed) {
    return fallback;
  }

  for (const entry of TOAST_ERROR_PATTERNS) {
    if (entry.pattern.test(trimmed)) {
      return entry.message;
    }
  }

  if (VIETNAMESE_CHAR_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export function getToastErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;

    if (data?.message) {
      return translateToastMessage(data.message, fallback);
    }

    if (error.message) {
      return translateToastMessage(error.message, fallback);
    }
  }

  if (error instanceof Error && error.message) {
    return translateToastMessage(error.message, fallback);
  }

  if (typeof error === "string" && error.trim()) {
    return translateToastMessage(error, fallback);
  }

  return fallback;
}
