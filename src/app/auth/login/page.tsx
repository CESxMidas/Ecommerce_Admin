import { Suspense } from "react";
import type { Metadata } from "next";

import LoginForm from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-keyshop-bg text-keyshop-muted">
          Đang tải...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
