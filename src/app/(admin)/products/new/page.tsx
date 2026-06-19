import type { Metadata } from "next";

import ProductFormView from "@/components/admin/products/product-form-view";

export const metadata: Metadata = {
  title: "Thêm sản phẩm",
};

export default function NewProductPage() {
  return <ProductFormView />;
}
