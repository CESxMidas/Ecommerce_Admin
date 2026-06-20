import type { CouponType } from "@/types/admin";

export type CouponFormValidationInput = {
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  expiresAt: string;
};

export function validateCouponForm(input: CouponFormValidationInput): string | null {
  const code = input.code.trim().toUpperCase();

  if (!code) {
    return "Mã giảm giá là bắt buộc";
  }

  if (code.length > 40) {
    return "Mã tối đa 40 ký tự";
  }

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    return "Mã chỉ gồm chữ in hoa, số, _ và -";
  }

  if (!Number.isFinite(input.value) || input.value < 0) {
    return "Giá trị giảm phải >= 0";
  }

  if (input.type === "percent" && input.value > 100) {
    return "Giảm % tối đa 100";
  }

  if (!Number.isFinite(input.minOrder) || input.minOrder < 0) {
    return "Đơn tối thiểu phải >= 0";
  }

  if (input.maxDiscount != null && input.maxDiscount < 0) {
    return "Giảm tối đa phải >= 0";
  }

  if (input.usageLimit != null && (!Number.isInteger(input.usageLimit) || input.usageLimit < 1)) {
    return "Giới hạn lượt dùng phải >= 1";
  }

  if (input.expiresAt) {
    const date = new Date(input.expiresAt);
    if (Number.isNaN(date.getTime())) {
      return "Ngày hết hạn không hợp lệ";
    }
  }

  return null;
}

export function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
