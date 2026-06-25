"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { getApiErrorMessage } from "@/lib/utils/api-error";
type UseAdminFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useAdminFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
  options?: { enabled?: boolean },
): UseAdminFetchResult<T> {
  const enabled = options?.enabled !== false;
  const { status } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (status !== "authenticated") {
      setLoading(status === "loading");
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Không tải được dữ liệu"));
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, status, reloadKey, ...deps]);

  return { data, loading, error, refetch };
}
