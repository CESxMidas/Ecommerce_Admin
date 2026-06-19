"use client";

import { ImagePlus, Save } from "lucide-react";

import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LogoSettingsView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Quản lý logo"
        description="Tùy chỉnh logo và nhận diện thương hiệu cửa hàng"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card space-y-5">
          <h2 className="text-lg font-semibold text-white">Logo cửa hàng</h2>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-keyshop-line bg-keyshop-bg/50 py-12">
            <ImagePlus className="mb-3 h-10 w-10 text-keyshop-muted" />
            <p className="text-sm text-keyshop-muted">
              Khuyến nghị: 200×60 PNG/SVG
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4">
              Tải lên logo
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoAlt">Văn bản thay thế</Label>
            <Input id="logoAlt" placeholder="KEYSHOP" defaultValue="KEYSHOP" />
          </div>
        </section>

        <section className="admin-card space-y-5">
          <h2 className="text-lg font-semibold text-white">Favicon</h2>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-keyshop-line bg-keyshop-bg/50 py-12">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-keyshop-blue/20 text-lg font-bold text-keyshop-blue">
              K
            </div>
            <p className="text-sm text-keyshop-muted">32×32 hoặc 64×64 ICO/PNG</p>
            <Button type="button" variant="outline" size="sm" className="mt-4">
              Tải lên favicon
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteName">Tên website</Label>
            <Input id="siteName" defaultValue="KEYSHOP" />
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Button type="button">
          <Save className="h-4 w-4" />
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
