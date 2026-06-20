"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  ShoppingBag,
  UserCircle,
  Wallet,
} from "lucide-react";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import AdminPageHeader from "@/components/admin/admin-page-header";
import PriceDisplay from "@/components/admin/price-display";
import StatusBadge, {
  orderStatusTone,
  paymentStatusTone,
} from "@/components/admin/status-badge";
import UserEditDialog from "@/components/admin/users/user-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  tAuthProvider,
  tGender,
  tOrderStatus,
  tPaymentMethod,
  tPaymentStatus,
  tRole,
  tUserStatus,
  tVerified,
  userStatusTone,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchAdminUser } from "@/lib/services/admin-service";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format";

type UserDetailViewProps = {
  userId: string;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-keyshop-line/60 py-3 last:border-0">
      <span className="text-sm text-keyshop-muted">{label}</span>
      <span className="text-right text-sm text-white">{value}</span>
    </div>
  );
}

export default function UserDetailView({ userId }: UserDetailViewProps) {
  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchAdminUser(userId),
    [userId],
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  if (loading) {
    return <AdminLoading label="Đang tải hồ sơ người dùng..." />;
  }

  if (error || !data) {
    return (
      <AdminError
        message={error || "Không tìm thấy người dùng"}
        onRetry={refetch}
      />
    );
  }

  const { user, orders, orderStats } = data;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Chi tiết người dùng"
        breadcrumbs={[
          { label: "Người dùng" },
          { label: user.name || user.email },
        ]}
        description="Xem thông tin tài khoản và lịch sử mua hàng"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
              <Shield className="h-4 w-4" />
              Quản lý tài khoản
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          </div>
        }
      />

      <section className="admin-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={88}
              height={88}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-keyshop-blue/15 text-keyshop-blue">
              <UserCircle className="h-10 w-10" />
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="mt-1 text-sm text-keyshop-muted">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={tRole(user.role)}
                tone={user.role === "ADMIN" ? "info" : "neutral"}
              />
              <StatusBadge
                label={tUserStatus(user.status)}
                tone={userStatusTone(user.status)}
              />
              <StatusBadge
                label={tVerified(user.verifyEmail)}
                tone={user.verifyEmail ? "success" : "warning"}
              />
              <StatusBadge label={tAuthProvider(user.authProvider)} tone="neutral" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-keyshop-blue/10 p-2.5 text-keyshop-blue">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-white">{orderStats.total}</p>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-keyshop-green/10 p-2.5 text-keyshop-green">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Đơn đã thanh toán</p>
              <p className="text-2xl font-bold text-white">{orderStats.paid}</p>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(orderStats.totalSpent)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="admin-card space-y-1">
          <h3 className="mb-3 text-lg font-semibold text-white">Thông tin tài khoản</h3>
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Số điện thoại" value={user.mobile || "—"} />
          <InfoRow
            label="Xác minh SĐT"
            value={user.phoneVerified ? "Đã xác minh" : "Chưa xác minh"}
          />
          <InfoRow label="Giới tính" value={tGender(user.gender)} />
          <InfoRow
            label="Ngày sinh"
            value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "—"}
          />
          <InfoRow label="Ngày tham gia" value={formatDateTime(user.createdAt)} />
          <InfoRow
            label="Đăng nhập gần nhất"
            value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"}
          />
          <InfoRow
            label="Xác thực 2 lớp"
            value={user.twoFactorEnabled ? "Đã bật" : "Chưa bật"}
          />
        </section>

        <section className="admin-card overflow-hidden p-0">
          <div className="border-b border-keyshop-line p-6">
            <h3 className="text-lg font-semibold text-white">Đơn hàng gần đây</h3>
            <p className="mt-1 text-sm text-keyshop-muted">
              Hiển thị tối đa 20 đơn mới nhất của khách hàng
            </p>
          </div>
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th className="admin-col-price">Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td>
                      <code className="text-xs text-keyshop-blue">{order.orderId}</code>
                    </td>
                    <td className="text-sm">{formatDateTime(order.createdAt)}</td>
                    <td>
                      <div className="space-y-1 text-xs">
                        <p>{tPaymentMethod(order.paymentMethod)}</p>
                        <StatusBadge
                          label={tPaymentStatus(order.paymentStatus)}
                          tone={paymentStatusTone(order.paymentStatus)}
                        />
                      </div>
                    </td>
                    <td className="admin-col-price">
                      <PriceDisplay amount={order.total} currency={order.currency} />
                    </td>
                    <td>
                      <StatusBadge
                        label={tOrderStatus(order.status)}
                        tone={orderStatusTone(order.status)}
                      />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-keyshop-muted">
                      Người dùng này chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <UserEditDialog
        open={dialogOpen}
        user={user}
        onClose={() => setDialogOpen(false)}
        onSaved={refetch}
      />
    </div>
  );
}
