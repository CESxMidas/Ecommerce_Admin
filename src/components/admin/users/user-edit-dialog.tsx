"use client";

import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import StatusBadge from "@/components/admin/status-badge";
import { updateUser } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  tAuthProvider,
  tRole,
  tUserStatus,
  tVerified,
  userStatusTone,
} from "@/constants/vi";
import type { AdminUser, UserRole } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

type UserEditDialogProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function UserEditDialog({
  open,
  user,
  onClose,
  onSaved,
}: UserEditDialogProps) {
  const [role, setRole] = useState<UserRole>("USER");
  const [status, setStatus] = useState<AdminUser["status"]>("Active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setRole(user.role);
    setStatus(user.status);
  }, [open, user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUser(user.id, { role, status });
      toast.success("Đã cập nhật người dùng");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-keyshop-line bg-keyshop-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Quản lý người dùng</h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              Cập nhật vai trò và trạng thái tài khoản
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-5 space-y-3 rounded-xl border border-keyshop-line bg-keyshop-soft/40 p-4">
          <div>
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-sm text-keyshop-muted">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={tRole(user.role)} tone={user.role === "ADMIN" ? "info" : "neutral"} />
            <StatusBadge label={tUserStatus(user.status)} tone={userStatusTone(user.status)} />
            <StatusBadge
              label={tVerified(user.verifyEmail)}
              tone={user.verifyEmail ? "success" : "warning"}
            />
            <StatusBadge label={tAuthProvider(user.authProvider)} tone="neutral" />
          </div>
          <p className="text-xs text-keyshop-muted">
            {user.orderCount} đơn hàng · Tham gia {formatDateTime(user.createdAt)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userRole">Vai trò</Label>
            <select
              id="userRole"
              className="admin-filter-select"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <option value="USER">Khách hàng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userStatus">Trạng thái tài khoản</Label>
            <select
              id="userStatus"
              className="admin-filter-select"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminUser["status"])
              }
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
              <option value="Suspended">Đình chỉ</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
