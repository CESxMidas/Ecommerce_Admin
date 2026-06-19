import type { Metadata } from "next";

import LogoSettingsView from "@/components/admin/settings/logo-settings-view";

export const metadata: Metadata = { title: "Quản lý logo" };

export default function LogoSettingsPage() {
  return <LogoSettingsView />;
}
