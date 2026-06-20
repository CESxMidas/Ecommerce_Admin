import type { Metadata } from "next";
import { Suspense } from "react";

import OrdersView from "@/components/admin/orders/orders-view";
import AdminLoading from "@/components/admin/admin-loading";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function OrdersPage() {
  return (
    <Suspense fallback={<AdminLoading label="Đang tải đơn hàng..." />}>
      <OrdersView />
    </Suspense>
  );
}
