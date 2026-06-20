export type StaffRole = "OWNER" | "MANAGER" | "STAFF" | "ADMIN";
export type AssignableStaffRole = "MANAGER" | "STAFF";
export type UserRole = StaffRole | "USER";

export const STAFF_ROLES: StaffRole[] = ["OWNER", "MANAGER", "STAFF", "ADMIN"];

export type Permission =
  | "dashboard.view"
  | "dashboard.revenue"
  | "reports.view"
  | "orders.manage"
  | "products.manage"
  | "categories.manage"
  | "keys.manage"
  | "banners.manage"
  | "blogs.manage"
  | "coupons.manage"
  | "customers.view"
  | "customers.manage"
  | "staff.manage"
  | "settings.manage"
  | "tickets.manage"
  | "reviews.manage"
  | "audit.view";

const PERMISSIONS: Record<Permission, Array<StaffRole | "OWNER">> = {
  "dashboard.view": ["OWNER", "MANAGER", "STAFF"],
  "dashboard.revenue": ["OWNER"],
  "reports.view": ["OWNER"],
  "orders.manage": ["OWNER", "MANAGER", "STAFF"],
  "products.manage": ["OWNER", "MANAGER"],
  "categories.manage": ["OWNER", "MANAGER"],
  "keys.manage": ["OWNER", "MANAGER", "STAFF"],
  "banners.manage": ["OWNER", "MANAGER"],
  "blogs.manage": ["OWNER", "MANAGER"],
  "coupons.manage": ["OWNER", "MANAGER"],
  "customers.view": ["OWNER"],
  "customers.manage": ["OWNER"],
  "staff.manage": ["OWNER"],
  "settings.manage": ["OWNER"],
  "tickets.manage": ["OWNER", "MANAGER", "STAFF"],
  "reviews.manage": ["OWNER", "MANAGER"],
  "audit.view": ["OWNER"],
};

export function normalizeStaffRole(role?: string | null): StaffRole | "USER" | null {
  if (!role) return null;
  if (role === "ADMIN") return "OWNER";
  return role as StaffRole | "USER";
}

export function isStaffRole(role?: string | null): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

export function isOwnerRole(role?: string | null) {
  return role === "OWNER" || role === "ADMIN";
}

export function hasPermission(
  role: string | undefined | null,
  permission: Permission,
): boolean {
  const effectiveRole = normalizeStaffRole(role);
  if (!effectiveRole || effectiveRole === "USER") {
    return false;
  }

  return PERMISSIONS[permission].includes(effectiveRole);
}

export function canAccessRoute(role: string | undefined | null, pathname: string) {
  const permission = ROUTE_PERMISSIONS.find(({ prefix }) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  )?.permission;

  if (!permission) {
    return isStaffRole(role ?? undefined);
  }

  return hasPermission(role, permission);
}

export const ROUTE_PERMISSIONS: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/dashboard", permission: "dashboard.view" },
  { prefix: "/reports", permission: "reports.view" },
  { prefix: "/orders", permission: "orders.manage" },
  { prefix: "/tickets", permission: "tickets.manage" },
  { prefix: "/audit", permission: "audit.view" },
  { prefix: "/products", permission: "products.manage" },
  { prefix: "/categories", permission: "categories.manage" },
  { prefix: "/banners", permission: "banners.manage" },
  { prefix: "/blogs", permission: "blogs.manage" },
  { prefix: "/coupons", permission: "coupons.manage" },
  { prefix: "/users", permission: "customers.view" },
  { prefix: "/staff", permission: "staff.manage" },
  { prefix: "/settings", permission: "settings.manage" },
];

export function filterNavByRole<T extends { permission?: Permission; href?: string }>(
  items: T[],
  role?: string | null,
): T[] {
  return items
    .map((item) => {
      if (item.permission && !hasPermission(role, item.permission)) {
        return null;
      }

      if (
        item.href &&
        !canAccessRoute(role, item.href)
      ) {
        return null;
      }

      return item;
    })
    .filter(Boolean) as T[];
}
