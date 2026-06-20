"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, LayoutGrid, List, ShoppingBag, Upload } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import OrdersKanbanBoard from "@/components/admin/orders/orders-kanban-board";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge, {
  orderStatusTone,
  paymentStatusTone,
} from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  tOrderStatus,
  tPaymentMethod,
  tPaymentStatus,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchOrders, updateOrderStatus } from "@/lib/services/admin-service";
import { exportOrdersToCsv, isOrderInDateRange } from "@/lib/utils/order-export";
import type { OrderStatus, PaymentStatus } from "@/types/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

const statusOptions: OrderStatus[] = [
  "PendingPayment",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Failed",
  "Refunded",
];

const paymentStatusOptions: PaymentStatus[] = [
  "paid",
  "pending",
  "awaiting_cod",
  "failed",
  "refunded",
];

export default function OrdersView() {
  const searchParams = useSearchParams();
  const { data, loading, error, refetch } = useAdminFetch(fetchOrders);
  const orders = data ?? [];

  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const initialSearch = searchParams.get("search");
    const initialStatus = searchParams.get("status");
    const initialView = searchParams.get("view");

    if (initialSearch) setSearch(initialSearch);
    if (initialStatus && statusOptions.includes(initialStatus as OrderStatus)) {
      setStatusFilter(initialStatus as OrderStatus);
    }
    if (initialView === "kanban") setViewMode("kanban");
  }, [searchParams]);

  const paymentMethods = useMemo(() => {
    const unique = new Set(orders.map((order) => order.paymentMethod).filter(Boolean));
    return Array.from(unique).sort();
  }, [orders]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderId.toLowerCase().includes(query) ||
        order.name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;
      const matchesPaymentMethod =
        paymentMethodFilter === "all" || order.paymentMethod === paymentMethodFilter;
      const matchesDate = isOrderInDateRange(order.createdAt, fromDate, toDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesPaymentMethod &&
        matchesDate
      );
    });
  }, [orders, search, statusFilter, paymentStatusFilter, paymentMethodFilter, fromDate, toDate]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== "all",
    paymentStatusFilter !== "all",
    paymentMethodFilter !== "all",
    fromDate.length > 0,
    toDate.length > 0,
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setPaymentMethodFilter("all");
    setFromDate("");
    setToDate("");
    setPage(0);
  }

  async function handleStatusSave(orderId: string, status: string) {
    setSavingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success("Đã cập nhật trạng thái đơn hàng");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setSavingOrderId(null);
    }
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("Không có đơn hàng để xuất");
      return;
    }
    exportOrdersToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} đơn hàng`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng và cập nhật trạng thái giao dịch"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-keyshop-line p-1">
              <Button
                type="button"
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
                Bảng
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewMode === "kanban" ? "default" : "ghost"}
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </Button>
            </div>
            <Button type="button" variant="outline" onClick={handleExport}>
              <Upload className="h-4 w-4" />
              Xuất file
            </Button>
          </div>
        }
      />

      <SearchToolbar
        placeholder="Tìm theo mã đơn, khách hàng, email, SĐT..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={orders.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        filters={
          <>
            <FilterSelect
              label="Trạng thái đơn"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as typeof statusFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                ...statusOptions.map((status) => ({
                  value: status,
                  label: tOrderStatus(status),
                })),
              ]}
            />
            <FilterSelect
              label="TT thanh toán"
              value={paymentStatusFilter}
              onChange={(value) => {
                setPaymentStatusFilter(value as typeof paymentStatusFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả TT thanh toán" },
                ...paymentStatusOptions.map((status) => ({
                  value: status,
                  label: tPaymentStatus(status),
                })),
              ]}
            />
            <FilterSelect
              label="Phương thức"
              value={paymentMethodFilter}
              disabled={paymentMethods.length === 0}
              onChange={(value) => {
                setPaymentMethodFilter(value);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Mọi phương thức" },
                ...paymentMethods.map((method) => ({
                  value: method,
                  label: tPaymentMethod(method),
                })),
              ]}
            />
            <div className="space-y-1.5">
              <Label htmlFor="orderFromDate" className="text-xs text-keyshop-muted">
                Từ ngày
              </Label>
              <Input
                id="orderFromDate"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(0);
                }}
                className="admin-filter-select h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="orderToDate" className="text-xs text-keyshop-muted">
                Đến ngày
              </Label>
              <Input
                id="orderToDate"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(0);
                }}
                className="admin-filter-select h-10"
              />
            </div>
          </>
        }
      />

      {loading ? (
        <AdminLoading label="Đang tải đơn hàng..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Chưa có đơn hàng"
          description="Đơn hàng từ cửa hàng sẽ hiển thị tại đây."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Không tìm thấy đơn hàng"
          description="Thử đổi từ khóa hoặc bộ lọc."
          actionLabel="Xóa bộ lọc"
          onAction={clearFilters}
        />
      ) : viewMode === "kanban" ? (
        <OrdersKanbanBoard
          orders={filtered}
          savingOrderId={savingOrderId}
          onSavingChange={setSavingOrderId}
          onUpdated={refetch}
        />
      ) : (
        <section className="admin-card overflow-hidden p-0">
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th />
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Thanh toán</th>
                  <th className="admin-col-price">Tổng tiền</th>
                  <th>Trạng thái đơn</th>
                  <th>Trạng thái thanh toán</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => {
                  const expanded = openOrder === order.orderId;
                  return (
                    <Fragment key={order.orderId}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 hover:bg-white/5"
                            onClick={() => setOpenOrder(expanded ? null : order.orderId)}
                          >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                        <td>
                          <code className="text-xs text-keyshop-blue">{order.orderId}</code>
                          <p className="text-xs text-keyshop-muted">{order.paymentId}</p>
                        </td>
                        <td>
                          <p className="font-medium text-white">{order.name}</p>
                          <p className="text-xs text-keyshop-muted">{order.email}</p>
                        </td>
                        <td className="text-sm">{order.phone}</td>
                        <td>{tPaymentMethod(order.paymentMethod)}</td>
                        <td className="admin-col-price font-medium text-white">
                          {formatCurrency(order.total, order.currency)}
                        </td>
                        <td>
                          <StatusBadge label={tOrderStatus(order.status)} tone={orderStatusTone(order.status)} />
                        </td>
                        <td>
                          <StatusBadge
                            label={tPaymentStatus(order.paymentStatus)}
                            tone={paymentStatusTone(order.paymentStatus)}
                          />
                        </td>
                        <td className="text-sm text-keyshop-muted">{formatDateTime(order.createdAt)}</td>
                      </tr>
                      {expanded && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={9} className="p-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="rounded-xl border border-keyshop-line p-4">
                                <p className="text-xs font-medium uppercase text-keyshop-muted">Sản phẩm trong đơn</p>
                                <div className="mt-3 space-y-2">
                                  {order.items.map((item) => (
                                    <div key={`${order.orderId}-${item.productId}`} className="flex justify-between gap-3 text-sm">
                                      <span className="text-white">
                                        {item.name} × {item.quantity}
                                      </span>
                                      <span className="text-keyshop-muted">
                                        {formatCurrency(item.lineTotal, item.currency)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <p className="mt-3 text-xs text-keyshop-muted">
                                  Địa chỉ: {order.address || "—"}
                                </p>
                                {order.couponCode ? (
                                  <p className="mt-1 text-xs text-keyshop-muted">
                                    Mã giảm giá: <code>{order.couponCode}</code>
                                  </p>
                                ) : null}
                              </div>
                              <div className="rounded-xl border border-keyshop-line p-4">
                                <p className="mb-3 text-xs font-medium uppercase text-keyshop-muted">
                                  Cập nhật trạng thái
                                </p>
                                <select
                                  id={`status-${order.orderId}`}
                                  className="admin-filter-select"
                                  defaultValue={order.status}
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {tOrderStatus(status)}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="mt-3"
                                  disabled={savingOrderId === order.orderId}
                                  onClick={() => {
                                    const select = document.getElementById(
                                      `status-${order.orderId}`,
                                    ) as HTMLSelectElement | null;
                                    if (select) {
                                      void handleStatusSave(order.orderId, select.value);
                                    }
                                  }}
                                >
                                  {savingOrderId === order.orderId ? "Đang lưu..." : "Lưu trạng thái"}
                                </Button>
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
          <PaginationBar
            page={page}
            totalPages={Math.max(1, Math.ceil(filtered.length / pageSize))}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </section>
      )}
    </div>
  );
}
