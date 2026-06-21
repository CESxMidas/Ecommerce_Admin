"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  BarChart3,
  DollarSign,
  Download,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const ReportsRevenueChart = dynamic(
  () =>
    import("@/components/admin/reports/reports-charts").then(
      (mod) => mod.ReportsRevenueChart,
    ),
  {
    ssr: false,
    loading: () => <div className="mt-6 h-[360px] animate-pulse rounded-xl bg-white/5" />,
  },
);

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import StatCard from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchAnalyticsOverview } from "@/lib/services/admin-service";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils/format";
import { exportAnalyticsCsv } from "@/lib/utils/reports-export";

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function formatChartDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}`;
}

export default function ReportsView() {
  const defaults = defaultDateRange();
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [appliedRange, setAppliedRange] = useState(defaults);

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchAnalyticsOverview({
        from: appliedRange.from,
        to: appliedRange.to,
      }),
    [appliedRange.from, appliedRange.to],
  );

  const chartData = useMemo(() => {
    return (data?.revenueByDay ?? []).map((point) => ({
      name: formatChartDate(point.date),
      revenue: point.revenue,
      orders: point.orders,
    }));
  }, [data?.revenueByDay]);

  const summary = data?.summary;
  const changePercent = summary?.revenueChangePercent ?? 0;
  const changeType =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "neutral";
  const changeLabel =
    changePercent === 0
      ? "Không đổi"
      : `${changePercent > 0 ? "+" : ""}${changePercent}% so với kỳ trước`;

  function applyRange() {
    if (fromDate > toDate) return;
    setAppliedRange({ from: fromDate, to: toDate });
  }

  function handleExport() {
    if (!data) return;
    exportAnalyticsCsv(data, appliedRange);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Báo cáo kinh doanh"
        description="Doanh thu, đơn hàng và sản phẩm bán chạy — chỉ tính đơn đã thanh toán"
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={!data}
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Xuất CSV
          </Button>
        }
      />

      <section className="admin-card">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportFrom">Từ ngày</Label>
            <Input
              id="reportFrom"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportTo">Đến ngày</Label>
            <Input
              id="reportTo"
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
          <Button type="button" onClick={applyRange} disabled={fromDate > toDate}>
            Áp dụng
          </Button>
          {fromDate > toDate ? (
            <p className="text-sm text-red-400">Ngày bắt đầu phải trước ngày kết thúc</p>
          ) : null}
        </div>
      </section>

      {loading ? (
        <AdminLoading label="Đang tải báo cáo..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : !data ? (
        <EmptyState
          icon={BarChart3}
          title="Không có dữ liệu"
          description="Thử chọn khoảng thời gian khác."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Doanh thu"
              value={formatCompactCurrency(summary?.revenue ?? 0)}
              valueTitle={formatCurrency(summary?.revenue ?? 0)}
              change={changeLabel}
              changeType={changeType}
              icon={DollarSign}
              iconClassName="bg-keyshop-blue/15 text-keyshop-blue"
            />
            <StatCard
              title="Đơn đã thanh toán"
              value={formatNumber(summary?.paidOrders ?? 0)}
              hint={`/${formatNumber(summary?.totalOrders ?? 0)} tổng đơn`}
              icon={ShoppingBag}
              iconClassName="bg-keyshop-green/15 text-keyshop-green"
            />
            <StatCard
              title="Giá trị đơn TB (AOV)"
              value={formatCompactCurrency(summary?.aov ?? 0)}
              valueTitle={formatCurrency(summary?.aov ?? 0)}
              icon={TrendingUp}
              iconClassName="bg-amber-500/15 text-amber-300"
            />
            <StatCard
              title="Kỳ trước"
              value={formatCompactCurrency(summary?.previousRevenue ?? 0)}
              valueTitle={formatCurrency(summary?.previousRevenue ?? 0)}
              hint={`${formatNumber(summary?.previousPaidOrders ?? 0)} đơn đã thanh toán`}
              icon={TrendingDown}
              iconClassName="bg-white/10 text-keyshop-muted"
            />
          </div>

          <section className="admin-card">
            <AdminPageHeader
              title="Doanh thu theo ngày"
              description={`${formatDate(appliedRange.from)} — ${formatDate(appliedRange.to)}`}
            />
            {chartData.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Chưa có doanh thu"
                description="Không có đơn đã thanh toán trong khoảng thời gian này."
              />
            ) : (
              <ReportsRevenueChart data={chartData} />
            )}
          </section>

          <section className="admin-card overflow-hidden p-0">
            <div className="border-b border-keyshop-line px-6 py-5">
              <h2 className="text-lg font-semibold text-white">Top sản phẩm</h2>
              <p className="mt-1 text-sm text-keyshop-muted">
                Theo doanh thu từ đơn đã thanh toán
              </p>
            </div>
            {data.topProducts.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Package}
                  title="Chưa có sản phẩm"
                  description="Không có dữ liệu bán hàng trong khoảng thời gian này."
                />
              </div>
            ) : (
              <div className="admin-table-wrap overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product, index) => (
                      <tr key={String(product.productId)}>
                        <td className="text-keyshop-muted">{index + 1}</td>
                        <td className="font-medium text-white">{product.name}</td>
                        <td>{formatNumber(product.quantity)}</td>
                        <td className="admin-price-cell">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
