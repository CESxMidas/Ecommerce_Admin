import ProductAccountsView from "@/components/admin/products/product-accounts-view";

type Props = {
  params: { id: string };
};

export default function ProductAccountsPage({ params }: Props) {
  return <ProductAccountsView productId={params.id} />;
}
