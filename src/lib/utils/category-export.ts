import { tActive } from "@/constants/vi";
import type { AdminCategory } from "@/types/admin";
import { getCategoryParentName } from "@/lib/utils/category-form";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportCategoriesToCsv(
  categories: AdminCategory[],
  filenamePrefix = "danh-muc",
) {
  const headers = [
    "ID",
    "Tên",
    "Slug",
    "Danh mục cha",
    "Sản phẩm",
    "Thứ tự",
    "Trạng thái",
  ];

  const rows = categories.map((category) => [
    category.categoryId,
    category.name,
    category.slug,
    getCategoryParentName(categories, category.parentId) || "",
    category.productCount,
    category.sortOrder,
    tActive(category.isActive),
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
