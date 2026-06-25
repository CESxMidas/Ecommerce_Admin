import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canAccessRoute, isStaffRole } from "@/lib/auth/permissions";
import { sessionCookieName } from "@/lib/auth/cookies";

const protectedPrefixes = [
  "/dashboard",
  "/reports",
  "/products",
  "/categories",
  "/orders",
  "/tickets",
  "/audit",
  "/users",
  "/staff",
  "/banners",
  "/blogs",
  "/coupons",
  "/settings",
  "/profile",
  "/content-review",
];

async function readSessionToken(request: NextRequest) {
  return getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await readSessionToken(request);

  if (pathname.startsWith("/auth/login")) {
    if (isStaffRole(token?.role as string | undefined)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    const signInUrl = new URL("/auth/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!isStaffRole(token.role as string | undefined)) {
    const signInUrl = new URL("/auth/login", request.url);
    signInUrl.searchParams.set("error", "AdminAccessRequired");
    return NextResponse.redirect(signInUrl);
  }

  if (!canAccessRoute(token.role as string | undefined, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/login",
    "/dashboard",
    "/dashboard/:path*",
    "/reports",
    "/reports/:path*",
    "/products",
    "/products/:path*",
    "/categories",
    "/categories/:path*",
    "/orders",
    "/orders/:path*",
    "/tickets",
    "/tickets/:path*",
    "/audit",
    "/audit/:path*",
    "/users",
    "/users/:path*",
    "/staff",
    "/staff/:path*",
    "/banners",
    "/banners/:path*",
    "/blogs",
    "/blogs/:path*",
    "/coupons",
    "/coupons/:path*",
    "/settings",
    "/settings/:path*",
    "/profile",
    "/profile/:path*",
    "/content-review",
    "/content-review/:path*",
  ],
};
