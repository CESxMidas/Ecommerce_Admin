import { tPublished } from "@/constants/vi";
import type { AdminBlog } from "@/types/admin";
import { formatDate } from "@/lib/utils/format";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportBlogsToCsv(blogs: AdminBlog[], filenamePrefix = "bai-viet") {
  const headers = ["ID", "Tiêu đề", "Danh mục", "Ngày xuất bản", "Trạng thái", "Mô tả"];

  const rows = blogs.map((blog) => [
    blog.id,
    blog.title,
    blog.category,
    formatDate(blog.publishedAt),
    tPublished(blog.isActive),
    blog.description,
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
