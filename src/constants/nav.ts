import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  History,
  Image,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  UserCog,
  Users,
} from "lucide-react";

import type { Permission } from "@/lib/auth/permissions";

export type AdminNavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: Permission;
  children?: Array<{ label: string; href: string; permission?: Permission }>;
};

export const adminNavItems: AdminNavItem[] = [
  {
    label: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    label: "Báo cáo",
    href: "/reports",
    icon: BarChart3,
    permission: "reports.view",
  },
  {
    label: "Banner trang chủ",
    icon: Image,
    permission: "banners.manage",
    children: [{ label: "Danh sách banner", href: "/banners", permission: "banners.manage" }],
  },
  {
    label: "Danh mục",
    icon: Tags,
    permission: "categories.manage",
    children: [
      { label: "Danh sách danh mục", href: "/categories", permission: "categories.manage" },
    ],
  },
  {
    label: "Sản phẩm",
    icon: Package,
    permission: "products.manage",
    children: [
      { label: "Danh sách sản phẩm", href: "/products", permission: "products.manage" },
      { label: "Thêm sản phẩm", href: "/products/new", permission: "products.manage" },
    ],
  },
  {
    label: "Đơn hàng",
    href: "/orders",
    icon: ShoppingBag,
    permission: "orders.manage",
  },
  {
    label: "Hỗ trợ",
    href: "/tickets",
    icon: LifeBuoy,
    permission: "tickets.manage",
  },
  {
    label: "Duyệt nội dung",
    href: "/content-review",
    icon: ClipboardCheck,
    permission: "content.review_queue",
  },
  {
    label: "Khách hàng",
    href: "/users",
    icon: Users,
    permission: "customers.view",
  },
  {
    label: "Nhân viên",
    href: "/staff",
    icon: UserCog,
    permission: "staff.manage",
  },
  {
    label: "Bài viết",
    icon: FileText,
    permission: "blogs.manage",
    children: [{ label: "Tất cả bài viết", href: "/blogs", permission: "blogs.manage" }],
  },
  {
    label: "Mã giảm giá",
    href: "/coupons",
    icon: Ticket,
    permission: "coupons.manage",
  },
  {
    label: "Cài đặt",
    icon: Settings,
    permission: "settings.manage",
    children: [
      { label: "Quản lý logo", href: "/settings/logo", permission: "settings.manage" },
      { label: "Nhật ký hệ thống", href: "/audit", permission: "audit.view" },
    ],
  },
];
