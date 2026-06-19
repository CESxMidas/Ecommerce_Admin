import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type PriceDisplayProps = {
  amount: number;
  originalAmount?: number | null;
  currency?: string;
  className?: string;
};

export default function PriceDisplay({
  amount,
  originalAmount,
  currency,
  className,
}: PriceDisplayProps) {
  const showOriginal =
    originalAmount != null && originalAmount > amount;

  return (
    <div className={cn("admin-price-cell", className)}>
      <p className="font-medium text-white">
        {formatCurrency(amount, currency)}
      </p>
      {showOriginal && (
        <p className="text-xs text-keyshop-muted line-through">
          {formatCurrency(originalAmount, currency)}
        </p>
      )}
    </div>
  );
}
