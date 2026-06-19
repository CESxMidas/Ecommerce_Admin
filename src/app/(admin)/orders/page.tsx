import type { Metadata } from "next";

import OrdersView from "@/components/admin/orders/orders-view";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function OrdersPage() {
  return <OrdersView />;
}
