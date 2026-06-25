"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Eye } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import StatusBadge from "@/components/admin/status-badge";
import ContentRevisionDetailDialog from "@/components/admin/content-review/content-revision-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  REVISION_ENTITY_FILTER_OPTIONS,
  REVISION_STATUS_FILTER_OPTIONS,
  revisionStatusTone,
  tAuditEntityType,
  tRevisionChangeType,
  tRevisionStatus,
  tRole,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchContentRevisions } from "@/lib/services/admin-service";
import type { AdminContentRevision } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

export default function ContentReviewView() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const pageSize = 15;

  const listParams = useMemo(() => {
    if (statusFilter === "pending") {
      return {
        page: page + 1,
        limit: pageSize,
        queue: "pending" as const,
        entityType: entityFilter === "all" ? undefined : entityFilter,
      };
    }

    return {
      page: page + 1,
      limit: pageSize,
      status: statusFilter === "all" ? undefined : statusFilter,
      entityType: entityFilter === "all" ? undefined : entityFilter,
    };
  }, [entityFilter, page, statusFilter]);

  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchContentRevisions(listParams),
    [listParams],
  );

  const items = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const pendingCount = statusFilter === "pending" ? totalItems : undefined;

  function openRevision(revision: AdminContentRevision) {
    setSelectedRevisionId(revision.id);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Hàng đợi duyệt"
        description="Xem và duyệt thay đổi sản phẩm, banner, bài viết do quản lý gửi lên"
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Trạng thái"
          value={statusFilter}
          options={[...REVISION_STATUS_FILTER_OPTIONS]}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
        />
        <FilterSelect
          label="Loại nội dung"
          value={entityFilter}
          options={[...REVISION_ENTITY_FILTER_OPTIONS]}
          onChange={(value) => {
            setEntityFilter(value);
            setPage(0);
          }}
        />
        {pendingCount != null ? (
          <StatusBadge
            label={`${pendingCount} chờ duyệt`}
            tone={pendingCount > 0 ? "warning" : "success"}
          />
        ) : null}
      </div>

      {loading ? <AdminLoading label="Đang tải hàng đợi duyệt..." /> : null}
      {error ? <AdminError message={error} onRetry={refetch} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Không có yêu cầu duyệt"
          description={
            statusFilter === "pending"
              ? "Hiện chưa có thay đổi nào đang chờ chủ shop duyệt."
              : "Thử đổi bộ lọc để xem các yêu cầu khác."
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-keyshop-line">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-keyshop-line bg-keyshop-soft/50 text-left text-keyshop-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nội dung</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Thay đổi</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Người gửi</th>
                  <th className="px-4 py-3 font-medium">Thời gian</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-keyshop-line">
                {items.map((revision) => (
                  <tr
                    key={revision.id}
                    className="bg-keyshop-bg/40 transition-colors hover:bg-keyshop-soft/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{revision.entityLabel}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-keyshop-muted">
                        {revision.summary}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-keyshop-muted">
                      {tAuditEntityType(revision.entityType)}
                    </td>
                    <td className="px-4 py-3 text-keyshop-muted">
                      {tRevisionChangeType(revision.changeType)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={tRevisionStatus(revision.status)}
                        tone={revisionStatusTone(revision.status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{revision.submittedByName || "—"}</p>
                      {revision.submittedByRole ? (
                        <p className="text-xs text-keyshop-muted">
                          {tRole(revision.submittedByRole)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-keyshop-muted">
                      {revision.submittedAt
                        ? formatDateTime(revision.submittedAt)
                        : formatDateTime(revision.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openRevision(revision)}
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <ContentRevisionDetailDialog
        open={Boolean(selectedRevisionId)}
        revisionId={selectedRevisionId}
        onClose={() => setSelectedRevisionId(null)}
        onUpdated={refetch}
      />
    </div>
  );
}
