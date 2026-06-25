"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/utils/api-error";
import {
  Edit2,
  ExternalLink,
  KeyRound,
  Package,
  Plus,
  Star,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
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
import {
  getCatalogLabel,
  matchesCatalogFilter,
  PRODUCT_CATALOG_OPTIONS,
  type ProductCatalogKind,
} from "@/constants/product-catalog";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  bulkSetProductsActive,
  deleteProduct,
  fetchCategories,
  fetchProducts,
} from "@/lib/services/admin-service";
import { exportProductsToCsv } from "@/lib/utils/product-export";
import { computeStockBarMax, isAccountPoolProductType, isPoolProductType } from "@/lib/utils/product-form";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000";

export default function ProductsListView() {
  const router = useRouter();
  const { data, loading, error, refetch } = useAdminFetch(fetchProducts);
  const { data: categories } = useAdminFetch(fetchCategories);
  const products = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ProductCatalogKind>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? product.isActive : !product.isActive);

      const matchesType = matchesCatalogFilter(product.productType, typeFilter);

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.categoryId) === categoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [products, search, statusFilter, typeFilter, categoryFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageProductIds = pageItems.map((product) => product.productId);
  const allPageSelected =
    pageProductIds.length > 0 &&
    pageProductIds.every((id) => selectedIds.includes(id));

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    typeFilter !== "all",
    categoryFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPage(0);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !pageProductIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...pageProductIds])));
  }

  function toggleSelectProduct(productId: number) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  async function handleDelete(productId: number, productName: string) {
    if (!confirm(`Ngừng bán sản phẩm "${productName}"?`)) return;

    setDeletingId(productId);
    try {
      await deleteProduct(String(productId));
      toast.success("Đã ngừng bán sản phẩm");
      setSelectedIds((current) => current.filter((id) => id !== productId));
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Xóa thất bại"));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkActive(isActive: boolean) {
    if (selectedIds.length === 0) return;

    const actionLabel = isActive ? "bật lại bán" : "ngừng bán";
    if (!confirm(`${isActive ? "Bật lại bán" : "Ngừng bán"} ${selectedIds.length} sản phẩm đã chọn?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      await bulkSetProductsActive(selectedIds, isActive);
      toast.success(`Đã ${actionLabel} ${selectedIds.length} sản phẩm`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Thao tác hàng loạt thất bại"));
    } finally {
      setBulkLoading(false);
    }
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("Không có sản phẩm để xuất");
      return;
    }

    exportProductsToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} sản phẩm`);
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
            <Button type="button" variant="outline" onClick={handleExport}>
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
        resultCount={filtered.length}
        totalCount={products.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        filters={
          <>
            <FilterSelect
              label="Trạng thái"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as typeof statusFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang bán" },
                { value: "inactive", label: "Ngừng bán" },
              ]}
            />
            <FilterSelect
              label="Loại sản phẩm"
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value as typeof typeFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả loại" },
                ...PRODUCT_CATALOG_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
            />
            <FilterSelect
              label="Danh mục"
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả danh mục" },
                ...(categories?.map((category) => ({
                  value: String(category.categoryId),
                  label: category.parentName
                    ? `${category.parentName} › ${category.name}`
                    : category.name,
                })) ?? []),
              ]}
            />
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> sản phẩm
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkActive(false)}
          >
            Ngừng bán
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkActive(true)}
          >
            Bật lại bán
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds([])}
          >
            Bỏ chọn
          </Button>
        </div>
      ) : null}

      {loading ? (
        <AdminLoading label="Đang tải danh sách sản phẩm..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Chưa có sản phẩm"
          description="Thêm sản phẩm đầu tiên để bắt đầu bán trên cửa hàng."
          actionLabel="Thêm sản phẩm"
          onAction={() => router.push("/products/new")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Không tìm thấy sản phẩm"
          description="Thử đổi từ khóa hoặc bộ lọc để xem kết quả khác."
          actionLabel="Xóa bộ lọc"
          onAction={clearFilters}
        />
      ) : (
        <section className="admin-card overflow-hidden p-0">
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      className="rounded border-keyshop-line"
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Chọn tất cả trên trang"
                    />
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
                {pageItems.map((product) => {
                  const keyPoolProduct = isPoolProductType(
                    product.productType,
                    product.deliveryType,
                  );
                  const accountPoolProduct = isAccountPoolProductType(
                    product.productType,
                    product.deliveryType,
                  );
                  const stockMax = computeStockBarMax(product.stock);

                  return (
                    <tr key={product.productId}>
                      <td>
                        <input
                          type="checkbox"
                          className="rounded border-keyshop-line"
                          checked={selectedIds.includes(product.productId)}
                          onChange={() => toggleSelectProduct(product.productId)}
                          aria-label={`Chọn ${product.name}`}
                        />
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
                              {product.categoryName || "Chưa có danh mục"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="rounded bg-white/5 px-2 py-0.5 text-xs">
                          {product.sku || "—"}
                        </code>
                      </td>
                      <td>
                        <div className="text-xs">
                          <p className="text-white">
                            {getCatalogLabel(product.productType)}
                          </p>
                          <p className="text-keyshop-muted">
                            {product.productType === "license_key" ||
                            product.productType === "redeem_code"
                              ? tProductType(product.productType)
                              : tDeliveryType(product.deliveryType)}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="w-28">
                          <StockBar value={product.stock} max={stockMax} />
                          <p className="mt-1 text-xs text-keyshop-muted">
                            {keyPoolProduct
                              ? product.stock === 0
                                ? "Hết key"
                                : `Còn ${product.stock} key`
                              : accountPoolProduct
                                ? product.stock === 0
                                  ? "Hết tài khoản"
                                  : `Còn ${product.stock} tài khoản`
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
                          {keyPoolProduct ? (
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
                          {accountPoolProduct ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Kho tài khoản"
                              asChild
                            >
                              <Link href={`/products/${product.productId}/accounts`}>
                                <UserRound className="h-4 w-4" />
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
                            aria-label="Ngừng bán"
                            disabled={deletingId === product.productId}
                            onClick={() => handleDelete(product.productId, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
