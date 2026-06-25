"use client";

import { Loader2, Send, User, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ticketPriorityTone,
  ticketStatusTone,
  tTicketPriority,
  tTicketStatus,
} from "@/constants/vi";
import { fetchTicket, replyTicket, updateTicket } from "@/lib/services/admin-service";
import type { AdminTicket } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type TicketDetailDialogProps = {
  open: boolean;
  ticketId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

type ChatMessage = {
  id: string;
  authorRole: string;
  message: string;
  createdAt: string;
};

function buildThread(ticket: AdminTicket): ChatMessage[] {
  return [
    {
      id: "initial",
      authorRole: "USER",
      message: ticket.message,
      createdAt: ticket.createdAt,
    },
    ...ticket.replies,
  ];
}

function ChatBubble({ item }: { item: ChatMessage }) {
  const isShop = item.authorRole === "ADMIN";

  return (
    <div className={cn("flex w-full", isShop ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 shadow-sm",
          isShop
            ? "rounded-br-md border border-keyshop-blue/25 bg-keyshop-blue/15"
            : "rounded-bl-md border border-keyshop-line bg-keyshop-soft/70",
        )}
      >
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] text-keyshop-muted">
          <span className="font-medium text-white/90">
            {isShop ? "Shop" : "Khách hàng"}
          </span>
          <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
        </div>
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap break-words",
            isShop ? "text-white" : "text-keyshop-muted",
          )}
        >
          {item.message}
        </p>
      </div>
    </div>
  );
}

export default function TicketDetailDialog({
  open,
  ticketId,
  onClose,
  onUpdated,
}: TicketDetailDialogProps) {
  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !ticketId) {
      setTicket(null);
      setReply("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchTicket(ticketId)
      .then((data) => {
        if (!cancelled) setTicket(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, "Không tải được ticket"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, ticketId]);

  useEffect(() => {
    if (!open || !ticket || loading) return;
    const node = threadRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [open, ticket, loading]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function handleStatusChange(status: AdminTicket["status"]) {
    if (!ticket) return;

    setSaving(true);
    try {
      const updated = await updateTicket(ticket.id, { status });
      setTicket(updated);
      toast.success("Đã cập nhật trạng thái");
      onUpdated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Cập nhật thất bại"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePriorityChange(priority: AdminTicket["priority"]) {
    if (!ticket) return;

    setSaving(true);
    try {
      const updated = await updateTicket(ticket.id, { priority });
      setTicket(updated);
      toast.success("Đã cập nhật độ ưu tiên");
      onUpdated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Cập nhật thất bại"));
    } finally {
      setSaving(false);
    }
  }

  async function handleReply(event: FormEvent) {
    event.preventDefault();
    if (!ticket) return;

    const message = reply.trim();
    if (!message) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSaving(true);
    try {
      const updated = await replyTicket(ticket.id, { message, status: "pending" });
      setTicket(updated);
      setReply("");
      toast.success("Đã gửi phản hồi");
      onUpdated();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Gửi phản hồi thất bại"));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const thread = ticket ? buildThread(ticket) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-dialog-title"
        className="relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-keyshop-line bg-keyshop-bg shadow-2xl lg:max-h-[min(88vh,860px)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-keyshop-line px-5 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h2 id="ticket-dialog-title" className="truncate text-lg font-semibold text-white sm:text-xl">
              {ticket?.subject || "Ticket hỗ trợ"}
            </h2>
            {ticket ? (
              <p className="mt-1 truncate text-sm text-keyshop-muted">
                {ticket.userName} · {ticket.userEmail}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20 text-keyshop-muted">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : ticket ? (
          <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(240px,280px)_1fr]">
            <aside className="shrink-0 space-y-4 border-b border-keyshop-line bg-keyshop-soft/25 p-5 lg:border-b-0 lg:border-r">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-keyshop-blue/15 text-keyshop-blue">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white">{ticket.userName}</p>
                  <p className="truncate text-xs text-keyshop-muted">{ticket.userEmail}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  label={tTicketStatus(ticket.status)}
                  tone={ticketStatusTone(ticket.status)}
                />
                <StatusBadge
                  label={tTicketPriority(ticket.priority)}
                  tone={ticketPriorityTone(ticket.priority)}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ticketStatus" className="text-xs">
                    Trạng thái
                  </Label>
                  <select
                    id="ticketStatus"
                    className="admin-filter-select"
                    value={ticket.status}
                    disabled={saving}
                    onChange={(event) =>
                      handleStatusChange(event.target.value as AdminTicket["status"])
                    }
                  >
                    <option value="open">Mới</option>
                    <option value="pending">Chờ khách</option>
                    <option value="resolved">Đã xử lý</option>
                    <option value="closed">Đóng</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ticketPriority" className="text-xs">
                    Độ ưu tiên
                  </Label>
                  <select
                    id="ticketPriority"
                    className="admin-filter-select"
                    value={ticket.priority}
                    disabled={saving}
                    onChange={(event) =>
                      handlePriorityChange(event.target.value as AdminTicket["priority"])
                    }
                  >
                    <option value="low">Thấp</option>
                    <option value="normal">Bình thường</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
              </div>

              <dl className="space-y-2 border-t border-keyshop-line/80 pt-3 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-keyshop-muted">Tạo lúc</dt>
                  <dd className="text-right text-white">{formatDateTime(ticket.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-keyshop-muted">Cập nhật</dt>
                  <dd className="text-right text-white">{formatDateTime(ticket.updatedAt)}</dd>
                </div>
                {ticket.orderId ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-keyshop-muted">Đơn hàng</dt>
                    <dd className="font-mono text-right text-keyshop-blue">{ticket.orderId}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt className="text-keyshop-muted">Tin nhắn</dt>
                  <dd className="text-right text-white">{thread.length}</dd>
                </div>
              </dl>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div
                ref={threadRef}
                className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:min-h-[320px]"
              >
                {thread.length === 0 ? (
                  <p className="py-8 text-center text-sm text-keyshop-muted">
                    Chưa có nội dung hội thoại.
                  </p>
                ) : (
                  thread.map((item) => <ChatBubble key={item.id} item={item} />)
                )}
              </div>

              <form
                onSubmit={handleReply}
                className="shrink-0 border-t border-keyshop-line bg-keyshop-bg/95 px-4 py-4 backdrop-blur sm:px-5"
              >
                <Label htmlFor="ticketReply" className="mb-2 block text-xs text-keyshop-muted">
                  Phản hồi khách
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    id="ticketReply"
                    rows={3}
                    className="min-h-[88px] flex-1 resize-y rounded-xl border border-keyshop-line bg-keyshop-soft px-4 py-3 text-sm text-white placeholder:text-keyshop-muted focus:outline-none focus:ring-2 focus:ring-keyshop-blue/40 sm:min-h-[72px]"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Nhập phản hồi cho khách hàng..."
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                  <Button type="submit" disabled={saving} className="w-full shrink-0 sm:w-auto">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Gửi phản hồi
                  </Button>
                </div>
                <p className="mt-2 hidden text-[11px] text-keyshop-muted sm:block">
                  Ctrl + Enter để gửi nhanh
                </p>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
