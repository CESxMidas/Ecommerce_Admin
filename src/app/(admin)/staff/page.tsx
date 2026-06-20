import type { Metadata } from "next";

import StaffView from "@/components/admin/staff/staff-view";

export const metadata: Metadata = { title: "Nhân viên" };

export default function StaffPage() {
  return <StaffView />;
}
