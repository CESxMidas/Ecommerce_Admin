"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import {
  clearAccessToken,
  setAccessToken,
  setSessionUpdater,
} from "@/lib/api/client";

export function AuthTokenSync() {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    setSessionUpdater(async ({ accessToken, refreshToken }) => {
      await update({ accessToken, refreshToken });
    });

    return () => setSessionUpdater(null);
  }, [update]);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setAccessToken(session.accessToken);
    } else if (status === "unauthenticated") {
      clearAccessToken();
    }
  }, [session, status]);

  return null;
}
