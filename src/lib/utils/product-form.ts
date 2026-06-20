import type { AdminProduct, DeliveryType, ProductType } from "@/types/admin";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function defaultDeliveryType(productType: ProductType): DeliveryType {
  if (productType === "hardware") return "physical";
  if (productType === "license_key" || productType === "redeem_code") {
    return "instant_key";
  }
  if (productType === "account") return "account_credentials";
  return "manual_delivery";
}

export function isPoolProductType(productType: ProductType, deliveryType: DeliveryType) {
  return (
    ["license_key", "redeem_code"].includes(productType) &&
    deliveryType === "instant_key"
  );
}

export function computeStockBarMax(stock: number) {
  if (stock <= 0) return 100;
  return Math.max(100, Math.ceil(stock * 1.25));
}

export function getDeliveryTypeMismatchMessage(
  productType: ProductType,
  deliveryType: DeliveryType,
): string | null {
  if (productType === "hardware" && deliveryType !== "physical") {
    return "Phần cứng phải dùng hình thức giao hàng vật lý.";
  }

  if (productType === "account" && deliveryType !== "account_credentials") {
    return "Sản phẩm tài khoản phải dùng giao hàng thông tin tài khoản.";
  }

  if (productType === "manual_service" && deliveryType !== "manual_delivery") {
    return "Dịch vụ thủ công phải dùng giao hàng thủ công.";
  }

  if (
    (productType === "license_key" || productType === "redeem_code") &&
    deliveryType !== "instant_key"
  ) {
    return "Mã license/nạp phải dùng giao key tức thì để bật kho key.";
  }

  return null;
}

export type ProductFormValidationInput = {
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  categoryId: string;
  productType: ProductType;
  deliveryType: DeliveryType;
  existingProducts?: AdminProduct[];
  currentProductId?: number;
};

export function validateProductForm(input: ProductFormValidationInput): string | null {
  const name = input.name.trim();
  const slug = input.slug.trim();

  if (!name) {
    return "Tên sản phẩm là bắt buộc";
  }

  if (!slug) {
    return "Đường dẫn (slug) là bắt buộc";
  }

  if (!input.categoryId) {
    return "Vui lòng chọn danh mục sản phẩm";
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    return "Giá bán không hợp lệ";
  }

  if (
    input.discountPrice != null &&
    (!Number.isFinite(input.discountPrice) || input.discountPrice < 0)
  ) {
    return "Giá khuyến mãi không hợp lệ";
  }

  if (input.discountPrice != null && input.discountPrice >= input.price) {
    return "Giá khuyến mãi phải nhỏ hơn giá bán";
  }

  const deliveryMismatch = getDeliveryTypeMismatchMessage(
    input.productType,
    input.deliveryType,
  );
  if (deliveryMismatch) {
    return deliveryMismatch;
  }

  const duplicateSlug = input.existingProducts?.find(
    (product) =>
      product.slug === slug &&
      product.productId !== input.currentProductId,
  );
  if (duplicateSlug) {
    return `Slug "${slug}" đã được dùng bởi sản phẩm khác`;
  }

  return null;
}

export function parseKeyImportText(text: string) {
  return text
    .split(/\r?\n|,|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseKeyImportFileContent(content: string) {
  const lines = content.split(/\r?\n/);
  const keys: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes(",")) {
      const cells = trimmed.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
      const candidate = cells.find((cell) => cell.length >= 4) || cells[0];
      if (candidate) keys.push(candidate);
      continue;
    }

    keys.push(trimmed);
  }

  return keys;
}
