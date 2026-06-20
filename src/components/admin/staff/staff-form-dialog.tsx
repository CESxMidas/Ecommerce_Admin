"use client";

import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import StatusBadge from "@/components/admin/status-badge";
import { createStaff, updateStaff } from "@/lib/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  staffRoleTone,
  tRole,
  tUserStatus,
  userStatusTone,
} from "@/constants/vi";
import { isOwnerRole } from "@/lib/auth/permissions";
import type {
  AdminStaff,
  AssignableStaffRole,
  StaffCreatePayload,
} from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

type StaffFormDialogProps = {
  open: boolean;
  staff?: AdminStaff | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  email: string;
  password: string;
  role: AssignableStaffRole;
  status: AdminStaff["status"];
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "STAFF",
  status: "Active",
};

function staffToForm(staff: AdminStaff): FormState {
  return {
    name: staff.name,
    email: staff.email,
    password: "",
    role: staff.role === "MANAGER" ? "MANAGER" : "STAFF",
    status: staff.status,
  };
}

export default function StaffFormDialog({
  open,
  staff,
  onClose,
  onSaved,
}: StaffFormDialogProps) {
  const isEdit = Boolean(staff);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (staff) {
      setForm(staffToForm(staff));
      return;
    }

    setForm(emptyForm);
  }, [open, staff]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    if (!isEdit && !email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!isEdit && form.password.length < 8) {
      toast.error("Mật khẩu tối thiểu 8 ký tự");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && staff) {
        if (isOwnerRole(staff.role)) {
          await updateStaff(staff.id, { name, status: form.status });
        } else {
          await updateStaff(staff.id, {
            name,
            role: form.role,
            status: form.status,
          });
        }
        toast.success("Đã cập nhật nhân viên");
      } else {
        const payload: StaffCreatePayload = {
          name,
          email,
          password: form.password,
          role: form.role,
        };
        await createStaff(payload);
        toast.success("Đã tạo tài khoản nhân viên");
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const ownerAccount = staff ? isOwnerRole(staff.role) : false;

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
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? "Sửa nhân viên" : "Thêm nhân viên"}
            </h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              {isEdit
                ? "Cập nhật vai trò và trạng thái tài khoản nội bộ"
                : "Tạo tài khoản Quản lý hoặc Nhân viên cho shop"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {staff ? (
          <div className="mb-5 space-y-3 rounded-xl border border-keyshop-line bg-keyshop-soft/40 p-4">
            <div>
              <p className="font-medium text-white">{staff.name}</p>
              <p className="text-sm text-keyshop-muted">{staff.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={tRole(staff.role)} tone={staffRoleTone(staff.role)} />
              <StatusBadge
                label={tUserStatus(staff.status)}
                tone={userStatusTone(staff.status)}
              />
            </div>
            <p className="text-xs text-keyshop-muted">
              Tạo {formatDateTime(staff.createdAt)}
              {staff.lastLoginAt ? ` · Đăng nhập ${formatDateTime(staff.lastLoginAt)}` : ""}
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffName">Họ tên *</Label>
            <Input
              id="staffName"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          {!isEdit ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="staffEmail">Email đăng nhập *</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="manager@keyshop.vn"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffPassword">Mật khẩu *</Label>
                <Input
                  id="staffPassword"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                  minLength={8}
                />
              </div>
            </>
          ) : null}

          {!ownerAccount ? (
            <div className="space-y-2">
              <Label htmlFor="staffRole">Vai trò</Label>
              <select
                id="staffRole"
                className="admin-filter-select"
                value={form.role}
                onChange={(event) =>
                  updateField("role", event.target.value as AssignableStaffRole)
                }
              >
                <option value="MANAGER">Quản lý</option>
                <option value="STAFF">Nhân viên</option>
              </select>
            </div>
          ) : null}

          {isEdit ? (
            <div className="space-y-2">
              <Label htmlFor="staffStatus">Trạng thái</Label>
              <select
                id="staffStatus"
                className="admin-filter-select"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as AdminStaff["status"])
                }
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
                <option value="Suspended">Đình chỉ</option>
              </select>
            </div>
          ) : null}

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
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo tài khoản"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
