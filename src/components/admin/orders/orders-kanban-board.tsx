"use client";

import toast from "react-hot-toast";

import StatusBadge, { orderStatusTone, paymentStatusTone } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tOrderStatus, tPaymentStatus } from "@/constants/vi";
import { updateOrderStatus } from "@/lib/services/admin-service";
import type { AdminOrder, OrderStatus } from "@/types/admin";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

const KANBAN_COLUMNS: Array<{
  key: OrderStatus | "issues";
  title: string;
  statuses: OrderStatus[];
}> = [
  {
    key: "PendingPayment",
    title: "Chờ thanh toán",
    statuses: ["PendingPayment"],
  },
  {
    key: "Processing",
    title: "Đang xử lý",
    statuses: ["Processing"],
  },
  {
    key: "Shipped",
    title: "Đã gửi",
    statuses: ["Shipped"],
  },
  {
    key: "Delivered",
    title: "Hoàn tất",
    statuses: ["Delivered"],
  },
  {
    key: "issues",
    title: "Hủy / lỗi / hoàn",
    statuses: ["Cancelled", "Failed", "Refunded"],
  },
];

type OrdersKanbanBoardProps = {
  orders: AdminOrder[];
  savingOrderId: string | null;
  onSavingChange: (orderId: string | null) => void;
  onUpdated: () => void;
};

export default function OrdersKanbanBoard({
  orders,
  savingOrderId,
  onSavingChange,
  onUpdated,
}: OrdersKanbanBoardProps) {
  async function handleStatusChange(orderId: string, status: string) {
    onSavingChange(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success("Đã cập nhật trạng thái đơn hàng");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      onSavingChange(null);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {KANBAN_COLUMNS.map((column) => {
        const columnOrders = orders.filter((order) => column.statuses.includes(order.status));

        return (
          <section
            key={column.key}
            className="flex min-h-[420px] flex-col rounded-2xl border border-keyshop-line bg-keyshop-soft/30"
          >
            <div className="border-b border-keyshop-line px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-keyshop-muted">
                  {columnOrders.length}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {columnOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-keyshop-muted">Không có đơn</p>
              ) : (
                columnOrders.map((order) => (
                  <article
                    key={order.orderId}
                    className="rounded-xl border border-keyshop-line bg-keyshop-bg/70 p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{order.orderId}</p>
                        <p className="mt-1 text-xs text-keyshop-muted">{order.name}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(order.total, order.currency)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <StatusBadge
                        label={tOrderStatus(order.status)}
                        tone={orderStatusTone(order.status)}
                      />
                      <StatusBadge
                        label={tPaymentStatus(order.paymentStatus)}
                        tone={paymentStatusTone(order.paymentStatus)}
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-keyshop-muted">
                      {formatDateTime(order.createdAt)}
                    </p>

                    {column.key !== "issues" ? (
                      <div className="mt-3 space-y-2">
                        <select
                          className="admin-filter-select w-full text-xs"
                          value={order.status}
                          disabled={savingOrderId === order.orderId}
                          onChange={(event) =>
                            handleStatusChange(order.orderId, event.target.value)
                          }
                        >
                          {column.statuses.map((status) => (
                            <option key={status} value={status}>
                              {tOrderStatus(status)}
                            </option>
                          ))}
                          {column.key === "PendingPayment" ? (
                            <>
                              <option value="Processing">Chuyển xử lý</option>
                              <option value="Cancelled">Hủy</option>
                            </>
                          ) : null}
                          {column.key === "Processing" ? (
                            <>
                              <option value="Shipped">Đã gửi</option>
                              <option value="Delivered">Hoàn tất</option>
                              <option value="Cancelled">Hủy</option>
                            </>
                          ) : null}
                          {column.key === "Shipped" ? (
                            <option value="Delivered">Hoàn tất</option>
                          ) : null}
                        </select>
                      </div>
                    ) : (
                      <p className="mt-2 text-[11px] italic text-keyshop-muted">
                        Không thể chuyển trạng thái từ cột này
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
