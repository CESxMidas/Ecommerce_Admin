import {
  tOrderStatus,
  tPaymentMethod,
  tPaymentStatus,
} from "@/constants/vi";
import type { AdminOrder } from "@/types/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportOrdersToCsv(orders: AdminOrder[], filenamePrefix = "don-hang") {
  const headers = [
    "Mã đơn",
    "Khách hàng",
    "Email",
    "SĐT",
    "PT thanh toán",
    "TT thanh toán",
    "Tổng tiền",
    "Trạng thái đơn",
    "Ngày tạo",
  ];

  const rows = orders.map((order) => [
    order.orderId,
    order.name,
    order.email,
    order.phone,
    tPaymentMethod(order.paymentMethod),
    tPaymentStatus(order.paymentStatus),
    formatCurrency(order.total, order.currency),
    tOrderStatus(order.status),
    formatDateTime(order.createdAt),
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

export function isOrderInDateRange(
  createdAt: string,
  fromDate: string,
  toDate: string,
) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return true;

  if (fromDate) {
    const from = new Date(`${fromDate}T00:00:00`);
    if (created < from) return false;
  }

  if (toDate) {
    const to = new Date(`${toDate}T23:59:59.999`);
    if (created > to) return false;
  }

  return true;
}
