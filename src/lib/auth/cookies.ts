import type { NextAuthOptions } from "next-auth";

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

/** Tên cookie riêng — tránh xung đột với Storefront (:3000) trên cùng localhost */
export const sessionCookieName = `${cookiePrefix}keyshop-admin.session-token`;

const sharedOptions = {
  sameSite: "lax" as const,
  path: "/",
  secure: useSecureCookies,
};

export const authCookies: NextAuthOptions["cookies"] = {
  sessionToken: {
    name: sessionCookieName,
    options: {
      ...sharedOptions,
      httpOnly: true,
    },
  },
  callbackUrl: {
    name: `${cookiePrefix}keyshop-admin.callback-url`,
    options: {
      ...sharedOptions,
      httpOnly: false,
    },
  },
  csrfToken: {
    name: `${cookiePrefix}keyshop-admin.csrf-token`,
    options: {
      ...sharedOptions,
      httpOnly: false,
    },
  },
};
