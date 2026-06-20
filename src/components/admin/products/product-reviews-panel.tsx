"use client";

import { Star } from "lucide-react";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchProductReviews } from "@/lib/services/admin-service";
import { formatDateTime } from "@/lib/utils/format";

type ProductReviewsPanelProps = {
  productId: string;
};

export default function ProductReviewsPanel({ productId }: ProductReviewsPanelProps) {
  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchProductReviews(productId),
    [productId],
  );

  const reviews = data ?? [];

  if (loading) {
    return <AdminLoading label="Đang tải đánh giá..." />;
  }

  if (error) {
    return <AdminError message={error} onRetry={refetch} />;
  }

  return (
    <section className="admin-card space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Đánh giá khách hàng</h2>
        <p className="mt-1 text-sm text-keyshop-muted">
          {reviews.length > 0
            ? `${reviews.length} đánh giá từ khách đã mua`
            : "Chưa có đánh giá nào cho sản phẩm này."}
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-keyshop-line bg-keyshop-bg/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{review.userName}</p>
                  <p className="text-xs text-keyshop-muted">
                    {formatDateTime(review.createdAt)}
                    {review.verifiedPurchase ? " · Đã mua hàng" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-amber-300">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {review.rating}/5
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-keyshop-muted">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
