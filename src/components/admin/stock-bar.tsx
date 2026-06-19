import { cn } from "@/lib/utils";

type StockBarProps = {
  value: number;
  max?: number;
  className?: string;
};

export default function StockBar({ value, max = 100, className }: StockBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const barColor =
    value === 0
      ? "bg-red-500"
      : percent < 25
        ? "bg-amber-500"
        : "bg-keyshop-green";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
