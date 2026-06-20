import { tActive, tPlacement } from "@/constants/vi";
import type { AdminBanner } from "@/types/admin";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportBannersToCsv(banners: AdminBanner[], filenamePrefix = "banner") {
  const headers = ["ID", "Tiêu đề", "Phụ đề", "Vị trí", "Thứ tự", "Trạng thái", "Liên kết"];

  const rows = banners.map((banner) => [
    banner.id,
    banner.title,
    banner.subtitle,
    tPlacement(banner.placement),
    banner.sortOrder,
    tActive(banner.isActive),
    banner.link,
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
