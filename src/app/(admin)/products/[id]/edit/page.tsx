import type { Metadata } from "next";

import ProductFormView from "@/components/admin/products/product-form-view";

export const metadata: Metadata = {
  title: "Sửa sản phẩm",
};

type EditProductPageProps = {
  params: { id: string };
};

export default function EditProductPage({ params }: EditProductPageProps) {
  return <ProductFormView productId={params.id} />;
}
