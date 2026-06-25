"use client";

import Image from "next/image";
import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import {
  createCategory,
  updateCategory,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import {
  requiresApprovalWorkflow,
  submitContentChangeForApproval,
} from "@/lib/auth/content-workflow";
import {
  getDescendantCategoryIds,
  slugify,
  validateCategoryForm,
} from "@/lib/utils/category-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminCategory, CategoryWritePayload } from "@/types/admin";

type CategoryFormDialogProps = {
  open: boolean;
  categories: AdminCategory[];
  category?: AdminCategory | null;
  defaultParentId?: number | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  sortOrder: string;
  isActive: boolean;
  image: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
  sortOrder: "0",
  isActive: true,
  image: "",
};

function categoryToForm(category: AdminCategory): FormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId != null ? String(category.parentId) : "",
    sortOrder: String(category.sortOrder ?? 0),
    isActive: category.isActive,
    image: category.image,
  };
}

export default function CategoryFormDialog({
  open,
  categories,
  category,
  defaultParentId = null,
  onClose,
  onSaved,
}: CategoryFormDialogProps) {
  const { data: session } = useSession();
  const needsApproval = requiresApprovalWorkflow(session?.user?.role);
  const isEdit = Boolean(category);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (category) {
      setForm(categoryToForm(category));
      setSlugTouched(true);
      return;
    }

    setForm({
      ...emptyForm,
      parentId: defaultParentId != null ? String(defaultParentId) : "",
      sortOrder: String((categories.at(-1)?.sortOrder ?? 0) + 1),
    });
    setSlugTouched(false);
  }, [open, category, defaultParentId, categories]);

  const parentOptions = useMemo(() => {
    if (!category) return categories;

    const blocked = getDescendantCategoryIds(categories, category.categoryId);
    blocked.add(category.categoryId);

    return categories.filter((item) => !blocked.has(item.categoryId));
  }, [categories, category]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }

      return next;
    });
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAdminImage(file, "categories");
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

    const name = form.name.trim();
    const slug = (form.slug || slugify(name)).trim();
    const sortOrder = Number(form.sortOrder);
    const parentId = form.parentId ? Number(form.parentId) : null;

    const validationError = validateCategoryForm({
      name,
      slug,
      sortOrder,
      parentId,
      existingCategories: categories,
      currentCategoryId: category?.categoryId,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: CategoryWritePayload = {
      name,
      slug,
      description: form.description.trim(),
      image: form.image,
      parentId,
      sortOrder,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (isEdit && category) {
        if (needsApproval) {
          await submitContentChangeForApproval({
            entityType: "category",
            entityId: String(category.categoryId),
            payload,
            changeType: "update",
            summary: `Cập nhật danh mục: ${name}`,
          });
          toast.success("Đã gửi thay đổi chờ chủ shop duyệt");
        } else {
          await updateCategory(String(category.categoryId), payload);
          toast.success("Đã cập nhật danh mục");
        }
      } else {
        await createCategory(payload);
        toast.success("Đã tạo danh mục");
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lưu thất bại"));
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-keyshop-line bg-keyshop-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? "Sửa danh mục" : "Thêm danh mục"}
            </h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              {isEdit
                ? "Cập nhật thông tin phân loại sản phẩm"
                : "Tạo danh mục mới trên cửa hàng"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Tên danh mục *</Label>
            <Input
              id="categoryName"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ví dụ: Phần mềm"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categorySlug">Slug *</Label>
              <Input
                id="categorySlug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField("slug", slugify(event.target.value));
                }}
                placeholder="phan-mem"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categorySortOrder">Thứ tự</Label>
              <Input
                id="categorySortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) => updateField("sortOrder", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryParent">Danh mục cha</Label>
            <select
              id="categoryParent"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.parentId}
              onChange={(event) => updateField("parentId", event.target.value)}
            >
              <option value="">— Không có (danh mục gốc) —</option>
              {parentOptions.map((item) => (
                <option key={item.categoryId} value={String(item.categoryId)}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Mô tả</Label>
            <textarea
              id="categoryDescription"
              rows={3}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Ảnh danh mục</Label>
            {form.image ? (
              <div className="relative overflow-hidden rounded-xl border border-keyshop-line">
                <Image
                  src={form.image}
                  alt="Category"
                  width={320}
                  height={160}
                  className="h-32 w-full object-cover"
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
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleImageUpload}
              />
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
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo danh mục"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
