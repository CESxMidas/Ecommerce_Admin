import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
};

const toneStyles = {
  success: "bg-keyshop-green/15 text-keyshop-green border-keyshop-green/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border-red-500/20",
  info: "bg-keyshop-blue/15 text-keyshop-blue border-keyshop-blue/20",
  neutral: "bg-white/5 text-keyshop-muted border-white/10",
};

export default function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
      )}
    >
      {label}
    </span>
  );
}

export function orderStatusTone(status: string): StatusBadgeProps["tone"] {
  switch (status) {
    case "Delivered":
      return "success";
    case "Processing":
    case "Shipped":
      return "info";
    case "PendingPayment":
      return "warning";
    case "Cancelled":
    case "Failed":
    case "Refunded":
      return "danger";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): StatusBadgeProps["tone"] {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
    case "awaiting_cod":
      return "warning";
    case "failed":
    case "refunded":
      return "danger";
    default:
      return "neutral";
  }
}

export function activeStatusTone(isActive: boolean): StatusBadgeProps["tone"] {
  return isActive ? "success" : "neutral";
}
