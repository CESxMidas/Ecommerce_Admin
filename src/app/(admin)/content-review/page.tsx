import type { Metadata } from "next";

import ContentReviewView from "@/components/admin/content-review/content-review-view";

export const metadata: Metadata = { title: "Hàng đợi duyệt" };

export default function ContentReviewPage() {
  return <ContentReviewView />;
}
