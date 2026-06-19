# KEYSHOP Admin (Next.js)

Administration dashboard — Next.js 14 + TypeScript + Tailwind (aligned with `Ecommerce_Frontend`).

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (KEYSHOP tokens)
- NextAuth v4 (ADMIN role only)
- Express API backend (`../Ecommerce_Backend`)

## Development

```powershell
# Terminal 1 — Backend
cd ..\Ecommerce_Backend
npm run dev          # localhost:888

# Tạo tài khoản admin (chạy 1 lần)
npm run seed:admin
# Email: admin@keyshop.vn  |  Mật khẩu: Admin@123456

# Terminal 2 — Admin
cd E-commerce_Admin
copy .env.example .env
npm install
npm run dev          # localhost:3001
```

Open http://localhost:3001/auth/login

### Đăng nhập dev

| Trường | Giá trị |
|--------|---------|
| Email | `admin@keyshop.vn` |
| Mật khẩu | `Admin@123456` |

Sau đăng nhập → redirect `/dashboard` → duyệt sidebar xem giao diện các trang.

## Environment

Copy `.env.example` to `.env`:

- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3001/api/next-auth`
- `API_INTERNAL_URL` — `http://localhost:888`

Backend `CORS_ORIGIN` must include `http://localhost:3001`.

## Legacy Vite UI

Previous Vite + MUI prototype is archived in `legacy-vite/` for Phase 2 UI migration reference.

## Docs

- [`ADMIN-HANDOFF.md`](./ADMIN-HANDOFF.md) — migration plan and checklist
