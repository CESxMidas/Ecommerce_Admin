import type { AdminCategory } from "@/types/admin";
import { slugify } from "@/lib/utils/product-form";

export function getCategoryParentName(
  categories: AdminCategory[],
  parentId: number | null | undefined,
) {
  if (parentId == null) return undefined;
  return categories.find((category) => category.categoryId === parentId)?.name;
}

export function getDescendantCategoryIds(
  categories: AdminCategory[],
  categoryId: number,
) {
  const descendants = new Set<number>();
  const queue = [categoryId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    categories
      .filter((category) => category.parentId === current)
      .forEach((child) => {
        descendants.add(child.categoryId);
        queue.push(child.categoryId);
      });
  }

  return descendants;
}

export function getParentCycleMessage(
  categories: AdminCategory[],
  categoryId: number | undefined,
  parentId: number | null,
): string | null {
  if (parentId == null) return null;

  if (categoryId != null && parentId === categoryId) {
    return "Danh mục không thể là cha của chính nó";
  }

  if (categoryId != null) {
    const descendants = getDescendantCategoryIds(categories, categoryId);
    if (descendants.has(parentId)) {
      return "Danh mục cha không hợp lệ (tạo vòng lặp phân cấp)";
    }
  }

  const parentExists = categories.some((category) => category.categoryId === parentId);
  if (!parentExists) {
    return "Danh mục cha không tồn tại";
  }

  return null;
}

export type CategoryFormValidationInput = {
  name: string;
  slug: string;
  sortOrder: number;
  parentId: number | null;
  existingCategories?: AdminCategory[];
  currentCategoryId?: number;
};

export function validateCategoryForm(input: CategoryFormValidationInput): string | null {
  const name = input.name.trim();
  const slug = (input.slug || slugify(name)).trim();

  if (!name) {
    return "Tên danh mục là bắt buộc";
  }

  if (!slug) {
    return "Đường dẫn (slug) là bắt buộc";
  }

  if (!Number.isFinite(input.sortOrder) || input.sortOrder < 0) {
    return "Thứ tự hiển thị phải là số không âm";
  }

  const duplicateSlug = input.existingCategories?.find(
    (category) =>
      category.slug === slug &&
      category.categoryId !== input.currentCategoryId,
  );

  if (duplicateSlug) {
    return `Slug "${slug}" đã được dùng bởi danh mục khác`;
  }

  const cycleMessage = getParentCycleMessage(
    input.existingCategories ?? [],
    input.currentCategoryId,
    input.parentId,
  );

  if (cycleMessage) {
    return cycleMessage;
  }

  return null;
}

export { slugify };
