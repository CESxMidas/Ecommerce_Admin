import type { Metadata } from "next";

import BannersView from "@/components/admin/banners/banners-view";

export const metadata: Metadata = { title: "Banner" };

export default function BannersPage() {
  return <BannersView />;
}
