import { tActive, tDeliveryType, tProductType } from "@/constants/vi";
import type { AdminProduct } from "@/types/admin";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportProductsToCsv(products: AdminProduct[], filenamePrefix = "san-pham") {
  const headers = [
    "ID",
    "Tên",
    "Slug",
    "SKU",
    "Danh mục",
    "Loại",
    "Giao hàng",
    "Giá",
    "Giá KM",
    "Tồn kho",
    "Đánh giá",
    "Trạng thái",
  ];

  const rows = products.map((product) => [
    product.productId,
    product.name,
    product.slug,
    product.sku,
    product.categoryName,
    tProductType(product.productType),
    tDeliveryType(product.deliveryType),
    product.price,
    product.discountPrice ?? "",
    product.stock,
    `${product.rating} (${product.reviewsCount})`,
    tActive(product.isActive),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
