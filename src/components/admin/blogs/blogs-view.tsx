"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, FileText, Plus, Trash2, Upload } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import BlogFormDialog from "@/components/admin/blogs/blog-form-dialog";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tPublished } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  bulkSetBlogsActive,
  deleteBlog,
  fetchBlogs,
} from "@/lib/services/admin-service";
import { exportBlogsToCsv } from "@/lib/utils/blog-export";
import { formatDate } from "@/lib/utils/format";
import type { AdminBlog } from "@/types/admin";

type StatusFilter = "all" | "active" | "inactive";

export default function BlogsView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchBlogs);
  const blogs = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<AdminBlog | null>(null);
  const pageSize = 10;

  const blogCategories = useMemo(() => {
    const unique = new Set(blogs.map((blog) => blog.category).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "vi"));
  }, [blogs]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesSearch =
        !query ||
        blog.title.toLowerCase().includes(query) ||
        blog.description.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? blog.isActive : !blog.isActive);

      const matchesCategory =
        categoryFilter === "all" || blog.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [blogs, search, statusFilter, categoryFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageBlogIds = pageItems.map((blog) => blog.id);
  const allPageSelected =
    pageBlogIds.length > 0 && pageBlogIds.every((id) => selectedIds.includes(id));

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    categoryFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPage(0);
  }

  function openCreateDialog() {
    setEditingBlog(null);
    setDialogOpen(true);
  }

  function openEditDialog(blog: AdminBlog) {
    setEditingBlog(blog);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingBlog(null);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) => current.filter((id) => !pageBlogIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...pageBlogIds])));
  }

  function toggleSelectBlog(blogId: string) {
    setSelectedIds((current) =>
      current.includes(blogId)
        ? current.filter((id) => id !== blogId)
        : [...current, blogId],
    );
  }

  async function handleDeactivate(blog: AdminBlog) {
    if (!confirm(`Ngừng xuất bản bài viết "${blog.title}"?`)) {
      return;
    }

    setDeletingId(blog.id);
    try {
      await deleteBlog(blog.id);
      toast.success("Đã ngừng xuất bản bài viết");
      setSelectedIds((current) => current.filter((id) => id !== blog.id));
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ngừng xuất bản thất bại");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkActive(isActive: boolean) {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `${isActive ? "Xuất bản lại" : "Ngừng xuất bản"} ${selectedIds.length} bài viết đã chọn?`,
      )
    ) {
      return;
    }

    setBulkLoading(true);
    try {
      await bulkSetBlogsActive(selectedIds, isActive);
      toast.success(
        `Đã ${isActive ? "xuất bản lại" : "ngừng xuất bản"} ${selectedIds.length} bài viết`,
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
      toast.error("Không có bài viết để xuất");
      return;
    }

    exportBlogsToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} bài viết`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Blog"
        description="Quản lý bài viết và tin tức"
        actions={
          <>
            <Button type="button" variant="outline" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Xuất file
            </Button>
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Thêm bài viết
            </Button>
          </>
        }
      />

      <SearchToolbar
        placeholder="Tìm theo tiêu đề, mô tả, danh mục..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={blogs.length}
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
                { value: "active", label: "Đang xuất bản" },
                { value: "inactive", label: "Ngừng xuất bản" },
              ]}
            />
            <FilterSelect
              label="Danh mục"
              value={categoryFilter}
              disabled={blogCategories.length === 0}
              onChange={(value) => {
                setCategoryFilter(value);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả danh mục" },
                ...blogCategories.map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
            />
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> bài viết
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkActive(false)}
          >
            Ngừng xuất bản
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkActive(true)}
          >
            Xuất bản lại
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
        <AdminLoading label="Đang tải bài viết..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : blogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có bài viết"
          description="Tạo bài viết đầu tiên để hiển thị trên trang tin tức."
          actionLabel="Thêm bài viết"
          onAction={openCreateDialog}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không tìm thấy bài viết"
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
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Chọn tất cả trên trang"
                    />
                  </th>
                  <th>Bài viết</th>
                  <th>Danh mục</th>
                  <th>Ngày xuất bản</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(blog.id)}
                        onChange={() => toggleSelectBlog(blog.id)}
                        aria-label={`Chọn ${blog.title}`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        {blog.image ? (
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            width={72}
                            height={48}
                            className="h-12 w-[4.5rem] rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-[4.5rem] items-center justify-center rounded-lg bg-white/5">
                            <FileText className="h-5 w-5 text-keyshop-muted" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{blog.title}</p>
                          <p className="line-clamp-1 text-xs text-keyshop-muted">
                            {blog.description || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{blog.category || "—"}</td>
                    <td className="text-sm text-keyshop-muted">
                      {formatDate(blog.publishedAt)}
                    </td>
                    <td>
                      <StatusBadge
                        label={tPublished(blog.isActive)}
                        tone={blog.isActive ? "success" : "neutral"}
                      />
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(blog)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400"
                          disabled={deletingId === blog.id || !blog.isActive}
                          onClick={() => handleDeactivate(blog)}
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

      <BlogFormDialog
        open={dialogOpen}
        blog={editingBlog}
        categoryOptions={blogCategories}
        onClose={closeDialog}
        onSaved={refetch}
      />
    </div>
  );
}
