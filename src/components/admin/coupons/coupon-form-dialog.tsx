"use client";

import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { createCoupon, updateCoupon } from "@/lib/services/admin-service";
import { toDateInputValue, validateCouponForm } from "@/lib/utils/coupon-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tCouponType } from "@/constants/vi";
import type { AdminCoupon, CouponType, CouponWritePayload } from "@/types/admin";

type CouponFormDialogProps = {
  open: boolean;
  coupon?: AdminCoupon | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  code: "",
  type: "percent",
  value: "10",
  minOrder: "0",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

function couponToForm(coupon: AdminCoupon): FormState {
  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    minOrder: String(coupon.minOrder ?? 0),
    maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
    usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
    expiresAt: toDateInputValue(coupon.expiresAt),
    isActive: coupon.isActive,
  };
}

export default function CouponFormDialog({
  open,
  coupon,
  onClose,
  onSaved,
}: CouponFormDialogProps) {
  const isEdit = Boolean(coupon);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(coupon ? couponToForm(coupon) : emptyForm);
  }, [open, coupon]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const value = Number(form.value);
    const minOrder = Number(form.minOrder);
    const maxDiscount = form.maxDiscount.trim() ? Number(form.maxDiscount) : null;
    const usageLimit = form.usageLimit.trim() ? Number(form.usageLimit) : null;

    const validationError = validateCouponForm({
      code: form.code,
      type: form.type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      expiresAt: form.expiresAt,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: CouponWritePayload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (isEdit && coupon) {
        await updateCoupon(coupon.id, payload);
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await createCoupon(payload);
        toast.success("Đã tạo mã giảm giá");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Đóng" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-keyshop-line bg-keyshop-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
            </h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="couponCode">Mã *</Label>
            <Input
              id="couponCode"
              value={form.code}
              onChange={(event) => updateField("code", event.target.value.toUpperCase())}
              placeholder="SALE10"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="couponType">Loại</Label>
              <select
                id="couponType"
                className="admin-filter-select"
                value={form.type}
                onChange={(event) => updateField("type", event.target.value as CouponType)}
              >
                <option value="percent">{tCouponType("percent")}</option>
                <option value="fixed">{tCouponType("fixed")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="couponValue">Giá trị *</Label>
              <Input
                id="couponValue"
                type="number"
                min={0}
                max={form.type === "percent" ? 100 : undefined}
                value={form.value}
                onChange={(event) => updateField("value", event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="couponMinOrder">Đơn tối thiểu</Label>
              <Input
                id="couponMinOrder"
                type="number"
                min={0}
                value={form.minOrder}
                onChange={(event) => updateField("minOrder", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couponMaxDiscount">Giảm tối đa</Label>
              <Input
                id="couponMaxDiscount"
                type="number"
                min={0}
                value={form.maxDiscount}
                onChange={(event) => updateField("maxDiscount", event.target.value)}
                placeholder="Không giới hạn"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="couponUsageLimit">Giới hạn lượt dùng</Label>
              <Input
                id="couponUsageLimit"
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(event) => updateField("usageLimit", event.target.value)}
                placeholder="Không giới hạn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couponExpiresAt">Hết hạn</Label>
              <Input
                id="couponExpiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(event) => updateField("expiresAt", event.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-keyshop-muted">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
              className="rounded"
            />
            Đang hoạt động
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mã"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
