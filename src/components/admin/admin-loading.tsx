import { Loader2 } from "lucide-react";

type AdminLoadingProps = {
  label?: string;
};

export default function AdminLoading({
  label = "Đang tải dữ liệu...",
}: AdminLoadingProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/20 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-keyshop-blue" />
      <p className="text-sm text-keyshop-muted">{label}</p>
    </div>
  );
}
