"use client";

import Image from "next/image";
import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createBanner,
  updateBanner,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import { validateBannerForm } from "@/lib/utils/banner-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tPlacement } from "@/constants/vi";
import type { AdminBanner, BannerPlacement, BannerWritePayload } from "@/types/admin";

type BannerFormDialogProps = {
  open: boolean;
  banner?: AdminBanner | null;
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

export default function BannerFormDialog({
  open,
  banner,
  onClose,
  onSaved,
}: BannerFormDialogProps) {
  const isEdit = Boolean(banner);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(banner ? bannerToForm(banner) : emptyForm);
  }, [open, banner]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
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
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Đóng" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-keyshop-line bg-keyshop-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? "Sửa banner" : "Thêm banner"}
            </h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              Banner slider trang chủ hoặc vị trí quảng cáo
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bannerTitle">Tiêu đề *</Label>
            <Input
              id="bannerTitle"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerSubtitle">Phụ đề</Label>
            <Input
              id="bannerSubtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bannerPlacement">Vị trí</Label>
              <select
                id="bannerPlacement"
                className="admin-filter-select"
                value={form.placement}
                onChange={(event) =>
                  updateField("placement", event.target.value as BannerPlacement)
                }
              >
                <option value="home_slider">{tPlacement("home_slider")}</option>
                <option value="ads">{tPlacement("ads")}</option>
              </select>
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

          <div className="space-y-2">
            <Label>Ảnh banner *</Label>
            {form.image ? (
              <div className="relative overflow-hidden rounded-xl border border-keyshop-line">
                <Image
                  src={form.image}
                  alt="Banner"
                  width={640}
                  height={320}
                  className="h-40 w-full object-cover"
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
            ) : null}
            <label className="block">
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={handleImageUpload} />
              <Button type="button" variant="outline" size="sm" asChild>
                <span>{uploading ? "Đang tải..." : "Chọn ảnh"}</span>
              </Button>
            </label>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo banner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
