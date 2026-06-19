import type { Metadata } from "next";

import BlogsView from "@/components/admin/blogs/blogs-view";

export const metadata: Metadata = { title: "Bài viết" };

export default function BlogsPage() {
  return <BlogsView />;
}
