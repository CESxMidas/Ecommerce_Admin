"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { globalSearch } from "@/lib/services/admin-service";
import type { AdminSearchResult } from "@/types/admin";

export default function AdminGlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const items = await globalSearch(query.trim());
        setResults(items);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeLabels: Record<AdminSearchResult["type"], string> = {
    product: "Sản phẩm",
    order: "Đơn hàng",
    user: "Khách hàng",
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-keyshop-muted" />
      <input
        type="search"
        placeholder="Tìm SP, đơn, khách..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        className="h-10 w-64 rounded-xl border border-keyshop-line bg-keyshop-soft pl-10 pr-10 text-sm text-white placeholder:text-keyshop-muted focus:outline-none focus:ring-2 focus:ring-keyshop-blue/40"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-keyshop-muted" />
      ) : null}

      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-keyshop-line bg-keyshop-soft shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-keyshop-muted">Không tìm thấy kết quả</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    href={result.href}
                    className="block px-4 py-3 transition-colors hover:bg-white/5"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <p className="text-sm font-medium text-white">{result.title}</p>
                    <p className="text-xs text-keyshop-muted">
                      {typeLabels[result.type]} · {result.subtitle}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
