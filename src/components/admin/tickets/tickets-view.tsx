"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LifeBuoy, MessageSquare, UserCheck } from "lucide-react";

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

type QueueTab = "waiting_customer" | "responded";
type PriorityFilter = "all" | AdminTicket["priority"];

const QUEUE_STATUS: Record<QueueTab, AdminTicket["status"]> = {
  waiting_customer: "open",
  responded: "pending",
};

function parseQueueTab(value: string | null): QueueTab {
  return value === "responded" ? "responded" : "waiting_customer";
}

export default function TicketsView() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [queueTab, setQueueTab] = useState<QueueTab>(() =>
    parseQueueTab(searchParams.get("queue")),
  );
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const pageSize = 10;

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchTickets({
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        q: search.trim() || undefined,
      }),
    [priorityFilter, search],
  );

  const tickets = data ?? [];

  const waitingCustomerCount = tickets.filter((ticket) => ticket.status === "open").length;
  const respondedCount = tickets.filter((ticket) => ticket.status === "pending").length;

  const queueTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === QUEUE_STATUS[queueTab]),
    [tickets, queueTab],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return queueTickets;

    return queueTickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(query) ||
        ticket.userName.toLowerCase().includes(query) ||
        ticket.userEmail.toLowerCase().includes(query) ||
        ticket.orderId.toLowerCase().includes(query),
    );
  }, [queueTickets, search]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const activeFilterCount = [search.trim().length > 0, priorityFilter !== "all"].filter(
    Boolean,
  ).length;

  function clearFilters() {
    setSearch("");
    setPriorityFilter("all");
    setPage(0);
  }

  function setQueue(tab: QueueTab) {
    setQueueTab(tab);
    setPage(0);
  }

  function handleTicketUpdated() {
    refetch();
    window.dispatchEvent(new CustomEvent("admin-notifications-refresh"));
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Hỗ trợ khách hàng"
        description="Xem và trả lời ticket từ khách hàng trên storefront"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setQueue("waiting_customer")}
          className={`admin-card p-4 text-left transition-colors ${
            queueTab === "waiting_customer"
              ? "ring-2 ring-keyshop-blue/60"
              : "hover:bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-keyshop-blue/15 text-keyshop-blue">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Chờ khách</p>
              <p className="text-xl font-semibold text-white">{waitingCustomerCount}</p>
              <p className="mt-0.5 text-xs text-keyshop-muted">Ticket mới, cần shop phản hồi</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setQueue("responded")}
          className={`admin-card p-4 text-left transition-colors ${
            queueTab === "responded"
              ? "ring-2 ring-keyshop-blue/60"
              : "hover:bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Đã phản hồi</p>
              <p className="text-xl font-semibold text-white">{respondedCount}</p>
              <p className="mt-0.5 text-xs text-keyshop-muted">Shop đã trả lời, chờ khách phản hồi</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex rounded-xl border border-keyshop-line p-1 w-fit">
        <Button
          type="button"
          size="sm"
          variant={queueTab === "waiting_customer" ? "default" : "ghost"}
          onClick={() => setQueue("waiting_customer")}
        >
          Chờ khách
          {waitingCustomerCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[11px]">
              {waitingCustomerCount}
            </span>
          ) : null}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={queueTab === "responded" ? "default" : "ghost"}
          onClick={() => setQueue("responded")}
        >
          Đã phản hồi
          {respondedCount > 0 ? (
            <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[11px]">
              {respondedCount}
            </span>
          ) : null}
        </Button>
      </div>

      <SearchToolbar
        placeholder="Tìm theo tiêu đề, khách hàng, mã đơn..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={queueTickets.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        filters={
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
          title={
            queueTab === "waiting_customer"
              ? "Không có ticket chờ phản hồi"
              : "Không có ticket đã phản hồi"
          }
          description={
            queueTab === "waiting_customer"
              ? "Mọi ticket mới sẽ hiển thị ở đây."
              : "Ticket shop đã trả lời sẽ hiển thị ở đây."
          }
          actionLabel={activeFilterCount > 0 ? "Xóa bộ lọc" : undefined}
          onAction={activeFilterCount > 0 ? clearFilters : undefined}
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
        onUpdated={handleTicketUpdated}
      />
    </div>
  );
}
