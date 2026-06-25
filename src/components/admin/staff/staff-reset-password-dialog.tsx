"use client";

import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import { resetStaffPassword } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminStaff } from "@/types/admin";

type StaffResetPasswordDialogProps = {
  open: boolean;
  staff: AdminStaff | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function StaffResetPasswordDialog({
  open,
  staff,
  onClose,
  onSaved,
}: StaffResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open || !staff) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!staff) return;

    if (password.length < 8) {
      toast.error("Mật khẩu tối thiểu 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setSaving(true);
    try {
      await resetStaffPassword(staff.id, { password });
      toast.success("Đã đặt lại mật khẩu");
      setPassword("");
      setConfirmPassword("");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Đặt lại mật khẩu thất bại"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-keyshop-line bg-keyshop-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Đặt lại mật khẩu</h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              Tài khoản: {staff.name} ({staff.email})
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới *</Label>
            <Input
              id="newPassword"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              minLength={8}
            />
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
              {saving ? "Đang lưu..." : "Cập nhật mật khẩu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
