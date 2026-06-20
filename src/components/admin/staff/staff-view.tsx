"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit2, KeyRound, Plus, Shield, UserCog, Users } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import EmptyState from "@/components/admin/empty-state";
import FilterSelect from "@/components/admin/filter-select";
import PaginationBar from "@/components/admin/pagination-bar";
import SearchToolbar from "@/components/admin/search-toolbar";
import StaffFormDialog from "@/components/admin/staff/staff-form-dialog";
import StaffResetPasswordDialog from "@/components/admin/staff/staff-reset-password-dialog";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  staffRoleTone,
  tRole,
  tUserStatus,
  userStatusTone,
} from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { bulkSetStaffStatus, fetchStaff } from "@/lib/services/admin-service";
import { isOwnerRole } from "@/lib/auth/permissions";
import type { AdminStaff, AssignableStaffRole } from "@/types/admin";
import { formatDateTime } from "@/lib/utils/format";

type RoleFilter = "all" | AssignableStaffRole | "OWNER";
type StatusFilter = "all" | AdminStaff["status"];

export default function StaffView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchStaff);
  const staffMembers = data ?? [];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminStaff | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetStaff, setResetStaff] = useState<AdminStaff | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staffMembers.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "OWNER"
          ? isOwnerRole(member.role)
          : member.role === roleFilter);

      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffMembers, search, roleFilter, statusFilter]);

  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const pageStaffIds = pageItems
    .filter((member) => !isOwnerRole(member.role))
    .map((member) => member.id);
  const allPageSelected =
    pageStaffIds.length > 0 && pageStaffIds.every((id) => selectedIds.includes(id));

  const activeFilterCount = [
    search.trim().length > 0,
    roleFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const roleCounts = useMemo(() => {
    return staffMembers.reduce(
      (counts, member) => {
        if (isOwnerRole(member.role)) counts.owner += 1;
        else if (member.role === "MANAGER") counts.manager += 1;
        else counts.staff += 1;
        return counts;
      },
      { owner: 0, manager: 0, staff: 0 },
    );
  }, [staffMembers]);

  function clearFilters() {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(0);
  }

  function openCreateDialog() {
    setEditingStaff(null);
    setDialogOpen(true);
  }

  function openEditDialog(member: AdminStaff) {
    setEditingStaff(member);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingStaff(null);
  }

  function openResetDialog(member: AdminStaff) {
    setResetStaff(member);
    setResetDialogOpen(true);
  }

  function closeResetDialog() {
    setResetDialogOpen(false);
    setResetStaff(null);
  }

  function toggleSelectAllOnPage() {
    if (allPageSelected) {
      setSelectedIds((current) => current.filter((id) => !pageStaffIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...pageStaffIds])));
  }

  function toggleSelectStaff(staffId: string) {
    setSelectedIds((current) =>
      current.includes(staffId)
        ? current.filter((id) => id !== staffId)
        : [...current, staffId],
    );
  }

  async function handleBulkStatus(status: AdminStaff["status"]) {
    if (selectedIds.length === 0) return;

    const label = tUserStatus(status).toLowerCase();
    if (!confirm(`Đặt trạng thái "${label}" cho ${selectedIds.length} nhân viên đã chọn?`)) {
      return;
    }

    setBulkLoading(true);
    try {
      await bulkSetStaffStatus(selectedIds, status);
      toast.success(`Đã cập nhật ${selectedIds.length} nhân viên`);
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thao tác hàng loạt thất bại");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Nhân viên"
        description="Quản lý tài khoản Chủ shop, Quản lý và Nhân viên"
        actions={
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-keyshop-blue/15 text-keyshop-blue">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Chủ shop</p>
              <p className="text-xl font-semibold text-white">{roleCounts.owner}</p>
            </div>
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-keyshop-green/15 text-keyshop-green">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Quản lý</p>
              <p className="text-xl font-semibold text-white">{roleCounts.manager}</p>
            </div>
          </div>
        </div>
        <div className="admin-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-keyshop-muted">Nhân viên</p>
              <p className="text-xl font-semibold text-white">{roleCounts.staff}</p>
            </div>
          </div>
        </div>
      </div>

      <SearchToolbar
        placeholder="Tìm theo tên hoặc email..."
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        resultCount={filtered.length}
        totalCount={staffMembers.length}
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
                { value: "OWNER", label: "Chủ shop" },
                { value: "MANAGER", label: "Quản lý" },
                { value: "STAFF", label: "Nhân viên" },
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
          </>
        }
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 px-4 py-3">
          <p className="text-sm text-keyshop-muted">
            Đã chọn <strong className="text-white">{selectedIds.length}</strong> nhân viên
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkStatus("Inactive")}
          >
            Ngừng hoạt động
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => handleBulkStatus("Active")}
          >
            Kích hoạt lại
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            Bỏ chọn
          </Button>
        </div>
      ) : null}

      {loading ? (
        <AdminLoading label="Đang tải nhân viên..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : staffMembers.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Chưa có nhân viên"
          description="Tạo tài khoản Quản lý hoặc Nhân viên để phân công công việc."
          actionLabel="Thêm nhân viên"
          onAction={openCreateDialog}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Không tìm thấy nhân viên"
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
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Chọn tất cả trên trang"
                    />
                  </th>
                  <th>Nhân viên</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Đăng nhập gần nhất</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((member) => {
                  const ownerAccount = isOwnerRole(member.role);

                  return (
                    <tr key={member.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(member.id)}
                          disabled={ownerAccount}
                          onChange={() => toggleSelectStaff(member.id)}
                          aria-label={`Chọn ${member.name}`}
                        />
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-keyshop-muted">{member.email}</p>
                        </div>
                      </td>
                      <td>
                        <StatusBadge
                          label={tRole(member.role)}
                          tone={staffRoleTone(member.role)}
                        />
                      </td>
                      <td>
                        <StatusBadge
                          label={tUserStatus(member.status)}
                          tone={userStatusTone(member.status)}
                        />
                      </td>
                      <td className="text-sm text-keyshop-muted">
                        {member.lastLoginAt ? formatDateTime(member.lastLoginAt) : "—"}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(member)}
                            aria-label={`Sửa ${member.name}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {!ownerAccount ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openResetDialog(member)}
                              aria-label={`Đặt lại mật khẩu ${member.name}`}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      <StaffFormDialog
        open={dialogOpen}
        staff={editingStaff}
        onClose={closeDialog}
        onSaved={refetch}
      />

      <StaffResetPasswordDialog
        open={resetDialogOpen}
        staff={resetStaff}
        onClose={closeResetDialog}
        onSaved={refetch}
      />
    </div>
  );
}
