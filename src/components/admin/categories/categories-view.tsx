"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Edit2,
  FolderTree,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import CategoryFormDialog from "@/components/admin/categories/category-form-dialog";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tActive } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  bulkSetCategoriesActive,
  deleteCategory,
  fetchAdminCategories,
} from "@/lib/services/admin-service";
import { exportCategoriesToCsv } from "@/lib/utils/category-export";
import { getCategoryParentName } from "@/lib/utils/category-form";
import type { AdminCategory } from "@/types/admin";

type LevelFilter = "all" | "root" | "child";

export default function CategoriesView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchAdminCategories);
  const categories = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [parentFilter, setParentFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const parentName = getCategoryParentName(categories, category.parentId) || "";

      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        parentName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? category.isActive : !category.isActive);

      const matchesLevel =
        levelFilter === "all" ||
        (levelFilter === "root"
          ? category.parentId == null
          : category.parentId != null);

      const matchesParent =
        parentFilter === "all" || String(category.parentId) === parentFilter;

      return matchesSearch && matchesStatus && matchesLevel && matchesParent;
    });
  }, [categories, search, statusFilter, levelFilter, parentFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageCategoryIds = pageItems.map((category) => category.categoryId);
  const allPageSelected =
    pageCategoryIds.length > 0 &&
    pageCategoryIds.every((id) => selectedIds.includes(id));

  const rootCategories = useMemo(
    () => categories.filter((category) => category.parentId == null),
    [categories],
  );

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    levelFilter !== "all",
    parentFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setLevelFilter("all");
    setParentFilter("all");
    setPage(0);
  }

  function openCreateDialog(parentId: number | null = null) {
    setEditingCategory(null);
    setDefaultParentId(parentId);
    setDialogOpen(true);
  }

  function openEditDialog(category: AdminCategory) {
    setEditingCategory(category);
    setDefaultParentId(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingCategory(null);
    setDefaultParentId(null);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !pageCategoryIds.includes(id)),
      );
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...pageCategoryIds])));
  }

  function toggleSelectCategory(categoryId: number) {
    setSelectedIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  async function handleDeactivate(category: AdminCategory) {
    if (
      !confirm(
        `Ngừng hiển thị danh mục "${category.name}"? (Không thể nếu còn SP hoặc danh mục con đang bán)`,
      )
    ) {
      return;
    }

    setDeletingId(category.categoryId);
    try {
      await deleteCategory(String(category.categoryId));
      toast.success("Đã ngừng hiển thị danh mục");
      setSelectedIds((current) => current.filter((id) => id !== category.categoryId));
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ngừng hiển thị thất bại");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkActive(isActive: boolean) {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `${isActive ? "Bật lại hiển thị" : "Ngừng hiển thị"} ${selectedIds.length} danh mục đã chọn?`,
      )
    ) {
      return;
    }

    setBulkLoading(true);
    try {
      await bulkSetCategoriesActive(selectedIds, isActive);
      toast.success(
        `Đã ${isActive ? "bật lại hiển thị" : "ngừng hiển thị"} ${selectedIds.length} danh mục`,
      );
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
      toast.error("Không có danh mục để xuất");
      return;
    }

    exportCategoriesToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} danh mục`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Danh mục"
        description="Quản lý danh mục sản phẩm và phân cấp"
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Xuất file
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLevelFilter("child");
                setPage(0);
              }}
            >
              <FolderTree className="h-4 w-4" />
              Danh mục con
            </Button>
            <Button type="button" onClick={() => openCreateDialog(null)}>
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
          </>
        }
      />

      <SearchToolbar
        placeholder="Tìm theo tên, slug, danh mục cha..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={categories.length}
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
                { value: "active", label: "Đang hiển thị" },
                { value: "inactive", label: "Ngừng hiển thị" },
              ]}
            />
            <FilterSelect
              label="Cấp danh mục"
              value={levelFilter}
              onChange={(value) => {
                const nextLevel = value as LevelFilter;
                setLevelFilter(nextLevel);
                if (nextLevel === "root") {
                  setParentFilter("all");
                }
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả cấp" },
                { value: "root", label: "Danh mục gốc" },
                { value: "child", label: "Danh mục con" },
              ]}
            />
            <FilterSelect
              label="Danh mục cha"
              value={parentFilter}
              disabled={levelFilter === "root" || rootCategories.length === 0}
              onChange={(value) => {
                setParentFilter(value);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Mọi danh mục cha" },
                ...rootCategories.map((category) => ({
                  value: String(category.categoryId),
                  label: `Con của ${category.name}`,
                })),
              ]}
            />
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> danh mục
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkActive(false)}
          >
            Ngừng hiển thị
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkActive(true)}
          >
            Bật lại hiển thị
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
        <AdminLoading label="Đang tải danh mục..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="Chưa có danh mục"
          description="Tạo danh mục đầu tiên để phân loại sản phẩm trên cửa hàng."
          actionLabel="Thêm danh mục"
          onAction={() => openCreateDialog(null)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="Không tìm thấy danh mục"
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
                  <th>Danh mục</th>
                  <th>Đường dẫn</th>
                  <th>Danh mục cha</th>
                  <th>Sản phẩm</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((category) => {
                  const parentName = getCategoryParentName(categories, category.parentId);

                  return (
                    <tr key={category.categoryId}>
                      <td>
                        <input
                          type="checkbox"
                          className="rounded border-keyshop-line"
                          checked={selectedIds.includes(category.categoryId)}
                          onChange={() => toggleSelectCategory(category.categoryId)}
                          aria-label={`Chọn ${category.name}`}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-keyshop-muted">
                              <FolderTree className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{category.name}</p>
                            <p className="line-clamp-1 text-xs text-keyshop-muted">
                              {category.description || "Không có mô tả"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code className="text-xs">{category.slug}</code>
                      </td>
                      <td className="text-keyshop-muted">{parentName || "—"}</td>
                      <td>{category.productCount}</td>
                      <td>{category.sortOrder}</td>
                      <td>
                        <StatusBadge
                          label={tActive(category.isActive)}
                          tone={category.isActive ? "success" : "neutral"}
                        />
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Thêm danh mục con"
                            onClick={() => openCreateDialog(category.categoryId)}
                          >
                            <FolderTree className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Sửa"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400"
                            aria-label="Ngừng hiển thị"
                            disabled={deletingId === category.categoryId}
                            onClick={() => handleDeactivate(category)}
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

      <CategoryFormDialog
        open={dialogOpen}
        categories={categories}
        category={editingCategory}
        defaultParentId={defaultParentId}
        onClose={closeDialog}
        onSaved={refetch}
      />
    </div>
  );
}
