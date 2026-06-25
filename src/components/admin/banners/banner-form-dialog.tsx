"use client";

import Image from "next/image";
import { ChevronDown, Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import {
  createBanner,
  updateBanner,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import { nextBannerSortOrder, validateBannerForm } from "@/lib/utils/banner-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tPlacement } from "@/constants/vi";
import type { AdminBanner, BannerPlacement, BannerWritePayload } from "@/types/admin";

type BannerFormDialogProps = {
  open: boolean;
  banner?: AdminBanner | null;
  existingBanners?: AdminBanner[];
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  placement: BannerPlacement;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  placement: "home_slider",
  sortOrder: "0",
  isActive: true,
};

function bannerToForm(banner: AdminBanner): FormState {
  return {
    title: banner.title,
    subtitle: banner.subtitle,
    image: banner.image,
    link: banner.link,
    placement: banner.placement,
    sortOrder: String(banner.sortOrder ?? 0),
    isActive: banner.isActive,
  };
}

function createEmptyForm(existingBanners: AdminBanner[]): FormState {
  const placement = emptyForm.placement;

  return {
    ...emptyForm,
    sortOrder: String(nextBannerSortOrder(existingBanners, placement)),
  };
}

export default function BannerFormDialog({
  open,
  banner,
  existingBanners = [],
  onClose,
  onSaved,
}: BannerFormDialogProps) {
  const isEdit = Boolean(banner);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setForm(banner ? bannerToForm(banner) : createEmptyForm(existingBanners));
    // Chỉ reset form khi mở dialog hoặc đổi banner đang sửa — không reset khi list refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- existingBanners cố ý bỏ khỏi deps
  }, [open, banner]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updatePlacement(placement: BannerPlacement) {
    setForm((prev) => ({
      ...prev,
      placement,
      sortOrder: isEdit
        ? prev.sortOrder
        : String(nextBannerSortOrder(existingBanners, placement)),
    }));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAdminImage(file, "banners");
      updateField("image", result.url);
      toast.success("Đã tải ảnh lên");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Upload thất bại"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const sortOrder = Number(form.sortOrder);
    const validationError = validateBannerForm({
      title: form.title,
      subtitle: form.subtitle,
      image: form.image,
      link: form.link,
      placement: form.placement,
      sortOrder,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: BannerWritePayload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image: form.image.trim(),
      link: form.link.trim(),
      placement: form.placement,
      sortOrder,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (isEdit && banner) {
        await updateBanner(banner.id, payload);
        toast.success("Đã cập nhật banner");
      } else {
        await createBanner(payload);
        toast.success("Đã tạo banner");
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lưu thất bại"));
    } finally {
      setSaving(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <button
        type="button"
        className="fixed inset-0 bg-black/70"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="banner-dialog-title"
          className="relative z-10 flex w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-keyshop-line bg-keyshop-bg shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]"
        >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-keyshop-line px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 id="banner-dialog-title" className="text-xl font-semibold text-white">
              {isEdit ? "Sửa banner" : "Thêm banner"}
            </h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              {isEdit
                ? "Cập nhật banner slider trang chủ hoặc vị trí quảng cáo"
                : "Tải ảnh, chọn vị trí và thứ tự hiển thị trên cửa hàng"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid h-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bannerTitle">Tiêu đề *</Label>
                  <Input
                    id="bannerTitle"
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    placeholder="Ví dụ: Key & bản quyền chính hãng"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerSubtitle">Phụ đề</Label>
                  <Input
                    id="bannerSubtitle"
                    value={form.subtitle}
                    onChange={(event) => updateField("subtitle", event.target.value)}
                    placeholder="Mô tả ngắn hiển thị dưới tiêu đề"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bannerPlacement">Vị trí</Label>
                    <div className="relative">
                      <select
                        id="bannerPlacement"
                        className="admin-filter-select"
                        value={form.placement}
                        onChange={(event) =>
                          updatePlacement(event.target.value as BannerPlacement)
                        }
                      >
                        <option value="home_slider">{tPlacement("home_slider")}</option>
                        <option value="ads">{tPlacement("ads")}</option>
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-keyshop-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bannerSortOrder">Thứ tự</Label>
                    <Input
                      id="bannerSortOrder"
                      type="number"
                      min={0}
                      value={form.sortOrder}
                      onChange={(event) => updateField("sortOrder", event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerLink">Liên kết</Label>
                  <Input
                    id="bannerLink"
                    value={form.link}
                    onChange={(event) => updateField("link", event.target.value)}
                    placeholder="/products hoặc https://..."
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-keyshop-muted">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => updateField("isActive", event.target.checked)}
                    className="rounded"
                  />
                  Đang hiển thị trên cửa hàng
                </label>
              </div>

              <div className="flex flex-col space-y-3">
                <Label>Ảnh banner *</Label>
                {form.image ? (
                  <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-keyshop-line">
                    <Image
                      src={form.image}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 bg-black/50 text-white"
                      onClick={() => updateField("image", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex aspect-[2/1] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-keyshop-line bg-keyshop-soft/20 px-4 text-center">
                    <p className="text-sm font-medium text-white">Chưa có ảnh</p>
                    <p className="text-xs text-keyshop-muted">Tải ảnh ngang (tỷ lệ 2:1) để hiển thị tốt trên slider</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? "Đang tải..." : form.image ? "Đổi ảnh" : "Chọn ảnh"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-keyshop-line bg-keyshop-bg px-5 py-4 sm:px-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving || uploading}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo banner"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
