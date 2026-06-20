import type { Metadata } from "next";

import TicketsView from "@/components/admin/tickets/tickets-view";

export const metadata: Metadata = { title: "Hỗ trợ khách hàng" };

export default function TicketsPage() {
  return <TicketsView />;
}
