import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  valueTitle?: string;
  hint?: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
};

export default function StatCard({
  title,
  value,
  valueTitle,
  hint,
  change,
  changeType = "neutral",
  icon: Icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-keyshop-line/70 bg-keyshop-bg/50 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-keyshop-blue/15 text-keyshop-blue sm:h-11 sm:w-11",
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <span
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:py-1 sm:text-xs",
              changeType === "up" && "bg-keyshop-green/15 text-keyshop-green",
              changeType === "down" && "bg-red-500/15 text-red-400",
              changeType === "neutral" && "bg-white/5 text-keyshop-muted",
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-keyshop-muted">{title}</p>
        <p
          className="mt-1 text-xl font-bold tabular-nums leading-tight tracking-tight text-white sm:text-2xl"
          title={valueTitle ?? value}
        >
          {value}
        </p>
        {hint && (
          <p className="mt-1.5 text-xs leading-snug text-keyshop-muted">{hint}</p>
        )}
      </div>
    </div>
  );
}
