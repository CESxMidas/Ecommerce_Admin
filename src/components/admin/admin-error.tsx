import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminErrorProps = {
  message: string;
  onRetry?: () => void;
};

export default function AdminError({ message, onRetry }: AdminErrorProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <div>
        <p className="font-medium text-white">Không tải được dữ liệu</p>
        <p className="mt-2 max-w-md text-sm text-keyshop-muted">{message}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
