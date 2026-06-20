"use client";

import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  deleteProductReview,
  fetchProductReviews,
  hideProductReview,
} from "@/lib/services/admin-service";
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

  async function handleToggleHidden(reviewId: string, isHidden: boolean) {
    try {
      await hideProductReview(reviewId, isHidden);
      toast.success(isHidden ? "Đã ẩn đánh giá" : "Đã hiện đánh giá");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác thất bại");
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("Xóa vĩnh viễn đánh giá này?")) return;

    try {
      await deleteProductReview(reviewId);
      toast.success("Đã xóa đánh giá");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xóa thất bại");
    }
  }

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
            ? `${reviews.length} đánh giá — có thể ẩn hoặc xóa nội dung không phù hợp`
            : "Chưa có đánh giá nào cho sản phẩm này."}
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className={`rounded-xl border border-keyshop-line p-4 ${
                review.isHidden ? "bg-keyshop-bg/20 opacity-70" : "bg-keyshop-bg/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{review.userName}</p>
                  <p className="text-xs text-keyshop-muted">
                    {formatDateTime(review.createdAt)}
                    {review.verifiedPurchase ? " · Đã mua hàng" : ""}
                    {review.isHidden ? " · Đã ẩn" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-amber-300">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {review.rating}/5
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    aria-label={review.isHidden ? "Hiện đánh giá" : "Ẩn đánh giá"}
                    onClick={() => handleToggleHidden(review.id, !review.isHidden)}
                  >
                    {review.isHidden ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-400 hover:text-red-300"
                    aria-label="Xóa đánh giá"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
