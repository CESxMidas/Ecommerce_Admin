import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

export interface AdminUserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  dateOfBirth?: string | null;
  gender: string;
  verify_email: boolean;
  twoFactorEnabled?: boolean;
  pendingEmail?: string;
}

export async function fetchProfile() {
  const { data } = await apiClient.get<AdminUserProfile>(API_ENDPOINTS.user.profile);
  return data;
}

export async function updateProfile(profile: Partial<AdminUserProfile>) {
  const { data } = await apiClient.patch<AdminUserProfile>(
    API_ENDPOINTS.user.profile,
    profile,
  );
  return data;
}

export async function changePassword(payload: {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}) {
  const { data } = await apiClient.post(API_ENDPOINTS.user.password, payload);
  return data;
}
