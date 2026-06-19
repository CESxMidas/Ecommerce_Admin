"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit2, ImageIcon, Plus, Trash2 } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import SearchToolbar from "@/components/admin/search-toolbar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { tActive, tPlacement } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { fetchBanners } from "@/lib/services/admin-service";

export default function BannersView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchBanners);
  const banners = data ?? [];
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState("all");

  const filtered = banners.filter((banner) => {
    const matchesSearch = banner.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesPlacement =
      placement === "all" || banner.placement === placement;
    return matchesSearch && matchesPlacement;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Banner / Slider"
        description="Quản lý banner trang chủ và vị trí quảng cáo"
        actions={
          <Button type="button">
            <Plus className="h-4 w-4" />
            Thêm banner
          </Button>
        }
      />

      <SearchToolbar
        placeholder="Tìm banner..."
        value={search}
        onChange={setSearch}
      >
        <select
          value={placement}
          onChange={(event) => setPlacement(event.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Tất cả vị trí</option>
          <option value="home_slider">{tPlacement("home_slider")}</option>
          <option value="ads">{tPlacement("ads")}</option>
        </select>
      </SearchToolbar>

      {loading ? (
        <AdminLoading label="Đang tải banner..." />
      ) : error ? (
        <AdminError message={error} onRetry={refetch} />
      ) : (
      <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((banner) => (
          <article key={banner.id} className="admin-card overflow-hidden p-0">
            <div className="relative aspect-[2/1] w-full">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute left-3 top-3 flex gap-2">
                <StatusBadge
                  label={tPlacement(banner.placement)}
                  tone="info"
                />
                <StatusBadge
                  label={tActive(banner.isActive)}
                  tone={banner.isActive ? "success" : "neutral"}
                />
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h3 className="font-semibold text-white">{banner.title}</h3>
                <p className="text-sm text-keyshop-muted">{banner.subtitle}</p>
              </div>
              <p className="truncate text-xs text-keyshop-muted">
                Liên kết: {banner.link || "—"}
              </p>
              <p className="text-xs text-keyshop-muted">
                Thứ tự: {banner.sortOrder}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1">
                  <Edit2 className="h-4 w-4" />
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="admin-card flex flex-col items-center py-16 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-keyshop-muted" />
          <p className="text-keyshop-muted">Không có banner phù hợp với bộ lọc</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}
