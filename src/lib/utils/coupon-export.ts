import { tCouponActive, tCouponType, tNoExpiry } from "@/constants/vi";
import type { AdminCoupon } from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportCouponsToCsv(coupons: AdminCoupon[], filenamePrefix = "ma-giam-gia") {
  const headers = [
    "ID",
    "Mã",
    "Loại",
    "Giá trị",
    "Đơn tối thiểu",
    "Đã dùng",
    "Giới hạn",
    "Hết hạn",
    "Trạng thái",
  ];

  const rows = coupons.map((coupon) => [
    coupon.id,
    coupon.code,
    tCouponType(coupon.type),
    coupon.type === "percent" ? `${coupon.value}%` : formatCurrency(coupon.value),
    formatCurrency(coupon.minOrder),
    coupon.usedCount,
    coupon.usageLimit ?? "Không giới hạn",
    coupon.expiresAt ? formatDate(coupon.expiresAt) : tNoExpiry(),
    tCouponActive(coupon.isActive),
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
