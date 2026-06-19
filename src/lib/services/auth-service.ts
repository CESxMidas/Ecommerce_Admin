import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export async function logout() {
  const { data } = await apiClient.post<{ message?: string }>(
    API_ENDPOINTS.auth.logout,
    {},
  );

  return data;
}
