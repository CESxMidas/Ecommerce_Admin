"use client";

import { Check, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  revisionStatusTone,
  tAuditEntityType,
  tRevisionChangeType,
  tRevisionStatus,
  tRole,
} from "@/constants/vi";
import { hasPermission } from "@/lib/auth/permissions";
import {
  approveContentRevision,
  fetchContentRevision,
  rejectContentRevision,
} from "@/lib/services/admin-service";
import type { AdminContentRevision } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type ContentRevisionDetailDialogProps = {
  open: boolean;
  revisionId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

const PAYLOAD_LABELS: Record<string, string> = {
  name: "Tên",
  title: "Tiêu đề",
  slug: "Slug",
  sku: "SKU",
  description: "Mô tả",
  price: "Giá",
  discountPrice: "Giá giảm",
  stock: "Tồn kho",
  categoryId: "Danh mục",
  categoryName: "Tên danh mục",
  productType: "Loại sản phẩm",
  deliveryType: "Giao hàng",
  keyPrefix: "Tiền tố key",
  isActive: "Đang hiển thị",
  requiresOnlinePayment: "Thanh toán online",
  seoTitle: "SEO title",
  seoDescription: "SEO mô tả",
  thumbnail: "Ảnh đại diện",
  images: "Ảnh gallery",
  subtitle: "Phụ đề",
  image: "Ảnh",
  link: "Liên kết",
  placement: "Vị trí",
  sortOrder: "Thứ tự",
  category: "Chuyên mục",
  publishedAt: "Ngày đăng",
  code: "Mã",
  discountType: "Loại giảm",
  discountValue: "Giá trị giảm",
  minOrderAmount: "Đơn tối thiểu",
  maxUses: "Số lần dùng",
  startsAt: "Bắt đầu",
  endsAt: "Kết thúc",
  parentId: "Danh mục cha",
};

function formatPayloadValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function PayloadPreview({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload);

  if (entries.length === 0) {
    return <p className="text-sm text-keyshop-muted">Không có dữ liệu thay đổi.</p>;
  }

  return (
    <dl className="divide-y divide-keyshop-line rounded-xl border border-keyshop-line">
      {entries.map(([key, value]) => (
        <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr]">
          <dt className="text-xs font-medium uppercase tracking-wide text-keyshop-muted">
            {PAYLOAD_LABELS[key] ?? key}
          </dt>
          <dd className="text-sm text-white break-words whitespace-pre-wrap">
            {formatPayloadValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ContentRevisionDetailDialog({
  open,
  revisionId,
  onClose,
  onUpdated,
}: ContentRevisionDetailDialogProps) {
  const { data: session } = useSession();
  const canApprove = hasPermission(session?.user?.role, "content.approve");

  const [revision, setRevision] = useState<AdminContentRevision | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !revisionId) {
      setRevision(null);
      setReviewNote("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchContentRevision(revisionId)
      .then((data) => {
        if (!cancelled) setRevision(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, "Không tải được chi tiết duyệt"));
          onClose();
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, revisionId, onClose]);

  async function handleApprove(event: FormEvent) {
    event.preventDefault();
    if (!revision) return;

    setSaving(true);
    try {
      await approveContentRevision(revision.id, reviewNote.trim() || undefined);
      toast.success("Đã duyệt và áp dụng thay đổi lên cửa hàng");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Duyệt thất bại"));
    } finally {
      setSaving(false);
    }
  }

  async function handleReject(event: FormEvent) {
    event.preventDefault();
    if (!revision) return;

    const note = reviewNote.trim();
    if (!note) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setSaving(true);
    try {
      await rejectContentRevision(revision.id, note);
      toast.success("Đã từ chối thay đổi");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Từ chối thất bại"));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const canReview = canApprove && revision?.status === "pending_review";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-keyshop-line bg-keyshop-bg shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-keyshop-line px-6 py-5">
          <div className="min-w-0 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-keyshop-muted">
              {revision ? tAuditEntityType(revision.entityType) : "Chi tiết duyệt"}
            </p>
            <h2 className="truncate text-xl font-semibold text-white">
              {revision?.entityLabel || revision?.summary || "Đang tải..."}
            </h2>
            {revision ? (
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  label={tRevisionStatus(revision.status)}
                  tone={revisionStatusTone(revision.status)}
                />
                <StatusBadge
                  label={tRevisionChangeType(revision.changeType)}
                  tone="neutral"
                />
              </div>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-keyshop-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : revision ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-keyshop-line bg-keyshop-soft/40 p-4">
                  <p className="text-xs text-keyshop-muted">Người gửi</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {revision.submittedByName || "—"}
                  </p>
                  {revision.submittedByRole ? (
                    <p className="text-xs text-keyshop-muted">
                      {tRole(revision.submittedByRole)}
                    </p>
                  ) : null}
                  {revision.submittedAt ? (
                    <p className="mt-2 text-xs text-keyshop-muted">
                      {formatDateTime(revision.submittedAt)}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-keyshop-line bg-keyshop-soft/40 p-4">
                  <p className="text-xs text-keyshop-muted">Tóm tắt</p>
                  <p className="mt-1 text-sm text-white">{revision.summary}</p>
                  {revision.submitNote ? (
                    <p className="mt-2 text-xs text-keyshop-muted">
                      Ghi chú gửi: {revision.submitNote}
                    </p>
                  ) : null}
                </div>
              </div>

              {revision.reviewNote ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs font-medium text-amber-400">Phản hồi duyệt</p>
                  <p className="mt-1 text-sm text-white">{revision.reviewNote}</p>
                  {revision.reviewedByName ? (
                    <p className="mt-2 text-xs text-keyshop-muted">
                      {revision.reviewedByName}
                      {revision.reviewedAt ? ` · ${formatDateTime(revision.reviewedAt)}` : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Nội dung thay đổi</h3>
                <PayloadPreview payload={revision.payload} />
              </div>

              {canReview ? (
                <form className="space-y-3 rounded-xl border border-keyshop-line bg-keyshop-soft/30 p-4">
                  <Label htmlFor="reviewNote">Ghi chú duyệt (bắt buộc khi từ chối)</Label>
                  <textarea
                    id="reviewNote"
                    rows={3}
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    placeholder="Nhập ghi chú cho người gửi..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={handleReject}
                      className={cn(!reviewNote.trim() && "opacity-70")}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Từ chối
                    </Button>
                    <Button type="button" disabled={saving} onClick={handleApprove}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Duyệt & áp dụng
                    </Button>
                  </div>
                </form>
              ) : revision.status === "pending_review" && !canApprove ? (
                <p className="rounded-xl border border-keyshop-line bg-keyshop-soft/30 px-4 py-3 text-sm text-keyshop-muted">
                  Chỉ chủ shop mới có thể duyệt hoặc từ chối thay đổi này.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
