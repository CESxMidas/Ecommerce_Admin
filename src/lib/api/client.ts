import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiEndpoints";

export type ApiRequestConfig = AxiosRequestConfig & { skipAuth?: boolean };

type InternalApiRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

apiClient.interceptors.request.use((config: InternalApiRequestConfig) => {
  const csrfToken = getCookie("csrfToken");

  if (!config.skipAuth && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const { data } = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`,
    {},
    {
      withCredentials: true,
      headers: {
        "X-CSRF-Token": decodeURIComponent(getCookie("csrfToken") || ""),
      },
    },
  );

  setAccessToken(data.token);
  return data.token as string;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/login") &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;

      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const token = await refreshPromise;
        refreshPromise = null;

        if (original.headers) {
          original.headers.Authorization = `Bearer ${token}`;
        }

        return apiClient(original);
      } catch {
        refreshPromise = null;
        clearAccessToken();
      }
    }

    const apiError = new Error(
      error.response?.data?.message || error.message || "Request failed",
    );

    return Promise.reject(apiError);
  },
);

export default apiClient;
