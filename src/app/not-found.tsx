import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-keyshop-bg p-6 text-center">
      <h1 className="text-2xl font-bold text-white">Không tìm thấy trang</h1>
      <p className="text-keyshop-muted">
        Trang quản trị bạn yêu cầu không tồn tại.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-keyshop-blue px-4 py-2 text-sm font-medium text-white hover:bg-keyshop-blue-hover"
      >
        Về tổng quan
      </Link>
    </div>
  );
}
