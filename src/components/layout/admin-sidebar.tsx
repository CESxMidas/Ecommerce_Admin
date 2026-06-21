"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, KeyRound } from "lucide-react";

import { adminNavItems } from "@/constants/nav";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  open: boolean;
  onClose?: () => void;
};

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const role = session?.user?.role;

  const visibleNavItems = useMemo(
    () =>
      adminNavItems
        .map((item) => {
          if (item.permission && !hasPermission(role, item.permission)) {
            return null;
          }

          if (item.children) {
            const children = item.children.filter(
              (child) =>
                !child.permission || hasPermission(role, child.permission),
            );

            if (children.length === 0) {
              return null;
            }

            return { ...item, children };
          }

          return item;
        })
        .filter(Boolean) as typeof adminNavItems,
    [role],
  );

  const toggleMenu = (label: string) => {
    if (!open) return;
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isGroupActive = (children?: Array<{ href: string }>) =>
    children?.some((child) => isActive(child.href));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-keyshop-line bg-keyshop-soft transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-keyshop-line px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-keyshop-blue/20 text-keyshop-blue">
          <KeyRound className="h-5 w-5" />
        </div>
        {open && (
          <div>
            <p className="text-sm font-bold text-white">KEYSHOP</p>
            <p className="text-xs text-keyshop-muted">Bảng quản trị</p>
          </div>
        )}
      </div>

      <nav className="admin-scrollbar flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const expanded =
              openMenus[item.label] || isGroupActive(item.children);

            if (!hasChildren && item.href) {
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-keyshop-blue/15 text-white"
                        : "text-keyshop-muted hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {open && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                    expanded
                      ? "bg-white/5 text-white"
                      : "text-keyshop-muted hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    {open && item.label}
                  </span>
                  {open &&
                    (expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                </button>

                {open && expanded && item.children && (
                  <ul className="mt-1 space-y-1 pl-11">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive(child.href)
                              ? "text-keyshop-blue"
                              : "text-keyshop-muted hover:text-white",
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
