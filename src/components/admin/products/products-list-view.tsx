"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, ExternalLink, KeyRound, Plus, Star, Trash2, Upload } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import PaginationBar from "@/components/admin/pagination-bar";
import PriceDisplay from "@/components/admin/price-display";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import StockBar from "@/components/admin/stock-bar";
import { Button } from "@/components/ui/button";
import {
  tActive,
  tDeliveryType,
  tProductType,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { deleteProduct, fetchProducts } from "@/lib/services/admin-service";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000";

export default function ProductsListView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchProducts);
  const products = data ?? [];
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query),
    );
  }, [search, products]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  async function handleDelete(productId: number, productName: string) {
    if (!confirm(`Ngừng bán sản phẩm "${productName}"?`)) return;

    setDeletingId(productId);
    try {
      await deleteProduct(String(productId));
      toast.success("Đã ngừng bán sản phẩm");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Sản phẩm"
        breadcrumbs={[
          { label: "Thương mại điện tử" },
          { label: "Sản phẩm" },
          { label: "Danh sách" },
        ]}
        description="Quản lý danh mục license key, mã nạp và sản phẩm số"
        actions={
          <>
            <Button type="button" variant="outline">
              <Upload className="h-4 w-4" />
              Xuất file
            </Button>
            <Button asChild>
              <Link href="/products/new">
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </>
        }
      />

      <SearchToolbar
        placeholder="Tìm theo tên, SKU, danh mục..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onFilterClick={() => undefined}
      />

      {loading ? (
        <AdminLoading label="Đang tải danh sách sản phẩm..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : (
      <section className="admin-card overflow-hidden p-0">
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-10">
                  <input type="checkbox" className="rounded border-keyshop-line" />
                </th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Loại / Giao hàng</th>
                <th>Tồn kho</th>
                <th className="admin-col-price">Giá</th>
                <th>Đánh giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input type="checkbox" className="rounded border-keyshop-line" />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-keyshop-muted">
                          {product.categoryName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="rounded bg-white/5 px-2 py-0.5 text-xs">
                      {product.sku}
                    </code>
                  </td>
                  <td>
                    <div className="text-xs">
                      <p className="text-white">
                        {tProductType(product.productType)}
                      </p>
                      <p className="text-keyshop-muted">
                        {tDeliveryType(product.deliveryType)}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="w-28">
                      <StockBar value={product.stock} max={250} />
                      <p className="mt-1 text-xs text-keyshop-muted">
                        {["license_key", "redeem_code"].includes(product.productType)
                          ? product.stock === 0
                            ? "Hết key"
                            : `Còn ${product.stock} key`
                          : product.stock === 0
                            ? "Hết hàng"
                            : `Còn ${product.stock}`}
                      </p>
                    </div>
                  </td>
                  <td className="admin-col-price">
                    <PriceDisplay
                      amount={product.discountPrice ?? product.price}
                      originalAmount={
                        product.discountPrice ? product.price : null
                      }
                      currency={product.currency}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-keyshop-muted">
                        ({product.reviewsCount})
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge
                      label={tActive(product.isActive)}
                      tone={product.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {["license_key", "redeem_code"].includes(product.productType) ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Kho key"
                          asChild
                        >
                          <Link href={`/products/${product.productId}/keys`}>
                            <KeyRound className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Sửa"
                        asChild
                      >
                        <Link href={`/products/${product.productId}/edit`}>
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Xem trên cửa hàng"
                        asChild
                      >
                        <a
                          href={`${STOREFRONT_URL}/products/${product.slug || product.productId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        aria-label="Xóa"
                        disabled={deletingId === product.productId}
                        onClick={() => handleDelete(product.productId, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={page}
          totalPages={Math.ceil(filtered.length / pageSize)}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </section>
      )}
    </div>
  );
}
