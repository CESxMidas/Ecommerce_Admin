import type { Metadata } from "next";

import UsersView from "@/components/admin/users/users-view";

export const metadata: Metadata = { title: "Người dùng" };

export default function UsersPage() {
  return <UsersView />;
}
