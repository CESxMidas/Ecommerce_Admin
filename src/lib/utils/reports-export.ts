import type { AdminAnalyticsOverview } from "@/types/admin";

function escapeCsv(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportAnalyticsCsv(
  data: AdminAnalyticsOverview,
  range: { from: string; to: string },
) {
  const lines: string[] = [
    "Báo cáo kinh doanh KEYSHOP",
    `Khoảng thời gian,${range.from},${range.to}`,
    "",
    "Chỉ số,Giá trị",
    `Doanh thu,${data.summary.revenue}`,
    `Đơn đã thanh toán,${data.summary.paidOrders}`,
    `Tổng đơn,${data.summary.totalOrders}`,
    `AOV,${data.summary.aov}`,
    `Doanh thu kỳ trước,${data.summary.previousRevenue}`,
    `Thay đổi %,${data.summary.revenueChangePercent}`,
    "",
    "Ngày,Doanh thu,Đơn hàng",
    ...data.revenueByDay.map(
      (row) => `${escapeCsv(row.date)},${row.revenue},${row.orders}`,
    ),
    "",
    "Top sản phẩm,,",
    "Tên,Số lượng,Doanh thu",
    ...data.topProducts.map(
      (row) =>
        `${escapeCsv(row.name)},${row.quantity},${row.revenue}`,
    ),
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bao-cao-${range.from}-${range.to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
