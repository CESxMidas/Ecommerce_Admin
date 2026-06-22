import type { DeliveryType, ProductType } from "@/types/admin";

export type ProductCatalogKind = "hardware" | "digital_key" | "account_pro";

export const PRODUCT_CATALOG_OPTIONS: {
  value: ProductCatalogKind;
  label: string;
  description: string;
  productType: ProductType;
  deliveryType: DeliveryType;
}[] = [
  {
    value: "hardware",
    label: "Phần cứng & Thiết bị",
    description: "Linh kiện, thiết bị — giao hàng vật lý, hỗ trợ COD",
    productType: "hardware",
    deliveryType: "physical",
  },
  {
    value: "digital_key",
    label: "Key / Mã bản quyền",
    description: "Key phần mềm — giao tức thì từ kho sau thanh toán",
    productType: "license_key",
    deliveryType: "instant_key",
  },
  {
    value: "account_pro",
    label: "Tài khoản Premium / Pro",
    description: "Canva, ChatGPT, Netflix… — giao thông tin đăng nhập",
    productType: "account",
    deliveryType: "account_credentials",
  },
];

export const DIGITAL_KEY_VARIANTS: { value: "license_key" | "redeem_code"; label: string }[] =
  [
    { value: "license_key", label: "Key bản quyền" },
    { value: "redeem_code", label: "Mã nạp / Thẻ nạp" },
  ];

/** Parent category IDs for catalog grouping in admin forms */
export const CATALOG_ROOT_CATEGORY_IDS: Record<ProductCatalogKind, number> = {
  digital_key: 100,
  account_pro: 100,
  hardware: 200,
};

/** Leaf categories allowed per catalog kind (under shared software parent) */
export const CATALOG_LEAF_CATEGORY_IDS: Record<ProductCatalogKind, number[]> = {
  digital_key: [101, 103],
  account_pro: [102],
  hardware: [201, 202, 203],
};

export const PREFERRED_LEAF_CATEGORY_IDS: Record<
  ProductCatalogKind,
  Partial<Record<"license_key" | "redeem_code" | "default", number>>
> = {
  digital_key: { license_key: 101, redeem_code: 103, default: 101 },
  account_pro: { default: 102 },
  hardware: { default: 201 },
};

export function getCatalogKindFromProduct(product: {
  productType: ProductType;
}): ProductCatalogKind | "manual_service" {
  if (product.productType === "hardware") {
    return "hardware";
  }

  if (product.productType === "account") {
    return "account_pro";
  }

  if (product.productType === "license_key" || product.productType === "redeem_code") {
    return "digital_key";
  }

  return "manual_service";
}

export function getCatalogLabel(productType: ProductType): string {
  const kind = getCatalogKindFromProduct({ productType });

  if (kind === "manual_service") {
    return "Dịch vụ thủ công";
  }

  return (
    PRODUCT_CATALOG_OPTIONS.find((option) => option.value === kind)?.label ?? productType
  );
}

export function resolveProductTypesFromCatalog(
  catalogKind: ProductCatalogKind,
  keyVariant: "license_key" | "redeem_code" = "license_key",
): { productType: ProductType; deliveryType: DeliveryType } {
  if (catalogKind === "digital_key") {
    return { productType: keyVariant, deliveryType: "instant_key" };
  }

  const option = PRODUCT_CATALOG_OPTIONS.find((item) => item.value === catalogKind);

  if (!option) {
    return { productType: "license_key", deliveryType: "instant_key" };
  }

  return {
    productType: option.productType,
    deliveryType: option.deliveryType,
  };
}

export function getRootCategories(categories: { categoryId: number; parentId?: number | null; sortOrder?: number }[]) {
  return categories
    .filter((category) => category.parentId == null)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

export function getCategorySubtreeIds(
  categories: { categoryId: number; parentId?: number | null }[],
  rootCategoryId: number,
) {
  const ids = new Set<number>([rootCategoryId]);
  const queue = [rootCategoryId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    categories
      .filter((category) => category.parentId === current)
      .forEach((child) => {
        if (!ids.has(child.categoryId)) {
          ids.add(child.categoryId);
          queue.push(child.categoryId);
        }
      });
  }

  return ids;
}

export function getCatalogAllowedCategoryIds(
  categories: { categoryId: number; parentId?: number | null }[],
  catalogKind: ProductCatalogKind,
) {
  const allowed = new Set<number>([
    CATALOG_ROOT_CATEGORY_IDS[catalogKind],
    ...CATALOG_LEAF_CATEGORY_IDS[catalogKind],
  ]);

  CATALOG_LEAF_CATEGORY_IDS[catalogKind].forEach((leafId) => {
    const leaf = categories.find((category) => category.categoryId === leafId);
    if (leaf?.parentId != null) {
      allowed.add(leaf.parentId);
    }
  });

  return allowed;
}

export function getDefaultCategoryIdForCatalog(
  categories: { categoryId: number; parentId?: number | null; sortOrder?: number }[],
  catalogKind: ProductCatalogKind,
  keyVariant: "license_key" | "redeem_code" = "license_key",
) {
  const allowedIds = getCatalogAllowedCategoryIds(categories, catalogKind);
  const preferred =
    catalogKind === "digital_key"
      ? PREFERRED_LEAF_CATEGORY_IDS.digital_key[keyVariant]
      : PREFERRED_LEAF_CATEGORY_IDS[catalogKind].default;

  if (preferred != null && allowedIds.has(preferred)) {
    return preferred;
  }

  const leaf = CATALOG_LEAF_CATEGORY_IDS[catalogKind].find((id) => allowedIds.has(id));
  return leaf ?? null;
}

export function matchesCatalogFilter(
  productType: ProductType,
  filter: "all" | ProductCatalogKind,
): boolean {
  if (filter === "all") {
    return true;
  }

  return getCatalogKindFromProduct({ productType }) === filter;
}
