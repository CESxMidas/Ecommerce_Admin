import type { Metadata } from "next";

import CouponsView from "@/components/admin/coupons/coupons-view";

export const metadata: Metadata = { title: "Mã giảm giá" };

export default function CouponsPage() {
  return <CouponsView />;
}
