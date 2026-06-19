import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/products",
  "/categories",
  "/orders",
  "/users",
  "/banners",
  "/blogs",
  "/coupons",
  "/settings",
];

async function readSessionToken(request: NextRequest) {
  return getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await readSessionToken(request);

  if (pathname.startsWith("/auth/login")) {
    if (token?.role === "ADMIN") {
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

  if (token.role !== "ADMIN") {
    const signInUrl = new URL("/auth/login", request.url);
    signInUrl.searchParams.set("error", "AdminAccessRequired");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/login",
    "/dashboard",
    "/dashboard/:path*",
    "/products",
    "/products/:path*",
    "/categories",
    "/categories/:path*",
    "/orders",
    "/orders/:path*",
    "/users",
    "/users/:path*",
    "/banners",
    "/banners/:path*",
    "/blogs",
    "/blogs/:path*",
    "/coupons",
    "/coupons/:path*",
    "/settings",
    "/settings/:path*",
  ],
};
