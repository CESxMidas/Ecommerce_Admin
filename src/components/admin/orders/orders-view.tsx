"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge, {
  orderStatusTone,
  paymentStatusTone,
} from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tOrderStatus, tPaymentMethod, tPaymentStatus } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchOrders, updateOrderStatus } from "@/lib/services/admin-service";
import type { OrderStatus } from "@/types/admin";
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

export default function OrdersView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchOrders);
  const orders = data ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const query = search.toLowerCase();
      const matchesSearch =
        order.orderId.toLowerCase().includes(query) ||
        order.name.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Đơn hàng"
        description="Quản lý đơn hàng và cập nhật trạng thái giao dịch"
      />

      <SearchToolbar
        placeholder="Tìm theo mã đơn, khách hàng..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
      >
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(0);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {tOrderStatus(status)}
            </option>
          ))}
        </select>
      </SearchToolbar>

      {loading ? (
        <AdminLoading label="Đang tải đơn hàng..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
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
                  <th />
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
                          <p className="text-xs text-keyshop-muted">
                            {order.paymentId}
                          </p>
                        </td>
                        <td>
                          <p className="font-medium text-white">{order.name}</p>
                          <p className="text-xs text-keyshop-muted">
                            {order.email}
                          </p>
                        </td>
                        <td className="text-sm">{order.phone}</td>
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
                        <td>
                          <StatusBadge
                            label={tPaymentStatus(order.paymentStatus)}
                            tone={paymentStatusTone(order.paymentStatus)}
                          />
                        </td>
                        <td className="text-sm text-keyshop-muted">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={10} className="p-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="rounded-xl border border-keyshop-line p-4">
                                <p className="text-xs font-medium uppercase text-keyshop-muted">
                                  Địa chỉ giao hàng
                                </p>
                                <p className="mt-2 text-sm text-white">
                                  {order.address || "—"}
                                </p>
                                {order.couponCode && (
                                  <p className="mt-2 text-xs text-keyshop-muted">
                                    Mã giảm giá:{" "}
                                    <code>{order.couponCode}</code>
                                  </p>
                                )}
                              </div>
                              <div className="rounded-xl border border-keyshop-line p-4">
                                <p className="mb-3 text-xs font-medium uppercase text-keyshop-muted">
                                  Cập nhật trạng thái
                                </p>
                                <select
                                  id={`status-${order.orderId}`}
                                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                                  {savingOrderId === order.orderId
                                    ? "Đang lưu..."
                                    : "Lưu trạng thái"}
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
