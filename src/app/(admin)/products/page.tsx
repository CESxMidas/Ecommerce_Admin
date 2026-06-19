import type { Metadata } from "next";

import ProductsListView from "@/components/admin/products/products-list-view";

export const metadata: Metadata = {
  title: "Sản phẩm",
};

export default function ProductsPage() {
  return <ProductsListView />;
}
