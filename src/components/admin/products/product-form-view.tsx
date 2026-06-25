"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, KeyRound, Loader2, Save, Trash2, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import AdminPageHeader from "@/components/admin/admin-page-header";
import ProductReviewsPanel from "@/components/admin/products/product-reviews-panel";
import { tDeliveryType } from "@/constants/vi";
import {
  DIGITAL_KEY_VARIANTS,
  getCatalogKindFromProduct,
  getCatalogAllowedCategoryIds,
  getDefaultCategoryIdForCatalog,
  getRootCategories,
  PRODUCT_CATALOG_OPTIONS,
  resolveProductTypesFromCatalog,
  type ProductCatalogKind,
} from "@/constants/product-catalog";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  requiresApprovalWorkflow,
  submitContentChangeForApproval,
} from "@/lib/auth/content-workflow";
import {
  createProduct,
  fetchCategories,
  fetchProduct,
  fetchProducts,
  updateProduct,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import {
  defaultDeliveryType,
  getDeliveryTypeMismatchMessage,
  isAccountPoolProductType,
  isPoolProductType,
  usesManagedPool,
  slugify,
  validateProductForm,
} from "@/lib/utils/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeliveryType, ProductType } from "@/types/admin";

type ProductFormState = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  catalogKind: ProductCatalogKind;
  keyVariant: "license_key" | "redeem_code";
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
  catalogKind: "digital_key",
  keyVariant: "license_key",
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
  const catalogKind = getCatalogKindFromProduct(product);
  const resolvedCatalogKind: ProductCatalogKind =
    catalogKind === "manual_service" ? "digital_key" : catalogKind;

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: String(product.price || ""),
    discountPrice:
      product.discountPrice != null ? String(product.discountPrice) : "",
    stock: String(product.stock ?? 0),
    catalogKind: resolvedCatalogKind,
    keyVariant: product.productType === "redeem_code" ? "redeem_code" : "license_key",
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

function applyCatalogSelection(
  catalogKind: ProductCatalogKind,
  keyVariant: "license_key" | "redeem_code",
) {
  const resolved = resolveProductTypesFromCatalog(catalogKind, keyVariant);

  return {
    catalogKind,
    keyVariant,
    productType: resolved.productType,
    deliveryType: resolved.deliveryType,
    requiresOnlinePayment: catalogKind !== "hardware",
  };
}

export default function ProductFormView({ productId }: ProductFormViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const needsApproval = requiresApprovalWorkflow(session?.user?.role);
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
  const { data: productsCatalog } = useAdminFetch(fetchProducts);

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
    () => usesManagedPool(form.productType, form.deliveryType),
    [form.deliveryType, form.productType],
  );
  const keyPoolEnabled = useMemo(
    () => isPoolProductType(form.productType, form.deliveryType),
    [form.deliveryType, form.productType],
  );
  const accountPoolEnabled = useMemo(
    () => isAccountPoolProductType(form.productType, form.deliveryType),
    [form.deliveryType, form.productType],
  );
  const isLegacyManualService = product?.productType === "manual_service";
  const selectedCatalog = PRODUCT_CATALOG_OPTIONS.find(
    (option) => option.value === form.catalogKind,
  );
  const categoryGroups = useMemo(() => {
    if (!categories?.length) {
      return [];
    }

    const allowedIds = getCatalogAllowedCategoryIds(categories, form.catalogKind);

    return getRootCategories(categories)
      .filter((root) => allowedIds.has(root.categoryId))
      .map((root) => ({
        root,
        children: categories.filter(
          (category) =>
            category.parentId === root.categoryId && allowedIds.has(category.categoryId),
        ),
      }));
  }, [categories, form.catalogKind]);

  const deliveryMismatch = useMemo(
    () => getDeliveryTypeMismatchMessage(form.productType, form.deliveryType),
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

      if (key === "catalogKind") {
        const catalogKind = value as ProductCatalogKind;
        Object.assign(next, applyCatalogSelection(catalogKind, next.keyVariant));

        if (categories?.length) {
          const defaultCategoryId = getDefaultCategoryIdForCatalog(
            categories,
            catalogKind,
            next.keyVariant,
          );
          if (defaultCategoryId != null) {
            next.categoryId = String(defaultCategoryId);
          }
        }
      }

      if (key === "keyVariant") {
        const keyVariant = value as "license_key" | "redeem_code";
        Object.assign(next, applyCatalogSelection(next.catalogKind, keyVariant));

        if (categories?.length) {
          const defaultCategoryId = getDefaultCategoryIdForCatalog(
            categories,
            next.catalogKind,
            keyVariant,
          );
          if (defaultCategoryId != null) {
            next.categoryId = String(defaultCategoryId);
          }
        }
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
      toast.error(getApiErrorMessage(err, "Upload thất bại"));
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
    const discountRaw = form.discountPrice.trim();
    const discountPrice = discountRaw ? Number(discountRaw) : null;

    let existingProducts = productsCatalog ?? [];
    if (existingProducts.length === 0) {
      existingProducts = await fetchProducts();
    }

    const validationError = validateProductForm({
      name,
      slug,
      price,
      discountPrice,
      categoryId: form.categoryId,
      productType: form.productType,
      deliveryType: form.deliveryType,
      existingProducts,
      currentProductId: product?.productId,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const selectedCategory = categories?.find(
      (category) => String(category.categoryId) === form.categoryId,
    );

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
        if (needsApproval) {
          await submitContentChangeForApproval({
            entityType: "product",
            entityId: productId,
            payload,
            changeType: "update",
            summary: `Cập nhật sản phẩm: ${name}`,
          });
          toast.success("Đã gửi thay đổi chờ chủ shop duyệt");
          router.push("/products");
          return;
        }

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

      if (isAccountPoolProductType(created.productType, created.deliveryType)) {
        router.push(`/products/${created.productId}/accounts`);
        return;
      }

      router.push("/products");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lưu thất bại"));
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
            ? needsApproval
              ? "Thay đổi sẽ gửi chờ chủ shop duyệt trước khi hiển thị trên cửa hàng"
              : "Cập nhật thông tin sản phẩm trên cửa hàng"
            : "Nhập thông tin sản phẩm mới"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {isEdit && keyPoolEnabled ? (
              <Button type="button" variant="outline" asChild>
                <Link href={`/products/${productId}/keys`}>
                  <KeyRound className="h-4 w-4" />
                  Kho key
                </Link>
              </Button>
            ) : null}
            {isEdit && accountPoolEnabled ? (
              <Button type="button" variant="outline" asChild>
                <Link href={`/products/${productId}/accounts`}>
                  <UserRound className="h-4 w-4" />
                  Kho tài khoản
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
                  {poolEnabled ? "Tồn kho (từ kho số)" : "Tồn kho"}
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
                    Tồn kho tự sync theo {keyPoolEnabled ? "key" : "tài khoản"} khả dụng.{" "}
                    {isEdit ? (
                      keyPoolEnabled ? (
                        <Link
                          href={`/products/${productId}/keys`}
                          className="text-keyshop-blue hover:underline"
                        >
                          Quản lý kho key
                        </Link>
                      ) : (
                        <Link
                          href={`/products/${productId}/accounts`}
                          className="text-keyshop-blue hover:underline"
                        >
                          Quản lý kho tài khoản
                        </Link>
                      )
                    ) : (
                      `Sau khi tạo, import ${keyPoolEnabled ? "key" : "tài khoản"} vào kho.`
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="admin-card space-y-5">
            <h2 className="text-lg font-semibold text-white">Phân loại sản phẩm</h2>
            <p className="text-sm text-keyshop-muted">
              Chọn một trong ba loại chính. Hình thức giao hàng được gán tự động theo loại.
            </p>
            {isLegacyManualService ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                Sản phẩm này thuộc loại cũ &quot;Dịch vụ thủ công&quot;. Bạn có thể chuyển sang
                một trong ba loại bên dưới khi cập nhật.
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              {PRODUCT_CATALOG_OPTIONS.map((option) => {
                const active = form.catalogKind === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("catalogKind", option.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-keyshop-blue bg-keyshop-blue/10 ring-1 ring-keyshop-blue/40"
                        : "border-keyshop-line bg-white/[0.02] hover:border-keyshop-blue/40"
                    }`}
                  >
                    <p className="font-medium text-white">{option.label}</p>
                    <p className="mt-1 text-xs text-keyshop-muted">{option.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {form.catalogKind === "digital_key" ? (
                <div className="space-y-2">
                  <Label htmlFor="keyVariant">Dạng key</Label>
                  <select
                    id="keyVariant"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.keyVariant}
                    onChange={(event) =>
                      updateField(
                        "keyVariant",
                        event.target.value as "license_key" | "redeem_code",
                      )
                    }
                  >
                    {DIGITAL_KEY_VARIANTS.map((variant) => (
                      <option key={variant.value} value={variant.value}>
                        {variant.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Hình thức giao hàng (tự động)</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-background/60 px-3 text-sm text-keyshop-muted">
                  {selectedCatalog
                    ? tDeliveryType(selectedCatalog.deliveryType)
                    : tDeliveryType(form.deliveryType)}
                </div>
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
              {form.catalogKind === "account_pro" ? (
                <p className="text-xs text-keyshop-muted sm:col-span-2">
                  Tồn kho tài khoản Pro sẽ được quản lý riêng (đang phát triển). Hiện tại nhập số
                  lượng tồn kho thủ công.
                </p>
              ) : null}
              {deliveryMismatch ? (
                <p className="text-sm text-amber-300 sm:col-span-2">{deliveryMismatch}</p>
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
              {saving ? "Đang lưu..." : isEdit ? (needsApproval ? "Gửi duyệt" : "Cập nhật") : "Lưu sản phẩm"}
            </Button>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="text-lg font-semibold text-white">Danh mục</h2>
            <p className="text-sm text-keyshop-muted">
              Chỉ hiển thị danh mục thuộc loại{" "}
              <strong className="text-white">{selectedCatalog?.label}</strong>.
            </p>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
              disabled={categoriesLoading}
              required
            >
              <option value="">— Chọn danh mục —</option>
              {categoryGroups.map(({ root, children }) => (
                <optgroup key={root.categoryId} label={root.name}>
                  {children.length === 0 ? (
                    <option value={String(root.categoryId)}>{root.name}</option>
                  ) : (
                    children.map((category) => (
                      <option key={category.categoryId} value={String(category.categoryId)}>
                        {category.name}
                      </option>
                    ))
                  )}
                </optgroup>
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

      {isEdit && productId ? <ProductReviewsPanel productId={productId} /> : null}
    </form>
  );
}
