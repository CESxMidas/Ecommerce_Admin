import type { Metadata } from "next";

import AuditView from "@/components/admin/audit/audit-view";

export const metadata: Metadata = { title: "Nhật ký hệ thống" };

export default function AuditPage() {
  return <AuditView />;
}
