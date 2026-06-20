import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Image,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: Array<{ label: string; href: string }>;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Banner trang chủ",
    icon: Image,
    children: [{ label: "Danh sách banner", href: "/banners" }],
  },
  {
    label: "Danh mục",
    icon: Tags,
    children: [
      { label: "Danh sách danh mục", href: "/categories" },
    ],
  },
  {
    label: "Sản phẩm",
    icon: Package,
    children: [
      { label: "Danh sách sản phẩm", href: "/products" },
      { label: "Thêm sản phẩm", href: "/products/new" },
    ],
  },
  {
    label: "Người dùng",
    href: "/users",
    icon: Users,
  },
  {
    label: "Đơn hàng",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    label: "Bài viết",
    icon: FileText,
    children: [{ label: "Tất cả bài viết", href: "/blogs" }],
  },
  {
    label: "Mã giảm giá",
    href: "/coupons",
    icon: Ticket,
  },
  {
    label: "Cài đặt",
    icon: Settings,
    children: [{ label: "Quản lý logo", href: "/settings/logo" }],
  },
];
