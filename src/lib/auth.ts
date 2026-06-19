import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  ADMIN_ACCESS_REQUIRED,
  REMEMBER_ME_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import type { AuthUser } from "@/types/api";

function getServerApiUrl() {
  return process.env.API_INTERNAL_URL
    ? `${process.env.API_INTERNAL_URL}/api`
    : API_BASE_URL.startsWith("http")
      ? API_BASE_URL
      : "http://localhost:888/api";
}

type LoginErrorBody = AuthUser & {
  message?: string;
  code?: string;
};

async function loginWithCredentials(email: string, password: string) {
  const response = await fetch(
    `${getServerApiUrl()}${API_ENDPOINTS.auth.login}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      cache: "no-store",
    },
  );

  const data = (await response.json()) as LoginErrorBody;

  if (!response.ok) {
    throw new Error(data?.message || "Đăng nhập thất bại");
  }

  if (data.role !== "ADMIN") {
    throw new Error(ADMIN_ACCESS_REQUIRED);
  }

  return data;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        try {
          const user = await loginWithCredentials(
            credentials.email,
            credentials.password,
          );

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.avatar || null,
            accessToken: user.token,
            role: user.role,
            rememberMe: credentials.rememberMe === "true",
          };
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }

          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_ME_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.role = (user as { role?: string }).role;
        token.userId = user.id;

        const rememberMe = Boolean(
          (user as { rememberMe?: boolean }).rememberMe,
        );
        token.rememberMe = rememberMe;

        const sessionLength = rememberMe
          ? REMEMBER_ME_MAX_AGE_SECONDS
          : SESSION_MAX_AGE_SECONDS;

        token.exp = Math.floor(Date.now() / 1000) + sessionLength;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }

      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
