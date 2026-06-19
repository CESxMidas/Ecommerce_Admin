import ProductKeysView from "@/components/admin/products/product-keys-view";

type Props = {
  params: { id: string };
};

export default function ProductKeysPage({ params }: Props) {
  return <ProductKeysView productId={params.id} />;
}
