import { API_BASE_URL } from "@/constants/apiEndpoints";

export function getServerApiUrl() {
  return process.env.API_INTERNAL_URL
    ? `${process.env.API_INTERNAL_URL}/api`
    : API_BASE_URL.startsWith("http")
      ? API_BASE_URL
      : "http://localhost:888/api";
}
