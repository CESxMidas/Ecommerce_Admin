import type { AdminBanner, BannerPlacement } from "@/types/admin";

export function nextBannerSortOrder(
  banners: AdminBanner[],
  placement: BannerPlacement,
): number {
  const max = banners
    .filter((banner) => banner.placement === placement)
    .reduce((highest, banner) => Math.max(highest, banner.sortOrder ?? 0), -1);

  return max + 1;
}

export type BannerFormValidationInput = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  placement: BannerPlacement;
  sortOrder: number;
};

export function validateBannerForm(input: BannerFormValidationInput): string | null {
  const title = input.title.trim();

  if (!title) {
    return "Tiêu đề banner là bắt buộc";
  }

  if (title.length > 120) {
    return "Tiêu đề tối đa 120 ký tự";
  }

  if (!input.image.trim()) {
    return "Vui lòng tải ảnh banner";
  }

  if (input.subtitle.length > 200) {
    return "Phụ đề tối đa 200 ký tự";
  }

  if (input.link.trim() && !/^https?:\/\//i.test(input.link.trim()) && !input.link.trim().startsWith("/")) {
    return "Liên kết phải bắt đầu bằng http(s):// hoặc /";
  }

  if (!Number.isFinite(input.sortOrder) || input.sortOrder < 0) {
    return "Thứ tự hiển thị phải >= 0";
  }

  return null;
}
