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
import {
  AUDIT_ENTITY_FILTER_OPTIONS,
  tAuditAction,
  tAuditEntityType,
  tRole,
} from "@/constants/vi";
import { formatDateTime } from "@/lib/utils/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuditView() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchAuditLogs({
        page: page + 1,
        limit: pageSize,
        q: search.trim() || undefined,
        entityType: entityFilter === "all" ? undefined : entityFilter,
        actor: actorFilter.trim() || undefined,
      }),
    [page, search, entityFilter, actorFilter],
  );

  const items = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const activeFilterCount = [
    search.trim().length > 0,
    entityFilter !== "all",
    actorFilter.trim().length > 0,
  ].filter(Boolean).length;

  const actorSuggestions = useMemo(() => {
    const names = new Set(
      items.map((item) => item.actorName).filter(Boolean) as string[],
    );
    return Array.from(names).sort();
  }, [items]);

  function clearFilters() {
    setSearch("");
    setEntityFilter("all");
    setActorFilter("");
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
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <FilterSelect
              label="Loại đối tượng"
              value={entityFilter}
              onChange={(value) => {
                setEntityFilter(value);
                setPage(0);
              }}
              options={AUDIT_ENTITY_FILTER_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
            <div className="min-w-[200px] flex-1 space-y-1.5">
              <Label htmlFor="audit-actor-filter" className="text-xs text-keyshop-muted">
                Nhân viên thực hiện
              </Label>
              <Input
                id="audit-actor-filter"
                list="audit-actor-suggestions"
                placeholder="Tên hoặc email..."
                value={actorFilter}
                onChange={(event) => {
                  setActorFilter(event.target.value);
                  setPage(0);
                }}
                className="h-10"
              />
              <datalist id="audit-actor-suggestions">
                {actorSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>
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
                    <td className="whitespace-nowrap text-sm text-keyshop-muted">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td>
                      <p className="text-sm text-white">{entry.actorName || "—"}</p>
                      <p className="text-xs text-keyshop-muted">
                        {entry.actorRole ? tRole(entry.actorRole) : ""}
                      </p>
                    </td>
                    <td className="text-sm text-white">
                      {tAuditAction(entry.action)}
                    </td>
                    <td className="text-sm text-keyshop-muted">
                      {tAuditEntityType(entry.entityType)}
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
