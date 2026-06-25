"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/utils/api-error";
import { Edit2, Plus, Ticket, Trash2, Upload } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import CouponFormDialog from "@/components/admin/coupons/coupon-form-dialog";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  tCouponActive,
  tCouponType,
  tNoExpiry,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  bulkSetCouponsActive,
  deleteCoupon,
  fetchCoupons,
} from "@/lib/services/admin-service";
import { exportCouponsToCsv } from "@/lib/utils/coupon-export";
import type { AdminCoupon, CouponType } from "@/types/admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type StatusFilter = "all" | "active" | "inactive";
type TypeFilter = "all" | CouponType;

export default function CouponsView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchCoupons);
  const coupons = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch = !query || coupon.code.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? coupon.isActive : !coupon.isActive);
      const matchesType = typeFilter === "all" || coupon.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, search, statusFilter, typeFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageCouponIds = pageItems.map((coupon) => coupon.id);
  const allPageSelected =
    pageCouponIds.length > 0 && pageCouponIds.every((id) => selectedIds.includes(id));

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    typeFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(0);
  }

  function openCreateDialog() {
    setEditingCoupon(null);
    setDialogOpen(true);
  }

  function openEditDialog(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingCoupon(null);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) => current.filter((id) => !pageCouponIds.includes(id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...pageCouponIds])));
  }

  function toggleSelectCoupon(couponId: string) {
    setSelectedIds((current) =>
      current.includes(couponId)
        ? current.filter((id) => id !== couponId)
        : [...current, couponId],
    );
  }

  async function handleDeactivate(coupon: AdminCoupon) {
    if (!confirm(`Vô hiệu hóa mã "${coupon.code}"?`)) return;

    setDeletingId(coupon.id);
    try {
      await deleteCoupon(coupon.id);
      toast.success("Đã vô hiệu hóa mã giảm giá");
      setSelectedIds((current) => current.filter((id) => id !== coupon.id));
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Thất bại"));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkActive(isActive: boolean) {
    if (selectedIds.length === 0) return;
    if (!confirm(`${isActive ? "Kích hoạt" : "Vô hiệu hóa"} ${selectedIds.length} mã?`)) return;

    setBulkLoading(true);
    try {
      await bulkSetCouponsActive(selectedIds, isActive);
      toast.success(`Đã cập nhật ${selectedIds.length} mã`);
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
      toast.error("Không có mã để xuất");
      return;
    }
    exportCouponsToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} mã`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Mã giảm giá"
        description="Tạo và quản lý mã khuyến mãi"
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Xuất file
            </Button>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Thêm mã giảm giá
            </Button>
          </>
        }
      />

      <SearchToolbar
        placeholder="Tìm mã giảm giá..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={coupons.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        filters={
          <>
            <FilterSelect
              label="Trạng thái"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang hoạt động" },
                { value: "inactive", label: "Đã vô hiệu" },
              ]}
            />
            <FilterSelect
              label="Loại"
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value as TypeFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả loại" },
                { value: "percent", label: tCouponType("percent") },
                { value: "fixed", label: tCouponType("fixed") },
              ]}
            />
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> mã
          </p>
          <Button type="button" size="sm" variant="outline" disabled={bulkLoading} onClick={() => handleBulkActive(false)}>
            Vô hiệu hóa
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={bulkLoading} onClick={() => handleBulkActive(true)}>
            Kích hoạt lại
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            Bỏ chọn
          </Button>
        </div>
      ) : null}

      {loading ? (
        <AdminLoading label="Đang tải mã giảm giá..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Chưa có mã giảm giá"
          description="Tạo mã khuyến mãi đầu tiên cho shop."
          actionLabel="Thêm mã giảm giá"
          onAction={openCreateDialog}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Không tìm thấy mã"
          description="Thử đổi từ khóa hoặc bộ lọc."
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
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAllOnPage} aria-label="Chọn tất cả" />
                  </th>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th className="admin-col-price">Giá trị</th>
                  <th className="admin-col-price">Đơn tối thiểu</th>
                  <th>Lượt dùng</th>
                  <th>Hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(coupon.id)}
                        onChange={() => toggleSelectCoupon(coupon.id)}
                        aria-label={`Chọn ${coupon.code}`}
                      />
                    </td>
                    <td>
                      <code className="rounded-lg bg-keyshop-blue/15 px-2.5 py-1 text-sm font-semibold text-keyshop-blue">
                        {coupon.code}
                      </code>
                    </td>
                    <td>{tCouponType(coupon.type)}</td>
                    <td className="admin-col-price font-medium text-white">
                      {coupon.type === "percent" ? `${coupon.value}%` : formatCurrency(coupon.value)}
                    </td>
                    <td className="admin-col-price">{formatCurrency(coupon.minOrder)}</td>
                    <td>
                      {coupon.usedCount}
                      {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="text-sm text-keyshop-muted">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : tNoExpiry()}
                    </td>
                    <td>
                      <StatusBadge
                        label={tCouponActive(coupon.isActive)}
                        tone={coupon.isActive ? "success" : "neutral"}
                      />
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(coupon)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400"
                          disabled={deletingId === coupon.id || !coupon.isActive}
                          onClick={() => handleDeactivate(coupon)}
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

      <CouponFormDialog open={dialogOpen} coupon={editingCoupon} onClose={closeDialog} onSaved={refetch} />
    </div>
  );
}
