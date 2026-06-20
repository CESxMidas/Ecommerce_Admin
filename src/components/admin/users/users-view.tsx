"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, Eye, Shield, Upload, UserCircle, Users } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import UserEditDialog from "@/components/admin/users/user-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  tAuthProvider,
  tRole,
  tUserStatus,
  tVerified,
  userStatusTone,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { bulkSetUsersStatus, fetchAdminUsers } from "@/lib/services/admin-service";
import { exportUsersToCsv } from "@/lib/utils/user-export";
import type { AdminUser, UserRole } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | AdminUser["status"];
type VerifyFilter = "all" | "verified" | "unverified";
type ProviderFilter = "all" | AdminUser["authProvider"];

export default function UsersView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchAdminUsers);
  const users = data ?? [];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [verifyFilter, setVerifyFilter] = useState<VerifyFilter>("all");
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesVerify =
        verifyFilter === "all" ||
        (verifyFilter === "verified" ? user.verifyEmail : !user.verifyEmail);
      const matchesProvider =
        providerFilter === "all" || user.authProvider === providerFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesVerify &&
        matchesProvider
      );
    });
  }, [users, search, roleFilter, statusFilter, verifyFilter, providerFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageUserIds = pageItems.map((user) => user.id);
  const allPageSelected =
    pageUserIds.length > 0 && pageUserIds.every((id) => selectedIds.includes(id));

  const activeFilterCount = [
    search.trim().length > 0,
    roleFilter !== "all",
    statusFilter !== "all",
    verifyFilter !== "all",
    providerFilter !== "all",
  ].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerifyFilter("all");
    setProviderFilter("all");
    setPage(0);
  }

  function openEditDialog(user: AdminUser) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingUser(null);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) => current.filter((id) => !pageUserIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...pageUserIds])));
  }

  function toggleSelectUser(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  async function handleBulkStatus(status: AdminUser["status"]) {
    if (selectedIds.length === 0) return;

    const label = tUserStatus(status).toLowerCase();
    if (!confirm(`Đặt trạng thái "${label}" cho ${selectedIds.length} tài khoản đã chọn?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      await bulkSetUsersStatus(selectedIds, status);
      toast.success(`Đã cập nhật ${selectedIds.length} tài khoản`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác hàng loạt thất bại");
    } finally {
      setBulkLoading(false);
    }
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("Không có người dùng để xuất");
      return;
    }

    exportUsersToCsv(filtered);
    toast.success(`Đã xuất ${filtered.length} người dùng`);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Người dùng"
        description="Quản lý tài khoản khách hàng và quản trị viên"
        actions={
          <Button type="button" variant="outline" onClick={handleExport}>
            <Upload className="h-4 w-4" />
            Xuất file
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Tìm theo tên hoặc email..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={users.length}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        filters={
          <>
            <FilterSelect
              label="Vai trò"
              value={roleFilter}
              onChange={(value) => {
                setRoleFilter(value as RoleFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả vai trò" },
                { value: "USER", label: "Khách hàng" },
                { value: "ADMIN", label: "Quản trị viên" },
              ]}
            />
            <FilterSelect
              label="Trạng thái"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "Active", label: "Hoạt động" },
                { value: "Inactive", label: "Không hoạt động" },
                { value: "Suspended", label: "Đình chỉ" },
              ]}
            />
            <FilterSelect
              label="Xác minh email"
              value={verifyFilter}
              onChange={(value) => {
                setVerifyFilter(value as VerifyFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "verified", label: "Đã xác minh" },
                { value: "unverified", label: "Chưa xác minh" },
              ]}
            />
            <FilterSelect
              label="Nguồn đăng nhập"
              value={providerFilter}
              onChange={(value) => {
                setProviderFilter(value as ProviderFilter);
                setPage(0);
              }}
              options={[
                { value: "all", label: "Tất cả nguồn" },
                { value: "local", label: "Email" },
                { value: "google", label: "Google" },
              ]}
            />
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> tài khoản
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkStatus("Active")}
          >
            Kích hoạt
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkStatus("Suspended")}
          >
            Đình chỉ
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds([])}
          >
            Bỏ chọn
          </Button>
        </div>
      ) : null}

      {loading ? (
        <AdminLoading label="Đang tải người dùng..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có người dùng"
          description="Danh sách sẽ hiển thị khi có tài khoản đăng ký trên hệ thống."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy người dùng"
          description="Thử đổi từ khóa hoặc bộ lọc để xem kết quả khác."
          actionLabel="Xóa bộ lọc"
          onAction={clearFilters}
        />
      ) : (
        <section className="admin-card overflow-hidden p-0">
          <div className="admin-table-wrap overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      className="rounded border-keyshop-line"
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Chọn tất cả trên trang"
                    />
                  </th>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Nguồn đăng nhập</th>
                  <th>Xác minh</th>
                  <th>Đơn hàng</th>
                  <th>Ngày tham gia</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="rounded border-keyshop-line"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        aria-label={`Chọn ${user.name}`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-keyshop-blue/15 text-keyshop-blue">
                            <UserCircle className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/users/${user.id}`}
                            className="font-medium text-white transition-colors hover:text-keyshop-blue"
                          >
                            {user.name}
                          </Link>
                          <p className="text-xs text-keyshop-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge
                        label={tRole(user.role)}
                        tone={user.role === "ADMIN" ? "info" : "neutral"}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        label={tUserStatus(user.status)}
                        tone={userStatusTone(user.status)}
                      />
                    </td>
                    <td>{tAuthProvider(user.authProvider)}</td>
                    <td>
                      <StatusBadge
                        label={tVerified(user.verifyEmail)}
                        tone={user.verifyEmail ? "success" : "warning"}
                      />
                    </td>
                    <td>{user.orderCount}</td>
                    <td className="text-sm">{formatDateTime(user.createdAt)}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Xem chi tiết"
                          asChild
                        >
                          <Link href={`/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Quản lý người dùng"
                          onClick={() => openEditDialog(user)}
                        >
                          {user.role === "ADMIN" ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <Edit2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            page={page}
            totalPages={Math.ceil(filtered.length / pageSize)}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </section>
      )}

      <UserEditDialog
        open={dialogOpen}
        user={editingUser}
        onClose={closeDialog}
        onSaved={refetch}
      />
    </div>
  );
}
