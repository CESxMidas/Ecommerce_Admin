"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit2, FolderTree, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tActive } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchCategories } from "@/lib/services/admin-service";

export default function CategoriesView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchCategories);
  const categories = data ?? [];
  const [search, setSearch] = useState("");

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Danh mục"
        description="Quản lý danh mục sản phẩm và phân cấp"
        actions={
          <>
            <Button type="button" variant="outline">
              <FolderTree className="h-4 w-4" />
              Danh mục con
            </Button>
            <Button type="button">
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
          </>
        }
      />

      <SearchToolbar
        placeholder="Tìm danh mục..."
        value={search}
        onChange={setSearch}
      />

      {loading ? (
        <AdminLoading label="Đang tải danh mục..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : (
      <section className="admin-card overflow-hidden p-0">
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
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
              {filtered.map((category) => (
                <tr key={category.id}>
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
                        <p className="text-xs text-keyshop-muted line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="text-xs">{category.slug}</code>
                  </td>
                  <td className="text-keyshop-muted">
                    {category.parentName || "—"}
                  </td>
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
