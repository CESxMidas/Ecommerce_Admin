"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchToolbarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  resultCount?: number;
  totalCount?: number;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  filters?: React.ReactNode;
  children?: React.ReactNode;
};

export default function SearchToolbar({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  className,
  resultCount,
  totalCount,
  activeFilterCount = 0,
  onClearFilters,
  filters,
  children,
}: SearchToolbarProps) {
  const hasFilterPanel = Boolean(filters || children);
  const showResultSummary =
    resultCount != null && totalCount != null && totalCount > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-keyshop-line bg-keyshop-soft/50 p-4 sm:p-5",
        className,
      )}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-keyshop-muted" />
        <Input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="h-11 border-keyshop-line bg-keyshop-bg pl-10 text-sm"
        />
      </div>

      {hasFilterPanel ? (
        <div className="mt-4 border-t border-keyshop-line/80 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-keyshop-blue" />
              <span className="text-sm font-medium text-white">Bộ lọc</span>
              {activeFilterCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-keyshop-blue/15 px-1.5 text-[11px] font-semibold text-keyshop-blue">
                  {activeFilterCount}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              {showResultSummary ? (
                <span className="text-keyshop-muted">
                  <span className="font-medium text-white">{resultCount}</span>
                  {" / "}
                  {totalCount} kết quả
                </span>
              ) : null}
              {activeFilterCount > 0 && onClearFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-keyshop-muted hover:text-white"
                  onClick={onClearFilters}
                >
                  <X className="h-3.5 w-3.5" />
                  Xóa bộ lọc
                </Button>
              ) : null}
            </div>
          </div>

          {filters ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filters}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
