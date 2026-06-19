"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { clearAccessToken, setAccessToken } from "@/lib/api/client";

export function AuthTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setAccessToken(session.accessToken);
    } else if (status === "unauthenticated") {
      clearAccessToken();
    }
  }, [session, status]);

  return null;
}
