"use client";

import { useState } from "react";
import { Mail, Shield, UserCircle, Users } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import EmptyState from "@/components/admin/empty-state";
import SearchToolbar from "@/components/admin/search-toolbar";

export default function UsersView() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Người dùng"
        description="Quản lý tài khoản khách hàng và quản trị viên"
      />

      <SearchToolbar
        placeholder="Tìm theo tên hoặc email..."
        value={search}
        onChange={setSearch}
      />

      <EmptyState
        icon={Users}
        title="API người dùng chưa sẵn sàng"
        description="Backend chưa có endpoint GET /admin/users. Trang này sẽ hiển thị danh sách người dùng thật khi API được bổ sung."
      />

      <section className="admin-card overflow-hidden p-0 opacity-40 pointer-events-none">
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Nguồn đăng nhập</th>
                <th>Xác minh</th>
                <th>Đơn hàng</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-keyshop-blue/15 text-keyshop-blue">
                      <UserCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">—</p>
                      <p className="text-xs text-keyshop-muted">—</p>
                    </div>
                  </div>
                </td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>
                  <div className="flex gap-1">
                    <Mail className="h-4 w-4 text-keyshop-muted" />
                    <Shield className="h-4 w-4 text-keyshop-muted" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
