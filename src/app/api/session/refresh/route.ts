import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { sessionCookieName } from "@/lib/auth/cookies";
import { getServerApiUrl } from "@/lib/auth/server-api";

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });

  if (!token?.refreshToken) {
    return NextResponse.json(
      { message: "Refresh token is required" },
      { status: 401 },
    );
  }

  const response = await fetch(
    `${getServerApiUrl()}${API_ENDPOINTS.auth.refresh}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
      cache: "no-store",
    },
  );

  const data = (await response.json()) as {
    message?: string;
    token?: string;
    refreshToken?: string;
  };

  if (!response.ok) {
    return NextResponse.json(
      { message: data.message || "Refresh failed" },
      { status: response.status },
    );
  }

  return NextResponse.json({
    token: data.token,
    refreshToken: data.refreshToken,
  });
}
