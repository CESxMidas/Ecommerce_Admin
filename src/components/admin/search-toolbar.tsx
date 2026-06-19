"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchToolbarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  filterLabel?: string;
  onFilterClick?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export default function SearchToolbar({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  filterLabel = "Bộ lọc",
  onFilterClick,
  className,
  children,
}: SearchToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-keyshop-line bg-keyshop-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="relative flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-keyshop-muted" />
        <Input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="border-keyshop-line bg-keyshop-bg pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {onFilterClick && (
          <Button type="button" variant="outline" onClick={onFilterClick}>
            {filterLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
