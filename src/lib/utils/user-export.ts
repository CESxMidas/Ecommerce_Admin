import { tAuthProvider, tRole, tUserStatus, tVerified } from "@/constants/vi";
import type { AdminUser } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportUsersToCsv(users: AdminUser[], filenamePrefix = "nguoi-dung") {
  const headers = [
    "ID",
    "Tên",
    "Email",
    "Vai trò",
    "Trạng thái",
    "Xác minh email",
    "Nguồn đăng nhập",
    "Số đơn",
    "Ngày tham gia",
  ];

  const rows = users.map((user) => [
    user.id,
    user.name,
    user.email,
    tRole(user.role),
    tUserStatus(user.status),
    tVerified(user.verifyEmail),
    tAuthProvider(user.authProvider),
    user.orderCount,
    formatDateTime(user.createdAt),
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
