"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Trash2, Upload } from "lucide-react";

import AdminError from "@/components/admin/admin-error";
import AdminLoading from "@/components/admin/admin-loading";
import AdminPageHeader from "@/components/admin/admin-page-header";
import PaginationBar from "@/components/admin/pagination-bar";
import StatusBadge from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { tDeliveryType, tKeyStatus, tProductType } from "@/constants/vi";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import {
  fetchProduct,
  fetchProductKeys,
  fetchProductKeyStats,
  importProductKeys,
  revokeProductKey,
  type KeyPoolEntry,
} from "@/lib/services/admin-service";
import { isPoolProductType, parseKeyImportFileContent, parseKeyImportText } from "@/lib/utils/product-form";

type ProductKeysViewProps = {
  productId: string;
};

type KeyStatusFilter = "available" | "reserved" | "sold" | "revoked";

const keyStatusOptions: KeyStatusFilter[] = [
  "available",
  "reserved",
  "sold",
  "revoked",
];

function keyStatusTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  if (status === "sold") return "neutral";
  return "danger";
}

export default function ProductKeysView({ productId }: ProductKeysViewProps) {
  const [keyStatus, setKeyStatus] = useState<KeyStatusFilter>("available");
  const [keyPage, setKeyPage] = useState(0);
  const keyPageSize = 20;

  const {
    data: product,
    loading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useAdminFetch(() => fetchProduct(productId), [productId]);
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAdminFetch(() => fetchProductKeyStats(productId), [productId]);
  const {
    data: keysData,
    loading: keysLoading,
    error: keysError,
    refetch: refetchKeys,
  } = useAdminFetch(
    () =>
      fetchProductKeys(productId, {
        status: keyStatus,
        page: keyPage + 1,
        limit: keyPageSize,
      }),
    [productId, keyStatus, keyPage],
  );

  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const loading = productLoading || statsLoading || keysLoading;
  const error = productError || statsError || keysError;
  const keys = keysData?.items ?? [];
  const totalKeys = keysData?.total ?? 0;
  const totalPages = keysData?.totalPages ?? 1;

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
      setKeyStatus("available");
      setKeyPage(0);
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

  if (loading && !product) {
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
              {product.sku || "—"}
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
            <code>instant_key</code> trong form sửa sản phẩm.
          </p>
        ) : null}
      </section>

      {stats ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["available", stats.available],
            ["reserved", stats.reserved],
            ["sold", stats.sold],
            ["revoked", stats.revoked],
            ["total", stats.total],
          ].map(([status, value]) => (
            <button
              key={String(status)}
              type="button"
              onClick={() => {
                if (status === "total") return;
                setKeyStatus(status as KeyStatusFilter);
                setKeyPage(0);
              }}
              className={`admin-card text-left transition-colors ${
                status !== "total" && keyStatus === status
                  ? "ring-1 ring-keyshop-blue"
                  : "hover:bg-keyshop-soft/40"
              }`}
            >
              <p className="text-sm text-keyshop-muted">
                {status === "total" ? "Tổng" : tKeyStatus(String(status))}
              </p>
              <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            </button>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-keyshop-line p-6">
          <h2 className="text-lg font-semibold text-white">
            Danh sách key · {tKeyStatus(keyStatus)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {keyStatusOptions.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={keyStatus === status ? "default" : "outline"}
                onClick={() => {
                  setKeyStatus(status);
                  setKeyPage(0);
                }}
              >
                {tKeyStatus(status)}
              </Button>
            ))}
          </div>
        </div>
        <div className="admin-table-wrap overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Trạng thái</th>
                <th>Ngày thêm</th>
                <th>Đơn hàng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {keysLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-keyshop-muted">
                    Đang tải key...
                  </td>
                </tr>
              ) : keys.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    <code className="text-xs text-keyshop-blue">{entry.key}</code>
                  </td>
                  <td>
                    <StatusBadge
                      label={tKeyStatus(entry.status)}
                      tone={keyStatusTone(entry.status)}
                    />
                  </td>
                  <td className="text-sm text-keyshop-muted">
                    {new Date(entry.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="text-sm text-keyshop-muted">
                    {entry.orderId || "—"}
                  </td>
                  <td>
                    {entry.status === "available" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400"
                        onClick={() => handleRevoke(entry)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!keysLoading && keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-keyshop-muted">
                    Không có key nào ở trạng thái {tKeyStatus(keyStatus).toLowerCase()}.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={keyPage}
          totalPages={totalPages}
          totalItems={totalKeys}
          pageSize={keyPageSize}
          onPageChange={setKeyPage}
        />
      </section>
    </div>
  );
}
