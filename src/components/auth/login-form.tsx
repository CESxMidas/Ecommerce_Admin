"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { ADMIN_ACCESS_REQUIRED } from "@/lib/auth/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000";
const REMEMBER_EMAIL_KEY = "keyshop_admin_remember_email";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      window.location.assign(callbackUrl);
    }
  }, [status, callbackUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    if (!password) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email: trimmedEmail,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === ADMIN_ACCESS_REQUIRED) {
        toast.error("Tài khoản này không có quyền quản trị.");
        return;
      }

      toast.error(result.error);
      return;
    }

    if (result?.ok) {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      toast.success("Đăng nhập thành công");
      // Hard navigation ensures the session cookie is sent before middleware runs.
      window.location.assign(callbackUrl);
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-keyshop-bg text-keyshop-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="auth-login-grid h-full bg-keyshop-bg">
      <div className="auth-login-form-panel">
        <div className="auth-login-form-inner">
          <div className="auth-login-brand">
            <div className="auth-login-logo">
              <KeyRound className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              KEYSHOP
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
              Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
            </h1>
            <p className="text-sm leading-snug text-keyshop-muted">
              Truy cập an toàn vào kho hàng, đơn hàng và license key. Chỉ dành
              cho quản trị viên được ủy quyền.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-keyshop-line bg-keyshop-soft/60 px-3 py-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-keyshop-blue" />
            <p className="text-xs text-keyshop-muted">
              Phiên mã hóa · Phân quyền theo vai trò
            </p>
          </div>

          {(error === "AdminAccessRequired" ||
            error === "CredentialsSignin") && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-200"
            >
              {error === "AdminAccessRequired"
                ? "Yêu cầu quyền quản trị. Vui lòng dùng tài khoản Admin."
                : "Thông tin đăng nhập không hợp lệ. Vui lòng thử lại."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-keyshop-muted">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@keyshop.vn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="auth-login-input h-10 border-keyshop-line bg-keyshop-soft"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-keyshop-muted">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="auth-login-input h-10 border-keyshop-line bg-keyshop-soft pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-keyshop-muted transition-colors hover:text-white"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-keyshop-muted">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-keyshop-line bg-keyshop-soft accent-keyshop-blue"
                />
                Ghi nhớ đăng nhập
              </label>
              <Link
                href={`${STOREFRONT_URL}/auth/forgot-password`}
                className="text-sm font-medium text-keyshop-blue transition-colors hover:text-keyshop-blue-hover"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              className="auth-login-submit h-10 w-full font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-keyshop-muted">
            Khu vực hạn chế · Chỉ dành cho quản trị viên
          </p>
        </div>
      </div>

      <div className="auth-login-hero-panel hidden lg:flex">
        <div className="auth-login-hero-glow" aria-hidden />
        <div className="auth-login-hero-inner">
          <p className="text-xs font-semibold uppercase tracking-widest text-keyshop-blue">
            Bảng điều khiển
          </p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-white xl:text-4xl">
            Giải pháp quản lý thương mại số toàn diện.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-keyshop-muted">
            Theo dõi kho license, xử lý đơn hàng và doanh thu từ một bảng điều
            khiển bảo mật, được thiết kế riêng cho KEYSHOP.
          </p>

          <div className="auth-login-preview mt-6">
            <div className="auth-login-preview-bar">
              <span className="auth-login-preview-dot bg-red-400/80" />
              <span className="auth-login-preview-dot bg-amber-400/80" />
              <span className="auth-login-preview-dot bg-keyshop-green/80" />
              <span className="ml-2 text-[10px] text-keyshop-muted">
                admin.keyshop.vn
              </span>
            </div>
            <div className="auth-login-preview-body">
              <div className="grid grid-cols-2 gap-2">
                <div className="auth-login-preview-stat">
                  <span className="text-[9px] uppercase tracking-wide text-keyshop-muted">
                    Doanh thu
                  </span>
                  <strong className="text-base text-white">4,86 tỷ đ</strong>
                  <span className="text-[9px] text-keyshop-green">+28,4%</span>
                </div>
                <div className="auth-login-preview-stat">
                  <span className="text-[9px] uppercase tracking-wide text-keyshop-muted">
                    Key đã bán
                  </span>
                  <strong className="text-base text-white">12.430</strong>
                  <span className="text-[9px] text-keyshop-green">+14,2%</span>
                </div>
              </div>
              <div className="mt-3 flex h-14 items-end gap-1 px-0.5">
                {[40, 65, 45, 80, 55, 90, 70, 85].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-keyshop-blue/30 to-keyshop-blue"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 space-y-1.5 border-t border-keyshop-line pt-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-keyshop-muted">Ví Steam 50 USD</span>
                  <span className="text-keyshop-green">Đã giao</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-keyshop-muted">Windows 11 Pro</span>
                  <span className="text-keyshop-blue">Đang xử lý</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
