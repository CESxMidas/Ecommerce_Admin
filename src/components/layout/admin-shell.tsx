"use client";

import { useEffect, useState } from "react";

import AdminHeader from "@/components/layout/admin-header";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-keyshop-bg">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-300",
          sidebarOpen ? "md:ml-72" : "md:ml-20",
        )}
      >
        <AdminHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((value) => !value)}
        />
        <main className="admin-scrollbar min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
