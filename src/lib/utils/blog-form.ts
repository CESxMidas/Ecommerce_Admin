export const DEFAULT_BLOG_CATEGORIES = [
  "Chung",
  "Tin tức",
  "Hướng dẫn",
  "Khuyến mãi",
  "Công nghệ",
  "Game",
];

export type BlogFormValidationInput = {
  title: string;
  description: string;
  category: string;
  publishedAt: string;
};

export function validateBlogForm(input: BlogFormValidationInput): string | null {
  const title = input.title.trim();
  const description = input.description.trim();
  const category = input.category.trim();

  if (!title) {
    return "Tiêu đề bài viết là bắt buộc";
  }

  if (title.length > 180) {
    return "Tiêu đề tối đa 180 ký tự";
  }

  if (description.length > 2000) {
    return "Mô tả tối đa 2000 ký tự";
  }

  if (!category) {
    return "Vui lòng chọn hoặc nhập danh mục bài viết";
  }

  if (category.length > 80) {
    return "Danh mục tối đa 80 ký tự";
  }

  if (input.publishedAt) {
    const date = new Date(input.publishedAt);
    if (Number.isNaN(date.getTime())) {
      return "Ngày xuất bản không hợp lệ";
    }
  }

  return null;
}

export function toDateInputValue(value?: string) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}
