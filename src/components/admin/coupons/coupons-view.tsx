"use client";

import { useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tCouponActive, tCouponType, tNoExpiry } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchCoupons } from "@/lib/services/admin-service";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function CouponsView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchCoupons);
  const coupons = data ?? [];
  const [search, setSearch] = useState("");

  const filtered = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Mã giảm giá"
        description="Tạo và quản lý mã khuyến mãi, giảm giá theo đơn hàng"
        actions={
          <Button type="button">
            <Plus className="h-4 w-4" />
            Thêm mã giảm giá
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Tìm mã giảm giá..."
        value={search}
        onChange={setSearch}
      />

      {loading ? (
        <AdminLoading label="Đang tải mã giảm giá..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : (
      <section className="admin-card overflow-hidden p-0">
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Loại</th>
                <th className="admin-col-price">Giá trị</th>
                <th className="admin-col-price">Đơn tối thiểu</th>
                <th>Lượt dùng</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <code className="rounded-lg bg-keyshop-blue/15 px-2.5 py-1 text-sm font-semibold text-keyshop-blue">
                      {coupon.code}
                    </code>
                  </td>
                  <td>{tCouponType(coupon.type)}</td>
                  <td className="admin-col-price font-medium text-white">
                    {coupon.type === "percent"
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)}
                  </td>
                  <td className="admin-col-price">
                    {formatCurrency(coupon.minOrder)}
                  </td>
                  <td>
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="text-sm text-keyshop-muted">
                    {coupon.expiresAt
                      ? formatDate(coupon.expiresAt)
                      : tNoExpiry()}
                  </td>
                  <td>
                    <StatusBadge
                      label={tCouponActive(coupon.isActive)}
                      tone={coupon.isActive ? "success" : "neutral"}
                    />
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}
    </div>
  );
}
