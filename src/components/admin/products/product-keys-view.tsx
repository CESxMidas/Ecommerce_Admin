"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Trash2, Upload } from "lucide-react";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import AdminPageHeader from "@/components/admin/admin-page-header";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { tDeliveryType, tProductType } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  fetchProduct,
  fetchProductKeys,
  fetchProductKeyStats,
  importProductKeys,
  revokeProductKey,
  type KeyPoolEntry,
} from "@/lib/services/admin-service";
import { parseKeyImportFileContent, parseKeyImportText } from "@/lib/utils/product-form";

type ProductKeysViewProps = {
  productId: string;
};

function isPoolProductType(productType: string, deliveryType: string) {
  return (
    ["license_key", "redeem_code"].includes(productType) &&
    deliveryType === "instant_key"
  );
}

export default function ProductKeysView({ productId }: ProductKeysViewProps) {
  const { data: product, loading: productLoading, error: productError, refetch: refetchProduct } =
    useAdminFetch(() => fetchProduct(productId), [productId]);
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } =
    useAdminFetch(() => fetchProductKeyStats(productId), [productId]);
  const { data: keysData, loading: keysLoading, error: keysError, refetch: refetchKeys } =
    useAdminFetch(() => fetchProductKeys(productId, { status: "available", page: 1, limit: 20 }), [productId]);

  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const loading = productLoading || statsLoading || keysLoading;
  const error = productError || statsError || keysError;
  const keys = keysData?.items ?? [];

  const poolEnabled = useMemo(() => {
    if (!product) return false;
    return isPoolProductType(product.productType, product.deliveryType);
  }, [product]);

  async function handleImport() {
    const lines = parseKeyImportText(importText);

    if (lines.length === 0) {
      toast.error("Nhập ít nhất một key");
      return;
    }

    await runImport(lines);
  }

  async function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const content = await file.text();
      const lines = parseKeyImportFileContent(content);

      if (lines.length === 0) {
        toast.error("File không chứa key hợp lệ");
        return;
      }

      await runImport(lines);
    } catch {
      toast.error("Không đọc được file");
    }
  }

  async function runImport(lines: string[]) {
    setImporting(true);
    try {
      const result = await importProductKeys(productId, { keys: lines });
      toast.success(`Đã import ${result.imported} key (${result.available} khả dụng)`);
      setImportText("");
      refetchStats();
      refetchKeys();
      refetchProduct();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import thất bại");
    } finally {
      setImporting(false);
    }
  }

  async function handleRevoke(key: KeyPoolEntry) {
    if (!confirm(`Thu hồi key ${key.key}?`)) return;

    try {
      await revokeProductKey(productId, key._id);
      toast.success("Đã thu hồi key");
      refetchStats();
      refetchKeys();
      refetchProduct();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thu hồi thất bại");
    }
  }

  if (loading) {
    return <AdminLoading label="Đang tải kho key..." />;
  }

  if (error || !product) {
    return (
      <AdminError
        message={error || "Không tìm thấy sản phẩm"}
        onRetry={() => {
          refetchProduct();
          refetchStats();
          refetchKeys();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Kho license key"
        breadcrumbs={[
          { label: "Sản phẩm" },
          { label: product.name },
          { label: "Key pool" },
        ]}
        description={`Quản lý key thật cho ${product.name}`}
        actions={
          <Button asChild variant="outline">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        }
      />

      <section className="admin-card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{product.name}</h2>
            <p className="mt-1 text-sm text-keyshop-muted">
              {tProductType(product.productType)} · {tDeliveryType(product.deliveryType)} · SKU{" "}
              {product.sku}
            </p>
          </div>
          <StatusBadge
            label={poolEnabled ? "Key pool" : "Không dùng pool"}
            tone={poolEnabled ? "success" : "neutral"}
          />
        </div>

        {!poolEnabled ? (
          <p className="text-sm text-amber-300">
            Sản phẩm này chưa bật key pool. Đặt loại{" "}
            <code>license_key</code> hoặc <code>redeem_code</code> và giao hàng{" "}
            <code>instant_key</code>.
          </p>
        ) : null}
      </section>

      {stats ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Khả dụng", stats.available],
            ["Đang giữ", stats.reserved],
            ["Đã bán", stats.sold],
            ["Thu hồi", stats.revoked],
            ["Tổng", stats.total],
          ].map(([label, value]) => (
            <div key={String(label)} className="admin-card">
              <p className="text-sm text-keyshop-muted">{label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="admin-card space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-keyshop-blue" />
          <h2 className="text-lg font-semibold text-white">Import key</h2>
        </div>
        <p className="text-sm text-keyshop-muted">
          Mỗi dòng một key (hoặc phân tách bằng dấu phẩy). Key trùng sẽ bị bỏ qua. Tồn kho
          sản phẩm tự sync theo số key khả dụng.
        </p>
        <div className="space-y-2">
          <Label htmlFor="importKeys">Danh sách key</Label>
          <textarea
            id="importKeys"
            rows={8}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={"WIN11-00001\nWIN11-00002\nSTEAM-ABCD-1234"}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            disabled={!poolEnabled}
          />
        </div>
        <Button type="button" onClick={handleImport} disabled={!poolEnabled || importing}>
          <KeyRound className="h-4 w-4" />
          {importing ? "Đang import..." : "Import vào kho"}
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <label>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              disabled={!poolEnabled || importing}
              onChange={handleCsvUpload}
            />
            <Button type="button" variant="outline" disabled={!poolEnabled || importing} asChild>
              <span>Import từ CSV/TXT</span>
            </Button>
          </label>
          <p className="text-xs text-keyshop-muted">
            CSV: một cột key hoặc cột đầu tiên chứa key
          </p>
        </div>
      </section>

      <section className="admin-card overflow-hidden p-0">
        <div className="border-b border-keyshop-line p-6">
          <h2 className="text-lg font-semibold text-white">Key khả dụng (20 mới nhất)</h2>
        </div>
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Trạng thái</th>
                <th>Ngày thêm</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {keys.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    <code className="text-xs text-keyshop-blue">{entry.key}</code>
                  </td>
                  <td>
                    <StatusBadge label={entry.status} tone="success" />
                  </td>
                  <td className="text-sm text-keyshop-muted">
                    {new Date(entry.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400"
                      onClick={() => handleRevoke(entry)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-keyshop-muted">
                    Chưa có key trong kho. Import key thật ở trên.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
