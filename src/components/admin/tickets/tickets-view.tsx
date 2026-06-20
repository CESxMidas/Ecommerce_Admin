"use client";

import { useMemo, useState } from "react";
import { LifeBuoy, MessageSquare } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import TicketDetailDialog from "@/components/admin/tickets/ticket-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  ticketPriorityTone,
  ticketStatusTone,
  tTicketPriority,
  tTicketStatus,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchTickets } from "@/lib/services/admin-service";
import type { AdminTicket } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

type StatusFilter = "all" | AdminTicket["status"];
type PriorityFilter = "all" | AdminTicket["priority"];

export default function TicketsView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchTickets({
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        q: search.trim() || undefined,
      }),
    [statusFilter, priorityFilter, search],
  );

  const tickets = data ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;

    return tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(query) ||
        ticket.userName.toLowerCase().includes(query) ||
        ticket.userEmail.toLowerCase().includes(query) ||
        ticket.orderId.toLowerCase().includes(query),
    );
  }, [tickets, search]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    priorityFilter !== "all",
  ].filter(Boolean).length;

  const openCount = tickets.filter((ticket) =>
    ["open", "pending"].includes(ticket.status),
  ).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setPage(0);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Hỗ trợ khách hàng"
        description="Xem và trả lời ticket từ khách hàng trên storefront"
      />

      <div className="admin-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-keyshop-blue/15 text-keyshop-blue">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-keyshop-muted">Ticket đang mở</p>
            <p className="text-xl font-semibold text-white">{openCount}</p>
          </div>
        </div>
      </div>

      <SearchToolbar
        placeholder="Tìm theo tiêu đề, khách hàng, mã đơn..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={tickets.length}
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
                { value: "open", label: "Mới" },
                { value: "pending", label: "Chờ khách" },
                { value: "resolved", label: "Đã xử lý" },
                { value: "closed", label: "Đóng" },
              ]}
            />
            <FilterSelect
              label="Ưu tiên"
              value={priorityFilter}
              onChange={(value) => {
                setPriorityFilter(value as PriorityFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả mức ưu tiên" },
                { value: "high", label: "Cao" },
                { value: "normal", label: "Bình thường" },
                { value: "low", label: "Thấp" },
              ]}
            />
          </>
        }
      />

      {loading ? (
        <AdminLoading label="Đang tải ticket..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="Chưa có ticket"
          description="Khách hàng chưa gửi yêu cầu hỗ trợ nào."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="Không tìm thấy ticket"
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
                  <th>Ticket</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái</th>
                  <th>Ưu tiên</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <p className="font-medium text-white">{ticket.subject}</p>
                      {ticket.orderId ? (
                        <p className="text-xs text-keyshop-muted">Đơn {ticket.orderId}</p>
                      ) : null}
                    </td>
                    <td>
                      <p className="text-sm text-white">{ticket.userName}</p>
                      <p className="text-xs text-keyshop-muted">{ticket.userEmail}</p>
                    </td>
                    <td>
                      <StatusBadge
                        label={tTicketStatus(ticket.status)}
                        tone={ticketStatusTone(ticket.status)}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        label={tTicketPriority(ticket.priority)}
                        tone={ticketPriorityTone(ticket.priority)}
                      />
                    </td>
                    <td className="text-sm text-keyshop-muted">
                      {formatDateTime(ticket.updatedAt)}
                    </td>
                    <td>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        Xem & trả lời
                      </Button>
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

      <TicketDetailDialog
        open={Boolean(selectedTicketId)}
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onUpdated={refetch}
      />
    </div>
  );
}
