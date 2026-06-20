"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchAuditLogs } from "@/lib/services/admin-service";
import { tRole } from "@/constants/vi";
import { formatDateTime } from "@/lib/utils/format";

export default function AuditView() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchAuditLogs({
        page: page + 1,
        limit: pageSize,
        q: search.trim() || undefined,
        entityType: entityFilter === "all" ? undefined : entityFilter,
      }),
    [page, search, entityFilter],
  );

  const items = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const activeFilterCount = [search.trim().length > 0, entityFilter !== "all"].filter(
    Boolean,
  ).length;

  const entityOptions = useMemo(() => {
    const unique = new Set(items.map((item) => item.entityType));
    return Array.from(unique).sort();
  }, [items]);

  function clearFilters() {
    setSearch("");
    setEntityFilter("all");
    setPage(0);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Nhật ký hệ thống"
        description="Theo dõi thao tác quan trọng của nhân viên trên shop"
      />

      <SearchToolbar
        placeholder="Tìm theo mô tả hành động..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={items.length}
        totalCount={totalItems}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        filters={
          <FilterSelect
            label="Loại đối tượng"
            value={entityFilter}
            onChange={(value) => {
              setEntityFilter(value);
              setPage(0);
            }}
            options={[
              { value: "all", label: "Tất cả loại" },
              ...entityOptions.map((value) => ({ value, label: value })),
              { value: "order", label: "order" },
              { value: "ticket", label: "ticket" },
              { value: "review", label: "review" },
            ].filter(
              (option, index, array) =>
                array.findIndex((item) => item.value === option.value) === index,
            )}
          />
        }
      />

      {loading ? (
        <AdminLoading label="Đang tải nhật ký..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={History}
          title="Chưa có bản ghi"
          description="Các thao tác quan trọng sẽ được ghi lại tại đây."
        />
      ) : (
        <section className="admin-card overflow-hidden p-0">
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Nhân viên</th>
                  <th>Hành động</th>
                  <th>Đối tượng</th>
                  <th>Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => (
                  <tr key={entry.id}>
                    <td className="text-sm text-keyshop-muted whitespace-nowrap">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td>
                      <p className="text-sm text-white">{entry.actorName || "—"}</p>
                      <p className="text-xs text-keyshop-muted">
                        {entry.actorRole ? tRole(entry.actorRole) : ""}
                      </p>
                    </td>
                    <td className="text-sm text-keyshop-muted">{entry.action}</td>
                    <td className="text-sm text-keyshop-muted">
                      {entry.entityType}
                      {entry.entityId ? ` · ${entry.entityId}` : ""}
                    </td>
                    <td className="text-sm text-white">{entry.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </section>
      )}
    </div>
  );
}
