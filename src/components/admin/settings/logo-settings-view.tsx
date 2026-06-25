"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/utils/api-error";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  fetchSiteSettings,
  updateSiteSettings,
  uploadAdminImage,
} from "@/lib/services/admin-service";
import { formatDateTime } from "@/lib/utils/format";

export default function LogoSettingsView() {
  const { data, loading, error, refetch } = useAdminFetch(fetchSiteSettings);
  const [siteName, setSiteName] = useState("KEYSHOP");
  const [logoAlt, setLogoAlt] = useState("KEYSHOP");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data) return;
    setSiteName(data.siteName);
    setLogoAlt(data.logoAlt);
    setLogoUrl(data.logoUrl);
    setFaviconUrl(data.faviconUrl);
  }, [data]);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const setUploading = type === "logo" ? setUploadingLogo : setUploadingFavicon;
    setUploading(true);

    try {
      const result = await uploadAdminImage(file, "settings");
      if (type === "logo") {
        setLogoUrl(result.url);
      } else {
        setFaviconUrl(result.url);
      }
      toast.success(type === "logo" ? "Đã tải logo" : "Đã tải favicon");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Tải ảnh thất bại"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const trimmedSiteName = siteName.trim();
    if (!trimmedSiteName) {
      toast.error("Vui lòng nhập tên website");
      return;
    }

    setSaving(true);
    try {
      await updateSiteSettings({
        siteName: trimmedSiteName,
        logoAlt: logoAlt.trim(),
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim(),
      });
      toast.success("Đã lưu cài đặt");
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lưu thất bại"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoading label="Đang tải cài đặt..." />;
  }

  if (error) {
    return <AdminError message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Quản lý logo"
        description="Tùy chỉnh logo và nhận diện thương hiệu cửa hàng"
      />

      {data?.updatedAt ? (
        <p className="text-sm text-keyshop-muted">
          Cập nhật lần cuối: {formatDateTime(data.updatedAt)}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card space-y-5">
          <h2 className="text-lg font-semibold text-white">Logo cửa hàng</h2>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-keyshop-line bg-keyshop-bg/50 py-8">
            {logoUrl ? (
              <div className="relative mb-4 h-16 w-48">
                <Image
                  src={logoUrl}
                  alt={logoAlt || "Logo"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <ImagePlus className="mb-3 h-10 w-10 text-keyshop-muted" />
            )}
            <p className="text-sm text-keyshop-muted">Khuyến nghị: 200×60 PNG/SVG</p>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleUpload(event, "logo")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={uploadingLogo}
              onClick={() => logoInputRef.current?.click()}
            >
              {uploadingLogo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploadingLogo ? "Đang tải..." : "Tải lên logo"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoAlt">Văn bản thay thế</Label>
            <Input
              id="logoAlt"
              placeholder="KEYSHOP"
              value={logoAlt}
              onChange={(event) => setLogoAlt(event.target.value)}
            />
          </div>
        </section>

        <section className="admin-card space-y-5">
          <h2 className="text-lg font-semibold text-white">Favicon</h2>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-keyshop-line bg-keyshop-bg/50 py-8">
            {faviconUrl ? (
              <div className="relative mb-4 h-14 w-14">
                <Image
                  src={faviconUrl}
                  alt="Favicon"
                  fill
                  className="rounded-xl object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-keyshop-blue/20 text-lg font-bold text-keyshop-blue">
                K
              </div>
            )}
            <p className="text-sm text-keyshop-muted">32×32 hoặc 64×64 ICO/PNG</p>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleUpload(event, "favicon")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={uploadingFavicon}
              onClick={() => faviconInputRef.current?.click()}
            >
              {uploadingFavicon ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploadingFavicon ? "Đang tải..." : "Tải lên favicon"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteName">Tên website</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
            />
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </div>
  );
}
