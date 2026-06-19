"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, KeyRound, Loader2, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { tDeliveryType, tProductType } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  createProduct,
  fetchCategories,
  fetchProduct,
  updateProduct,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import {
  defaultDeliveryType,
  isPoolProductType,
  slugify,
} from "@/lib/utils/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeliveryType, ProductType } from "@/types/admin";

const productTypes: ProductType[] = [
  "license_key",
  "redeem_code",
  "account",
  "manual_service",
  "hardware",
];

const deliveryTypes: DeliveryType[] = [
  "instant_key",
  "account_credentials",
  "manual_delivery",
  "physical",
];

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  productType: ProductType;
  deliveryType: DeliveryType;
  keyPrefix: string;
  categoryId: string;
  isActive: boolean;
  requiresOnlinePayment: boolean;
  seoTitle: string;
  seoDescription: string;
  thumbnail: string;
  images: string[];
};

const emptyForm: ProductFormState = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "0",
  productType: "license_key",
  deliveryType: "instant_key",
  keyPrefix: "",
  categoryId: "",
  isActive: true,
  requiresOnlinePayment: true,
  seoTitle: "",
  seoDescription: "",
  thumbnail: "",
  images: [],
};

type ProductFormViewProps = {
  productId?: string;
};

function productToForm(product: Awaited<ReturnType<typeof fetchProduct>>): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: String(product.price || ""),
    discountPrice:
      product.discountPrice != null ? String(product.discountPrice) : "",
    stock: String(product.stock ?? 0),
    productType: product.productType,
    deliveryType: product.deliveryType,
    keyPrefix: product.keyPrefix,
    categoryId: product.categoryId != null ? String(product.categoryId) : "",
    isActive: product.isActive,
    requiresOnlinePayment: product.requiresOnlinePayment,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    thumbnail: product.thumbnail,
    images: product.images.filter(Boolean),
  };
}

export default function ProductFormView({ productId }: ProductFormViewProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const {
    data: product,
    loading: productLoading,
    error: productError,
    refetch,
  } = useAdminFetch(() => fetchProduct(productId!), [productId], {
    enabled: isEdit,
  });

  const { data: categories, loading: categoriesLoading } = useAdminFetch(fetchCategories);

  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm(productToForm(product));
    }
  }, [product]);

  const poolEnabled = useMemo(
    () => isPoolProductType(form.productType, form.deliveryType),
    [form.deliveryType, form.productType],
  );

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }

      if (key === "productType") {
        next.deliveryType = defaultDeliveryType(value as ProductType);
        if (value === "hardware") {
          next.requiresOnlinePayment = false;
        }
      }

      return next;
    });
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    target: "thumbnail" | "gallery",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAdminImage(file);
      if (target === "thumbnail") {
        updateField("thumbnail", result.url);
        if (!form.images.includes(result.url)) {
          updateField("images", [result.url, ...form.images]);
        }
      } else {
        updateField("images", [...form.images, result.url]);
        if (!form.thumbnail) {
          updateField("thumbnail", result.url);
        }
      }
      toast.success("Đã tải ảnh lên");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  function removeGalleryImage(url: string) {
    const nextImages = form.images.filter((item) => item !== url);
    updateField("images", nextImages);
    if (form.thumbnail === url) {
      updateField("thumbnail", nextImages[0] || "");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const name = form.name.trim();
    const slug = (form.slug || slugify(name)).trim();
    const price = Number(form.price);

    if (!name) {
      toast.error("Tên sản phẩm là bắt buộc");
      return;
    }

    if (!slug) {
      toast.error("Đường dẫn (slug) là bắt buộc");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Giá bán không hợp lệ");
      return;
    }

    const selectedCategory = categories?.find(
      (category) => String(category.categoryId) === form.categoryId,
    );

    const discountRaw = form.discountPrice.trim();
    const discountPrice = discountRaw ? Number(discountRaw) : null;

    if (discountPrice != null && (!Number.isFinite(discountPrice) || discountPrice < 0)) {
      toast.error("Giá khuyến mãi không hợp lệ");
      return;
    }

    const payload = {
      name,
      slug,
      description: form.description.trim(),
      sku: form.sku.trim() || undefined,
      price,
      discountPrice,
      currency: "VND",
      stock: poolEnabled ? undefined : Number(form.stock || 0),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      categoryName: selectedCategory?.name || "",
      productType: form.productType,
      deliveryType: form.deliveryType,
      keyPrefix: form.keyPrefix.trim(),
      requiresOnlinePayment: form.requiresOnlinePayment,
      seoTitle: form.seoTitle.trim() || name,
      seoDescription: form.seoDescription.trim() || form.description.trim(),
      isActive: form.isActive,
      thumbnail: form.thumbnail,
      images: form.images,
    };

    setSaving(true);
    try {
      if (isEdit && productId) {
        await updateProduct(productId, payload);
        toast.success("Đã cập nhật sản phẩm");
        router.push("/products");
        return;
      }

      const created = await createProduct(payload);
      toast.success("Đã tạo sản phẩm");

      if (isPoolProductType(created.productType, created.deliveryType)) {
        router.push(`/products/${created.productId}/keys`);
        return;
      }

      router.push("/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && productLoading) {
    return <AdminLoading label="Đang tải sản phẩm..." />;
  }

  if (isEdit && (productError || !product)) {
    return (
      <AdminError
        message={productError || "Không tìm thấy sản phẩm"}
        onRetry={refetch}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title={isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        breadcrumbs={[
          { label: "Sản phẩm" },
          { label: isEdit ? product?.name || "Sửa" : "Mới" },
        ]}
        description={
          isEdit
            ? "Cập nhật thông tin sản phẩm trên cửa hàng"
            : "Nhập thông tin sản phẩm mới"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit && poolEnabled ? (
              <Button type="button" variant="outline" asChild>
                <Link href={`/products/${productId}/keys`}>
                  <KeyRound className="h-4 w-4" />
                  Kho key
                </Link>
              </Button>
            ) : null}
            <Button type="button" variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="admin-card space-y-5">
            <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Ví dụ: Bản quyền Windows 11 Pro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(event) => updateField("sku", event.target.value)}
                  placeholder="WIN11-PRO-OEM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Đường dẫn *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateField("slug", slugify(event.target.value));
                  }}
                  placeholder="windows-11-pro"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Mô tả sản phẩm..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </section>

          <section className="admin-card space-y-5">
            <h2 className="text-lg font-semibold text-white">Giá và tồn kho</h2>
            <p className="text-sm text-keyshop-muted">
              Nhập giá bằng VND (đồng). Ví dụ: 2.249.000 đ.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán (đ) *</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="3225000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Giá khuyến mãi (đ)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  min={0}
                  value={form.discountPrice}
                  onChange={(event) => updateField("discountPrice", event.target.value)}
                  placeholder="2249000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">
                  {poolEnabled ? "Tồn kho (từ kho key)" : "Tồn kho"}
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={poolEnabled ? String(product?.stock ?? form.stock) : form.stock}
                  onChange={(event) => updateField("stock", event.target.value)}
                  placeholder="100"
                  disabled={poolEnabled}
                />
                {poolEnabled ? (
                  <p className="text-xs text-keyshop-muted">
                    Tồn kho tự sync theo key khả dụng.{" "}
                    {isEdit ? (
                      <Link
                        href={`/products/${productId}/keys`}
                        className="text-keyshop-blue hover:underline"
                      >
                        Quản lý kho key
                      </Link>
                    ) : (
                      "Sau khi tạo, import key vào kho."
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="admin-card space-y-5">
            <h2 className="text-lg font-semibold text-white">Giao hàng số</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productType">Loại sản phẩm</Label>
                <select
                  id="productType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.productType}
                  onChange={(event) =>
                    updateField("productType", event.target.value as ProductType)
                  }
                >
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {tProductType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryType">Hình thức giao hàng</Label>
                <select
                  id="deliveryType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.deliveryType}
                  onChange={(event) =>
                    updateField("deliveryType", event.target.value as DeliveryType)
                  }
                >
                  {deliveryTypes.map((type) => (
                    <option key={type} value={type}>
                      {tDeliveryType(type)}
                    </option>
                  ))}
                </select>
              </div>
              {poolEnabled ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="keyPrefix">Tiền tố key (tham khảo)</Label>
                  <Input
                    id="keyPrefix"
                    value={form.keyPrefix}
                    onChange={(event) => updateField("keyPrefix", event.target.value)}
                    placeholder="WIN11-"
                  />
                  <p className="text-xs text-keyshop-muted">
                    Key thật được import vào kho — tiền tố chỉ để tham khảo trên admin.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="admin-card space-y-5">
            <h2 className="text-lg font-semibold text-white">SEO</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Tiêu đề SEO</Label>
                <Input
                  id="seoTitle"
                  value={form.seoTitle}
                  onChange={(event) => updateField("seoTitle", event.target.value)}
                  placeholder="Mua key Windows 11 Pro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Mô tả SEO</Label>
                <textarea
                  id="seoDescription"
                  rows={2}
                  value={form.seoDescription}
                  onChange={(event) => updateField("seoDescription", event.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card space-y-4">
            <h2 className="text-lg font-semibold text-white">Xuất bản</h2>
            <label className="flex items-center gap-2 text-sm text-keyshop-muted">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateField("isActive", event.target.checked)}
                className="rounded"
              />
              Đang bán
            </label>
            <label className="flex items-center gap-2 text-sm text-keyshop-muted">
              <input
                type="checkbox"
                checked={form.requiresOnlinePayment}
                onChange={(event) =>
                  updateField("requiresOnlinePayment", event.target.checked)
                }
                className="rounded"
              />
              Yêu cầu thanh toán online
            </label>
            <Button type="submit" className="w-full" disabled={saving || uploading}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu sản phẩm"}
            </Button>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="text-lg font-semibold text-white">Danh mục</h2>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
              disabled={categoriesLoading}
            >
              <option value="">— Chọn danh mục —</option>
              {categories?.map((category) => (
                <option key={category.categoryId} value={String(category.categoryId)}>
                  {category.parentName
                    ? `${category.parentName} › ${category.name}`
                    : category.name}
                </option>
              ))}
            </select>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="text-lg font-semibold text-white">Hình ảnh</h2>
            {form.thumbnail ? (
              <div className="relative overflow-hidden rounded-xl border border-keyshop-line">
                <Image
                  src={form.thumbnail}
                  alt="Thumbnail"
                  width={320}
                  height={320}
                  className="aspect-square w-full object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 bg-black/50 text-white"
                  onClick={() => updateField("thumbnail", "")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-keyshop-line bg-keyshop-bg/50 px-4 py-10 text-center">
                <ImagePlus className="mb-3 h-10 w-10 text-keyshop-muted" />
                <p className="text-sm text-keyshop-muted">Ảnh đại diện sản phẩm</p>
              </div>
            )}
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImageUpload(event, "thumbnail")}
                disabled={uploading}
              />
              <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                <span>{uploading ? "Đang tải..." : "Chọn ảnh đại diện"}</span>
              </Button>
            </label>

            {form.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative">
                    <Image
                      src={url}
                      alt=""
                      width={96}
                      height={96}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/60 p-0.5 text-white"
                      onClick={() => removeGalleryImage(url)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImageUpload(event, "gallery")}
                disabled={uploading}
              />
              <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                <span>Thêm ảnh gallery</span>
              </Button>
            </label>
          </section>
        </div>
      </div>
    </form>
  );
}
