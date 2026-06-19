"use client";

import { signOut } from "next-auth/react";

import { clearAccessToken } from "@/lib/api/client";
import { logout as logoutRequest } from "@/lib/services/auth-service";

export async function performLogout(callbackUrl = "/auth/login") {
  try {
    await logoutRequest();
  } catch {
    // Still clear local session if backend logout fails.
  }

  clearAccessToken();
  await signOut({ callbackUrl });
}
