export type UserRole = "USER" | "OWNER" | "MANAGER" | "STAFF" | "ADMIN";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  verify_email: boolean;
  role: UserRole;
  token: string;
}

export interface AdminStats {
  users: number;
  products: number;
  orders: number;
  categories: number;
  coupons: number;
  revenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    email: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}
