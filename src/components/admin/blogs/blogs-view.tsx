"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit2, FileText, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tPublished } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchBlogs } from "@/lib/services/admin-service";
import { formatDate } from "@/lib/utils/format";

export default function BlogsView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchBlogs);
  const blogs = data ?? [];
  const [search, setSearch] = useState("");

  const filtered = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Blog"
        description="Quản lý bài viết và tin tức"
        actions={
          <Button type="button">
            <Plus className="h-4 w-4" />
            Thêm bài viết
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Tìm bài viết..."
        value={search}
        onChange={setSearch}
      />

      {loading ? (
        <AdminLoading label="Đang tải bài viết..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : (
      <section className="admin-card overflow-hidden p-0">
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Danh mục</th>
                <th>Ngày xuất bản</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((blog) => (
                <tr key={blog.id}>
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
                          {blog.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{blog.category}</td>
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
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400"
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
      </section>
      )}
    </div>
  );
}
