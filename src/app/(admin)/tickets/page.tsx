import type { Metadata } from "next";
import { Suspense } from "react";

import AdminLoading from "@/components/admin/admin-loading";
import TicketsView from "@/components/admin/tickets/tickets-view";

export const metadata: Metadata = { title: "Hỗ trợ khách hàng" };

export default function TicketsPage() {
  return (
    <Suspense fallback={<AdminLoading label="Đang tải ticket..." />}>
      <TicketsView />
    </Suspense>
  );
}
