"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogOut, Menu, UserCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { performLogout } from "@/lib/auth/logout";
import AdminGlobalSearch from "@/components/layout/admin-global-search";
import AdminNotifications from "@/components/layout/admin-notifications";
import { tRole } from "@/constants/vi";

type AdminHeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
}: AdminHeaderProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-keyshop-line bg-keyshop-bg/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Mở hoặc đóng menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:block">
          <h1 className="text-sm font-semibold text-white">KEYSHOP Admin</h1>
          <p className="text-xs text-keyshop-muted">
            Bảng quản trị license số
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AdminGlobalSearch />

        <AdminNotifications />

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Menu tài khoản"
          >
            <UserCircle className="h-6 w-6" />
          </Button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Đóng menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-keyshop-line bg-keyshop-soft p-2 shadow-card">
                <div className="border-b border-keyshop-line px-3 py-2">
                  <p className="text-sm font-medium text-white">
                    {session?.user?.name || "Quản trị viên"}
                  </p>
                  <p className="text-xs text-keyshop-muted">
                    {session?.user?.email}
                  </p>
                  {session?.user?.role ? (
                    <p className="mt-1 text-[11px] font-medium text-keyshop-blue">
                      {tRole(session.user.role)}
                    </p>
                  ) : null}
                </div>
                <Link
                  href="/profile"
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-keyshop-muted transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  Hồ sơ của tôi
                </Link>
                <button
                  type="button"
                  className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-keyshop-muted transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => performLogout()}
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
