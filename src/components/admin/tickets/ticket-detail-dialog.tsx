"use client";

import { Loader2, Send, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

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

type TicketDetailDialogProps = {
  open: boolean;
  ticketId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

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
          toast.error(err instanceof Error ? err.message : "Không tải được ticket");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, ticketId]);

  async function handleStatusChange(status: AdminTicket["status"]) {
    if (!ticket) return;

    setSaving(true);
    try {
      const updated = await updateTicket(ticket.id, { status });
      setTicket(updated);
      toast.success("Đã cập nhật trạng thái");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
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
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
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
      toast.error(err instanceof Error ? err.message : "Gửi phản hồi thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-keyshop-line bg-keyshop-bg shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-keyshop-line px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {ticket?.subject || "Ticket hỗ trợ"}
            </h2>
            {ticket ? (
              <p className="mt-1 text-sm text-keyshop-muted">
                {ticket.userName} · {ticket.userEmail}
                {ticket.orderId ? ` · Đơn ${ticket.orderId}` : ""}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-keyshop-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : ticket ? (
            <div className="space-y-5">
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

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ticketStatus">Trạng thái</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="ticketPriority">Độ ưu tiên</Label>
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

              <article className="rounded-xl border border-keyshop-line bg-keyshop-soft/40 p-4">
                <p className="text-xs text-keyshop-muted">
                  Khách · {formatDateTime(ticket.createdAt)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white">{ticket.message}</p>
              </article>

              {ticket.replies.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-keyshop-line bg-keyshop-bg/40 p-4"
                >
                  <p className="text-xs text-keyshop-muted">
                    {item.authorRole === "ADMIN" ? "Shop" : "Khách"} ·{" "}
                    {formatDateTime(item.createdAt)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-keyshop-muted">
                    {item.message}
                  </p>
                </article>
              ))}

              <form onSubmit={handleReply} className="space-y-3">
                <Label htmlFor="ticketReply">Phản hồi khách</Label>
                <textarea
                  id="ticketReply"
                  className="min-h-[100px] w-full rounded-xl border border-keyshop-line bg-keyshop-soft px-4 py-3 text-sm text-white placeholder:text-keyshop-muted focus:outline-none focus:ring-2 focus:ring-keyshop-blue/40"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Nhập phản hồi cho khách hàng..."
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Gửi phản hồi
                  </Button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
