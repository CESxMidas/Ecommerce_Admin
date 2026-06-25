"use client";

import Image from "next/image";
import { Loader2, Save, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import {
  createBlog,
  updateBlog,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import {
  requiresApprovalWorkflow,
  submitContentChangeForApproval,
} from "@/lib/auth/content-workflow";
import {
  DEFAULT_BLOG_CATEGORIES,
  toDateInputValue,
  validateBlogForm,
} from "@/lib/utils/blog-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminBlog, BlogWritePayload } from "@/types/admin";

type BlogFormDialogProps = {
  open: boolean;
  blog?: AdminBlog | null;
  categoryOptions?: string[];
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  category: string;
  image: string;
  publishedAt: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  category: "Chung",
  image: "",
  publishedAt: toDateInputValue(),
  isActive: true,
};

function blogToForm(blog: AdminBlog): FormState {
  return {
    title: blog.title,
    description: blog.description,
    category: blog.category || "Chung",
    image: blog.image,
    publishedAt: toDateInputValue(blog.publishedAt),
    isActive: blog.isActive,
  };
}

export default function BlogFormDialog({
  open,
  blog,
  categoryOptions = [],
  onClose,
  onSaved,
}: BlogFormDialogProps) {
  const { data: session } = useSession();
  const needsApproval = requiresApprovalWorkflow(session?.user?.role);
  const isEdit = Boolean(blog);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const categories = useMemo(() => {
    const merged = new Set([...DEFAULT_BLOG_CATEGORIES, ...categoryOptions]);
    if (form.category.trim()) {
      merged.add(form.category.trim());
    }

    return Array.from(merged).sort((a, b) => a.localeCompare(b, "vi"));
  }, [categoryOptions, form.category]);

  useEffect(() => {
    if (!open) return;

    if (blog) {
      setForm(blogToForm(blog));
      return;
    }

    setForm(emptyForm);
  }, [open, blog]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAdminImage(file, "blogs");
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

    const title = form.title.trim();
    const description = form.description.trim();
    const category = form.category.trim();

    const validationError = validateBlogForm({
      title,
      description,
      category,
      publishedAt: form.publishedAt,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: BlogWritePayload = {
      title,
      description,
      category,
      image: form.image.trim(),
      publishedAt: new Date(form.publishedAt).toISOString(),
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      if (isEdit && blog) {
        if (needsApproval) {
          await submitContentChangeForApproval({
            entityType: "blog",
            entityId: blog.id,
            payload,
            changeType: "update",
            summary: `Cập nhật bài viết: ${title}`,
          });
          toast.success("Đã gửi thay đổi chờ chủ shop duyệt");
        } else {
          await updateBlog(blog.id, payload);
          toast.success("Đã cập nhật bài viết");
        }
      } else {
        await createBlog(payload);
        toast.success("Đã tạo bài viết");
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-keyshop-line bg-keyshop-bg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? "Sửa bài viết" : "Thêm bài viết"}
            </h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              {isEdit
                ? "Cập nhật nội dung tin tức trên cửa hàng"
                : "Đăng bài viết mới lên blog"}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blogTitle">Tiêu đề *</Label>
            <Input
              id="blogTitle"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Ví dụ: Hướng dẫn mua key game"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="blogCategory">Danh mục *</Label>
              <Input
                id="blogCategory"
                list="blogCategoryOptions"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="Chung"
                required
              />
              <datalist id="blogCategoryOptions">
                {categories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blogPublishedAt">Ngày xuất bản</Label>
              <Input
                id="blogPublishedAt"
                type="date"
                value={form.publishedAt}
                onChange={(event) => updateField("publishedAt", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogDescription">Mô tả / tóm tắt</Label>
            <textarea
              id="blogDescription"
              rows={5}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Nội dung tóm tắt hiển thị trên trang blog..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-keyshop-muted">
              {form.description.length}/2000 ký tự
            </p>
          </div>

          <div className="space-y-2">
            <Label>Ảnh bìa</Label>
            {form.image ? (
              <div className="relative overflow-hidden rounded-xl border border-keyshop-line">
                <Image
                  src={form.image}
                  alt="Blog cover"
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
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleImageUpload}
              />
              <Button type="button" variant="outline" size="sm" asChild>
                <span>{uploading ? "Đang tải..." : "Chọn ảnh bìa"}</span>
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
            Đang xuất bản trên cửa hàng
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
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo bài viết"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
