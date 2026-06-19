"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import PaginationBar from "@/components/admin/pagination-bar";
import PriceDisplay from "@/components/admin/price-display";
import StatCard from "@/components/admin/stat-card";
import StatusBadge, { orderStatusTone } from "@/components/admin/status-badge";
import StockBar from "@/components/admin/stock-bar";
import { Button } from "@/components/ui/button";
import { tActive, tOrderStatus, tPaymentMethod } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchDashboardData } from "@/lib/services/admin-service";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatTodayVi,
} from "@/lib/utils/format";

export default function DashboardView() {
  const { data: session } = useSession();
  const { data, loading, error, refetch } = useAdminFetch(fetchDashboardData);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [productPage, setProductPage] = useState(0);
  const pageSize = 5;

  const stats = data?.stats;
  const allProducts = data?.products ?? [];
  const recentOrders = data?.orders ?? [];
  const coupons = data?.coupons ?? [];
  const chartData = data?.chartData ?? [];
  const products = allProducts.slice(
    productPage * pageSize,
    productPage * pageSize + pageSize,
  );

  const adminName = session?.user?.name || "Quản trị viên";
  const todayLabel = formatTodayVi();

  const insights = useMemo(() => {
    if (!stats) return [];

    const pendingOrders = recentOrders.filter(
      (order) => order.status === "PendingPayment",
    ).length;
    const outOfStock = allProducts.filter((product) => product.stock === 0).length;
    const activeCoupons = coupons.filter((coupon) => coupon.isActive).length;
    const processingOrders = recentOrders.filter(
      (order) => order.status === "Processing",
    ).length;

    return [
      {
        label: "Đơn chờ thanh toán",
        value: `${pendingOrders} đơn`,
        hint: "Cần xác nhận hoặc nhắc khách",
        href: "/orders",
        tone: "warning" as const,
      },
      {
        label: "Đơn đang xử lý",
        value: `${processingOrders} đơn`,
        hint: "Ưu tiên giao key trong ngày",
        href: "/orders",
        tone: "info" as const,
      },
      {
        label: "Sản phẩm hết hàng",
        value: `${outOfStock} mục`,
        hint: "Bổ sung kho hoặc ngừng bán",
        href: "/products",
        tone: "danger" as const,
      },
      {
        label: "Mã giảm giá hoạt động",
        value: `${activeCoupons} mã`,
        hint: `${stats.coupons} mã trong hệ thống`,
        href: "/coupons",
        tone: "success" as const,
      },
    ];
  }, [stats, recentOrders, allProducts, coupons]);

  const quickLinks = [
    { href: "/orders", label: "Xử lý đơn hàng" },
    { href: "/products/new", label: "Đăng sản phẩm mới" },
    { href: "/banners", label: "Cập nhật banner" },
    { href: "/coupons", label: "Tạo mã khuyến mãi" },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <AdminLoading label="Đang tải bảng tổng quan..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <AdminError message={error || "Không có dữ liệu thống kê"} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="admin-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-keyshop-blue/10" />
        <div className="pointer-events-none absolute -bottom-8 right-20 h-28 w-28 rounded-full bg-keyshop-green/10" />
        <div className="relative space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="rounded-full bg-keyshop-blue/15 px-3 py-1 text-xs font-medium text-keyshop-blue">
                Bảng tổng quan
              </span>
              <p className="mt-4 text-sm text-keyshop-muted">{todayLabel}</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Xin chào, {adminName}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-keyshop-muted sm:text-base">
                Cửa hàng đang có{" "}
                <span className="text-white">{formatNumber(stats.products)}</span>{" "}
                sản phẩm,{" "}
                <span className="text-white">{formatNumber(stats.orders)}</span>{" "}
                đơn hàng và{" "}
                <span className="text-white">{formatNumber(stats.users)}</span>{" "}
                khách hàng. Dưới đây là tình hình kinh doanh hôm nay.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-keyshop-line bg-white/[0.03] px-3 py-1.5 text-xs text-keyshop-muted transition-colors hover:border-keyshop-blue/40 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <Button asChild className="w-full shrink-0 sm:w-auto">
              <Link href="/products/new">+ Thêm sản phẩm</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Doanh thu"
              value={formatCompactCurrency(stats.revenue)}
              valueTitle={formatCurrency(stats.revenue)}
              hint="Tổng doanh thu từ đơn hàng (VND)"
              change="+28.4%"
              changeType="up"
              icon={DollarSign}
            />
            <StatCard
              title="Đơn hàng"
              value={formatNumber(stats.orders)}
              hint="So với tháng trước"
              change="+14.2%"
              changeType="up"
              icon={ShoppingBag}
              iconClassName="bg-keyshop-green/15 text-keyshop-green"
            />
            <StatCard
              title="Người dùng"
              value={formatNumber(stats.users)}
              hint="Khách đã đăng ký"
              change="-2.1%"
              changeType="down"
              icon={Users}
            />
            <StatCard
              title="Sản phẩm"
              value={formatNumber(stats.products)}
              hint={`${stats.categories} danh mục đang mở`}
              change="+6.8%"
              changeType="up"
              icon={Package}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="admin-card group flex items-start gap-4 transition-colors hover:border-keyshop-blue/30"
          >
            <div
              className={
                item.tone === "warning"
                  ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400"
                  : item.tone === "danger"
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400"
                    : item.tone === "success"
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-keyshop-green/15 text-keyshop-green"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-keyshop-blue/15 text-keyshop-blue"
              }
            >
              {item.tone === "success" ? (
                <Tag className="h-5 w-5" />
              ) : item.tone === "danger" ? (
                <Package className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-keyshop-muted">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-white group-hover:text-keyshop-blue">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-keyshop-muted">{item.hint}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="admin-card overflow-hidden p-0">
        <div className="border-b border-keyshop-line p-6">
          <AdminPageHeader
            title="Sản phẩm gần đây"
            description="5 sản phẩm cập nhật gần nhất — kiểm tra tồn kho và trạng thái bán"
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href="/products">Xem tất cả</Link>
              </Button>
            }
          />
        </div>
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>SKU</th>
                <th className="admin-col-price">Giá</th>
                <th>Tồn kho</th>
                <th>Đánh giá</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-keyshop-muted">
                          ID #{product.productId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{product.categoryName}</td>
                  <td>
                    <code className="rounded bg-white/5 px-2 py-0.5 text-xs">
                      {product.sku}
                    </code>
                  </td>
                  <td className="admin-col-price">
                    <PriceDisplay
                      amount={product.discountPrice ?? product.price}
                      originalAmount={
                        product.discountPrice ? product.price : null
                      }
                      currency={product.currency}
                    />
                  </td>
                  <td>
                    <div className="w-28">
                      <StockBar value={product.stock} max={250} />
                      <p className="mt-1 text-xs text-keyshop-muted">
                        {product.stock === 0
                          ? "Hết hàng"
                          : `${product.stock} key`}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {product.rating}
                    </span>
                  </td>
                  <td>
                    <StatusBadge
                      label={tActive(product.isActive)}
                      tone={product.isActive ? "success" : "neutral"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={productPage}
          totalPages={Math.max(1, Math.ceil(allProducts.length / pageSize))}
          totalItems={allProducts.length}
          pageSize={pageSize}
          onPageChange={setProductPage}
        />
      </section>

      <section className="admin-card overflow-hidden p-0">
        <div className="border-b border-keyshop-line p-6">
          <AdminPageHeader
            title="Đơn hàng gần đây"
            description="3 đơn mới nhất — bấm mũi tên để xem chi tiết sản phẩm trong đơn"
          />
        </div>
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th />
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Phương thức</th>
                <th className="admin-col-price">Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const expanded = openOrder === order.orderId;
                return (
                  <Fragment key={order.orderId}>
                    <tr>
                      <td>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-keyshop-muted hover:bg-white/5 hover:text-white"
                          onClick={() =>
                            setOpenOrder(expanded ? null : order.orderId)
                          }
                        >
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td>
                        <code className="text-xs text-keyshop-blue">
                          {order.orderId}
                        </code>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-white">{order.name}</p>
                          <p className="text-xs text-keyshop-muted">
                            {order.email}
                          </p>
                        </div>
                      </td>
                      <td>{tPaymentMethod(order.paymentMethod)}</td>
                      <td className="admin-col-price font-medium text-white">
                        {formatCurrency(order.total, order.currency)}
                      </td>
                      <td>
                        <StatusBadge
                          label={tOrderStatus(order.status)}
                          tone={orderStatusTone(order.status)}
                        />
                      </td>
                      <td className="text-sm text-keyshop-muted">
                        {formatDateTime(order.createdAt)}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={7} className="p-0">
                          <div className="border-t border-keyshop-line px-6 py-4">
                            <div className="grid gap-3">
                              {order.items.map((item) => (
                                <div
                                  key={`${order.orderId}-${item.productId}`}
                                  className="flex items-center justify-between gap-4 rounded-xl border border-keyshop-line bg-keyshop-bg/50 px-4 py-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <Image
                                      src={item.thumbnail}
                                      alt={item.name}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-lg object-cover"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-keyshop-muted">
                                        SL {item.quantity} ×{" "}
                                        {formatCurrency(
                                          item.unitPrice,
                                          item.currency,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="admin-price-cell text-sm font-medium text-white">
                                    {formatCurrency(
                                      item.lineTotal,
                                      item.currency,
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <AdminPageHeader
          title="Phân tích kinh doanh"
          description="Doanh thu (VND) và số đơn theo tháng — tính từ đơn hàng thật"
        />
        <div className="mt-6 h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  const numeric = Number(value ?? 0);
                  const label = String(name ?? "");
                  if (label === "Doanh thu") {
                    return [formatCurrency(numeric), label];
                  }
                  return [`${formatNumber(numeric)} đơn`, label];
                }}
                labelFormatter={(label) => `Tháng ${String(label).replace("T", "")}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="Đơn hàng"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
