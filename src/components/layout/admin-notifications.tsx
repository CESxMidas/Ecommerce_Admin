"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchAdminNotifications } from "@/lib/services/admin-service";
import type { AdminAlert } from "@/types/admin";

export default function AdminNotifications() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    fetchAdminNotifications()
      .then((data) => {
        if (!cancelled) {
          setAlerts(data.alerts);
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlerts([]);
          setUnreadCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Thông báo"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-keyshop-line bg-keyshop-soft shadow-2xl">
          <div className="border-b border-keyshop-line px-4 py-3">
            <p className="text-sm font-semibold text-white">Thông báo vận hành</p>
            <p className="text-xs text-keyshop-muted">
              {unreadCount > 0 ? `${unreadCount} việc cần chú ý` : "Không có cảnh báo mới"}
            </p>
          </div>
          {alerts.length === 0 ? (
            <p className="px-4 py-6 text-sm text-keyshop-muted">Mọi thứ đang ổn định.</p>
          ) : (
            <ul className="admin-scrollbar max-h-80 overflow-y-auto py-1">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    className="block px-4 py-3 transition-colors hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      {alert.count ? (
                        <span className="rounded-full bg-keyshop-blue/20 px-2 py-0.5 text-[11px] text-keyshop-blue">
                          {alert.count}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-keyshop-muted">{alert.message}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
