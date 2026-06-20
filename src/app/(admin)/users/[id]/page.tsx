import type { Metadata } from "next";

import UserDetailView from "@/components/admin/users/user-detail-view";

type UserDetailPageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: "Chi tiết người dùng",
};

export default function UserDetailPage({ params }: UserDetailPageProps) {
  return <UserDetailView userId={params.id} />;
}
