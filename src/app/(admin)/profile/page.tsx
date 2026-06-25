import type { Metadata } from "next";

import ProfileView from "@/components/admin/profile/profile-view";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Quản lý thông tin tài khoản quản trị KEYSHOP.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
