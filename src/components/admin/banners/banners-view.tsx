"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, ImageIcon, Plus, Trash2, Upload } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import BannerFormDialog from "@/components/admin/banners/banner-form-dialog";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tActive, tPlacement } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  bulkSetBannersActive,
  deleteBanner,
  fetchBanners,
} from "@/lib/services/admin-service";
import { exportBannersToCsv } from "@/lib/utils/banner-export";
import type { AdminBanner, BannerPlacement } from "@/types/admin";

type StatusFilter = "all" | "active" | "inactive";
type PlacementFilter = "all" | BannerPlacement;

export default function BannersView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchBanners);
  const banners = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [placementFilter, setPlacementFilter] = useState<PlacementFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const pageSize = 9;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return banners.filter((banner) => {
      const matchesSearch =
        !query ||
        banner.title.toLowerCase().includes(query) ||
        banner.subtitle.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? banner.isActive : !banner.isActive);

      const matchesPlacement =
        placementFilter === "all" || banner.placement === placementFilter;

      return matchesSearch && matchesStatus && matchesPlacement;
    });
  }, [banners, search, statusFilter, placementFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageBannerIds = pageItems.map((banner) => banner.id);
  const allPageSelected =
    pageBannerIds.length > 0 && pageBannerIds.every((id) => selectedIds.includes(id));

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    placementFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPlacementFilter("all");
    setPage(0);
  }

  function openCreateDialog() {
    setEditingBanner(null);
    setDialogOpen(true);
  }

  function openEditDialog(banner: AdminBanner) {
    setEditingBanner(banner);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingBanner(null);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) => current.filter((id) => !pageBannerIds.includes(id)));
      return;
    }
    setSelectedIds((current) => Array.from(new Set([...current, ...pageBannerIds])));
  }

  function toggleSelectBanner(bannerId: string) {
    setSelectedIds((current) =>
      current.includes(bannerId)
        ? current.filter((id) => id !== bannerId)
        : [...current, bannerId],
    );
  }

  async function handleDeactivate(banner: AdminBanner) {
    if (!confirm(`Ngừng hiển thị banner "${banner.title}"?`)) return;

    setDeletingId(banner.id);
    try {
      await deleteBanner(banner.id);
      toast.success("Đã ngừng hiển thị banner");
      setSelectedIds((current) => current.filter((id) => id !== banner.id));
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thất bại");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkActive(isActive: boolean) {
    if (selectedIds.length === 0) return;
    if (!confirm(`${isActive ? "Hiển thị lại" : "Ngừng hiển thị"} ${selectedIds.length} banner?`)) return;

    setBulkLoading(true);
    try {
      await bulkSetBannersActive(selectedIds, isActive);
      toast.success(`Đã cập nhật ${selectedIds.length} banner`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác hàng loạt thất bại");
    } finally {
      setBulkLoading(false);
    }
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("Không có banner để xuất");
      return;
    }
    exportBannersToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} banner`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Banner / Slider"
        description="Quản lý banner trang chủ và vị trí quảng cáo"
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Xuất file
            </Button>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Thêm banner
            </Button>
          </>
        }
      />

      <SearchToolbar
        placeholder="Tìm theo tiêu đề, phụ đề..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={banners.length}
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
                { value: "active", label: "Đang hiển thị" },
                { value: "inactive", label: "Ngừng hiển thị" },
              ]}
            />
            <FilterSelect
              label="Vị trí"
              value={placementFilter}
              onChange={(value) => {
                setPlacementFilter(value as PlacementFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả vị trí" },
                { value: "home_slider", label: tPlacement("home_slider") },
                { value: "ads", label: tPlacement("ads") },
              ]}
            />
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> banner
          </p>
          <Button type="button" size="sm" variant="outline" disabled={bulkLoading} onClick={() => handleBulkActive(false)}>
            Ngừng hiển thị
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={bulkLoading} onClick={() => handleBulkActive(true)}>
            Hiển thị lại
          </Button>
          <label className="ml-auto flex items-center gap-2 text-sm text-keyshop-muted">
            <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAllOnPage} />
            Chọn trang này
          </label>
        </div>
      ) : null}

      {loading ? (
        <AdminLoading label="Đang tải banner..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : banners.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Chưa có banner"
          description="Tạo banner đầu tiên cho trang chủ hoặc quảng cáo."
          actionLabel="Thêm banner"
          onAction={openCreateDialog}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Không tìm thấy banner"
          description="Thử đổi từ khóa hoặc bộ lọc."
          actionLabel="Xóa bộ lọc"
          onAction={clearFilters}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((banner) => (
              <article key={banner.id} className="admin-card overflow-hidden p-0">
                <div className="relative aspect-[2/1] w-full">
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                  <label className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded bg-black/50">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(banner.id)}
                      onChange={() => toggleSelectBanner(banner.id)}
                      aria-label={`Chọn ${banner.title}`}
                    />
                  </label>
                  <div className="absolute right-3 top-3 flex gap-2">
                    <StatusBadge label={tPlacement(banner.placement)} tone="info" />
                    <StatusBadge label={tActive(banner.isActive)} tone={banner.isActive ? "success" : "neutral"} />
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="font-semibold text-white">{banner.title}</h3>
                    <p className="text-sm text-keyshop-muted">{banner.subtitle || "—"}</p>
                  </div>
                  <p className="truncate text-xs text-keyshop-muted">Liên kết: {banner.link || "—"}</p>
                  <p className="text-xs text-keyshop-muted">Thứ tự: {banner.sortOrder}</p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(banner)}>
                      <Edit2 className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-400"
                      disabled={deletingId === banner.id || !banner.isActive}
                      onClick={() => handleDeactivate(banner)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <PaginationBar
            page={page}
            totalPages={Math.ceil(filtered.length / pageSize)}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <BannerFormDialog open={dialogOpen} banner={editingBanner} onClose={closeDialog} onSaved={refetch} />
    </div>
  );
}
