"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2, Upload, UserRound } from "lucide-react";

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
  fetchProductAccounts,
  fetchProductAccountStats,
  importProductAccounts,
  revokeProductAccount,
  type AccountPoolEntry,
} from "@/lib/services/admin-service";
import {
  isAccountPoolProductType,
  parseAccountImportFileContent,
  parseAccountImportText,
} from "@/lib/utils/product-form";

type ProductAccountsViewProps = {
  productId: string;
};

type AccountStatusFilter = "available" | "reserved" | "sold" | "revoked";

const accountStatusOptions: AccountStatusFilter[] = [
  "available",
  "reserved",
  "sold",
  "revoked",
];

function accountStatusTone(status: string): "success" | "warning" | "neutral" | "danger" {
  if (status === "available") return "success";
  if (status === "reserved") return "warning";
  if (status === "sold") return "neutral";
  return "danger";
}

export default function ProductAccountsView({ productId }: ProductAccountsViewProps) {
  const [accountStatus, setAccountStatus] = useState<AccountStatusFilter>("available");
  const [accountPage, setAccountPage] = useState(0);
  const accountPageSize = 20;

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
  } = useAdminFetch(() => fetchProductAccountStats(productId), [productId]);
  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useAdminFetch(
    () =>
      fetchProductAccounts(productId, {
        status: accountStatus,
        page: accountPage + 1,
        limit: accountPageSize,
      }),
    [productId, accountStatus, accountPage],
  );

  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  const loading = productLoading || statsLoading || accountsLoading;
  const error = productError || statsError || accountsError;
  const accounts = accountsData?.items ?? [];
  const totalAccounts = accountsData?.total ?? 0;
  const totalPages = accountsData?.totalPages ?? 1;

  const poolEnabled = useMemo(() => {
    if (!product) return false;
    return isAccountPoolProductType(product.productType, product.deliveryType);
  }, [product]);

  async function handleImport() {
    const lines = parseAccountImportText(importText);

    if (lines.length === 0) {
      toast.error("Nhập ít nhất một tài khoản");
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
      const lines = parseAccountImportFileContent(content);

      if (lines.length === 0) {
        toast.error("File không chứa tài khoản hợp lệ");
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
      const result = await importProductAccounts(productId, { text: lines.join("\n") });
      toast.success(
        `Đã import ${result.imported} tài khoản (${result.available} khả dụng)`,
      );
      setImportText("");
      setAccountStatus("available");
      setAccountPage(0);
      refetchStats();
      refetchAccounts();
      refetchProduct();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import thất bại");
    } finally {
      setImporting(false);
    }
  }

  async function handleRevoke(account: AccountPoolEntry) {
    if (!confirm(`Thu hồi tài khoản ${account.username}?`)) return;

    try {
      await revokeProductAccount(productId, account._id);
      toast.success("Đã thu hồi tài khoản");
      refetchStats();
      refetchAccounts();
      refetchProduct();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Thu hồi thất bại");
    }
  }

  if (loading && !product) {
    return <AdminLoading label="Đang tải kho tài khoản..." />;
  }

  if (error || !product) {
    return (
      <AdminError
        message={error || "Không tìm thấy sản phẩm"}
        onRetry={() => {
          refetchProduct();
          refetchStats();
          refetchAccounts();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <AdminPageHeader
        title="Kho tài khoản Premium"
        breadcrumbs={[
          { label: "Sản phẩm" },
          { label: product.name },
          { label: "Account pool" },
        ]}
        description={`Quản lý tài khoản thật cho ${product.name}`}
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
            label={poolEnabled ? "Account pool" : "Không dùng pool"}
            tone={poolEnabled ? "success" : "neutral"}
          />
        </div>

        {!poolEnabled ? (
          <p className="text-sm text-amber-300">
            Sản phẩm này chưa bật account pool. Đặt loại <code>account</code> và giao hàng{" "}
            <code>account_credentials</code> trong form sửa sản phẩm.
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
                setAccountStatus(status as AccountStatusFilter);
                setAccountPage(0);
              }}
              className={`admin-card text-left transition-colors ${
                status !== "total" && accountStatus === status
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
          <h2 className="text-lg font-semibold text-white">Import tài khoản</h2>
        </div>
        <p className="text-sm text-keyshop-muted">
          Mỗi dòng một tài khoản theo định dạng <code>email|password|ghi chú</code>. Tài khoản
          trùng email sẽ bị bỏ qua. Tồn kho sản phẩm tự sync theo số tài khoản khả dụng.
        </p>
        <div className="space-y-2">
          <Label htmlFor="importAccounts">Danh sách tài khoản</Label>
          <textarea
            id="importAccounts"
            rows={8}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={"user@email.com|MatKhau123|Gói 1 tháng\nuser2@email.com|Pass456"}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            disabled={!poolEnabled}
          />
        </div>
        <Button type="button" onClick={handleImport} disabled={!poolEnabled || importing}>
          <UserRound className="h-4 w-4" />
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
          <p className="text-xs text-keyshop-muted">CSV: email, password, ghi chú (tùy chọn)</p>
        </div>
      </section>

      <section className="admin-card overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-keyshop-line p-6">
          <h2 className="text-lg font-semibold text-white">
            Danh sách tài khoản · {tKeyStatus(accountStatus)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {accountStatusOptions.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={accountStatus === status ? "default" : "outline"}
                onClick={() => {
                  setAccountStatus(status);
                  setAccountPage(0);
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
                <th>Email / Username</th>
                <th>Mật khẩu</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
                <th>Đơn hàng</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {accountsLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-keyshop-muted">
                    Đang tải tài khoản...
                  </td>
                </tr>
              ) : (
                accounts.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <code className="text-xs text-keyshop-blue">{entry.username}</code>
                    </td>
                    <td>
                      <code className="text-xs text-keyshop-muted">{entry.password}</code>
                    </td>
                    <td className="text-sm text-keyshop-muted">{entry.note || "—"}</td>
                    <td>
                      <StatusBadge
                        label={tKeyStatus(entry.status)}
                        tone={accountStatusTone(entry.status)}
                      />
                    </td>
                    <td className="text-sm text-keyshop-muted">{entry.orderId || "—"}</td>
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
                ))
              )}
              {!accountsLoading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-keyshop-muted">
                    Không có tài khoản nào ở trạng thái{" "}
                    {tKeyStatus(accountStatus).toLowerCase()}.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={accountPage}
          totalPages={totalPages}
          totalItems={totalAccounts}
          pageSize={accountPageSize}
          onPageChange={setAccountPage}
        />
      </section>
    </div>
  );
}
