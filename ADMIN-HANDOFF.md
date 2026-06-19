# KEYSHOP Admin — Chuyển giao công nghệ & phát triển giao diện

> So sánh `E-commerce_Admin` (hiện tại) với `Ecommerce_Frontend` (mục tiêu) và `Ecommerce_Backend` (API).  
> Cập nhật: **2026-06-19**

---

## Tóm tắt hiện trạng

| Hạng mục | Admin (hiện tại) | FE (mục tiêu) | Backend (sẵn có) |
|----------|------------------|---------------|-------------------|
| Framework | Vite 8 + React 18 | Next.js 14 App Router | Express 5 |
| Ngôn ngữ | JavaScript (JSX) | TypeScript | JavaScript (ESM) |
| Routing | React Router DOM 6 | File-based `app/` | REST `/api/*` |
| UI | MUI + Emotion + CSS riêng | Tailwind + Radix/shadcn | — |
| Auth | Chưa nối API (UI tĩnh) | NextAuth v4 + JWT refresh | `POST /api/auth/login`, role `ADMIN` |
| API client | Không có | Axios `lib/api/client.ts` | Port `:888` |
| Dữ liệu | Mock (`data/mocks/`) | Gọi API thật | MongoDB |
| Design | Dark admin custom | KEYSHOP tokens `keyshop-*` | — |

**Kết luận:** Admin mới dừng ở giai đoạn UI prototype (Dashboard + Product list + Login). Cần migrate stack giống FE và nối toàn bộ API admin đã có trên BE.

---

## Bắt đầu nhanh

```powershell
# Terminal 1 — Backend
cd ..\Ecommerce_Backend
npm run dev          # localhost:888

# Terminal 2 — Admin (Next.js)
cd E-commerce_Admin
copy .env.example .env
npm install
npm run dev          # localhost:3001
```

| Biến môi trường | Giá trị dev |
|-----------------|-------------|
| `NEXTAUTH_URL` | `http://localhost:3001/api/next-auth` |
| `API_INTERNAL_URL` | `http://localhost:888` |
| `NEXT_PUBLIC_API_URL` | `/api` (proxy qua `next.config.mjs`) |

**Legacy Vite UI** được lưu tại `legacy-vite/` để tham chiếu Phase 2.

---

## Cấu trúc Admin hiện tại

```
E-commerce_Admin/
├── src/
│   ├── App.jsx                 # Router + Context (sidebar, isLogin)
│   ├── layouts/AdminLayout.jsx # Sidebar + Header + Outlet
│   ├── Pages/
│   │   ├── DashBoard/          # Bảng SP, đơn hàng, chart — mock
│   │   ├── Products/           # Danh sách SP — mock
│   │   └── Login/              # UI login — chưa gọi API
│   ├── Components/
│   │   ├── SideBar/            # Menu đầy đủ (nhiều mục chưa có route)
│   │   ├── Header/             # MUI Menu, notification badge
│   │   ├── DashboardBox/       # Stat cards + Recharts (chưa dùng ở Dashboard)
│   │   └── Progress/           # Thanh stock
│   └── data/mocks/             # dashboard.js, productList.js
├── vite.config.js
└── tailwind.config.js          # Cấu hình tối thiểu, ít dùng
```

### Routes đã có vs menu Sidebar

| Menu Sidebar | Route / Trang | Trạng thái |
|--------------|---------------|------------|
| Dashboard | `/` | UI mock |
| Home Slides | — | Chưa có route |
| Category | — | Chưa có route |
| Products → Product List | `/product` | UI mock |
| Products → Upload, Reviews | — | Chưa có |
| Users | — | Chưa có |
| Orders | — | Chưa có |
| Banners | — | Chưa có |
| Blogs | — | Chưa có |
| Manage Logo | — | Chưa có |
| Logout | — | Chưa có logic |

---

## API Backend sẵn có cho Admin

Base: `http://localhost:888/api` — yêu cầu `Authorization: Bearer <token>` và `role === "ADMIN"`.

| Nhóm | Endpoint | Ghi chú |
|------|----------|---------|
| **Stats** | `GET /admin/stats` | users, products, orders, revenue, recentOrders |
| **Banners** | `GET/POST /admin/banners`, `PUT/DELETE /admin/banners/:id` | CRUD banner / home slides |
| **Blogs** | `GET/POST /admin/blogs`, `PUT/DELETE /admin/blogs/:id` | CRUD blog |
| **Upload** | `POST /admin/upload` | Multer → Cloudinary |
| **Coupons** | `GET/POST /admin/coupons`, `PUT/DELETE /admin/coupons/:id` | CRUD coupon |
| **Products** | `POST /products`, `PUT/DELETE /products/:id` | Admin only |
| **Categories** | `POST /categories`, `PUT/DELETE /categories/:id` | Admin only |
| **Orders** | `PATCH /orders/:id` | `updateOrderStatus` — admin only |
| **Auth** | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` | Dùng chung với FE |

**Chưa có API riêng (cần BE bổ sung hoặc dùng route hiện có):**

- `GET /users` — quản lý user (chưa có admin user list)
- Analytics chart theo tháng (stats chỉ trả tổng + recent orders)
- Quản lý logo / site settings
- Admin product reviews moderation

---

## Mục tiêu kiến trúc (giống FE)

```
Ecommerce_Admin/                    # Đổi tên gợi ý: giữ hoặc → Ecommerce_Admin_Next
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Admin shell, providers
│   │   ├── page.tsx                # Redirect → /dashboard
│   │   ├── auth/login/page.tsx     # Login admin (ẩn sidebar)
│   │   ├── (admin)/                # Route group — có sidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   ├── users/
│   │   │   ├── banners/
│   │   │   ├── blogs/
│   │   │   ├── coupons/
│   │   │   └── settings/logo/page.tsx
│   │   └── api/auth/[...nextauth]/ # Hoặc auth thuần JWT (xem Phase 2)
│   ├── components/
│   │   ├── layout/                 # admin-sidebar, admin-header, admin-shell
│   │   ├── admin/                  # tables, stat-cards, forms CRUD
│   │   └── ui/                     # shadcn: Button, Table, Dialog, Toast…
│   ├── lib/
│   │   ├── api/client.ts           # Copy/adapt từ FE
│   │   ├── api/server.ts           # SSR fetch (nếu cần)
│   │   └── services/               # admin-products, admin-orders…
│   ├── constants/apiEndpoints.ts
│   ├── types/                      # Product, Order, Banner, AdminStats…
│   └── middleware.ts               # Guard `/dashboard`, `/products`… — ADMIN only
├── tailwind.config.ts              # Tokens admin (có thể extend keyshop-*)
├── next.config.mjs                 # Proxy `/api` → BE :888
├── components.json                 # shadcn
└── ADMIN-HANDOFF.md                # File này
```

**Port gợi ý:** `localhost:3001` (tránh trùng FE `:3000`).

---

## Phase 1 — Chuyển giao công nghệ ✅ (2026-06-19)

### 1.1 Khởi tạo project Next.js

- [x] Next.js 14 + TypeScript trong `E-commerce_Admin`
- [x] Pattern từ FE: `tsconfig`, `tailwind.config.ts`, `components.json`, `postcss`
- [x] `next.config.mjs` — rewrites proxy `/api/*` → `API_INTERNAL_URL`
- [x] `.env.example` + `.env` dev
- [x] Script `dev` / `start` port `3001`

### 1.2 Loại bỏ stack cũ

- [x] Archive Vite → `legacy-vite/` (src, index.html, vite.config.js)
- [x] Gỡ Vite, React Router, MUI, Emotion khỏi `package.json`
- [x] UI base: Tailwind + shadcn (Button, Input, Label)
- [x] Icon: `lucide-react`

### 1.3 API layer & auth

- [x] `lib/api/client.ts` + `constants/apiEndpoints.ts` (có block `admin`)
- [x] NextAuth Credentials — chỉ `role === ADMIN`
- [x] `middleware.ts` guard routes admin
- [x] Logout: `POST /auth/logout` + `signOut`
- [x] Refresh token interceptor

### 1.4 Layout & routing

- [x] `AdminShell` + sidebar + header
- [x] Menu → `app/(admin)/**/page.tsx`
- [x] Placeholder pages cho mọi mục menu
- [x] Responsive sidebar mobile overlay

### 1.5 Tích hợp CORS & env Backend

- [x] `Ecommerce_Backend/.env.example` → thêm `localhost:3001`
- [ ] Cập nhật `Ecommerce_Backend/.env` production/dev thực tế (thủ công)

### 1.6 DevOps & chất lượng

- [x] `npm run build` pass
- [x] README cập nhật

---

## Phase 1.5 — Giao diện Admin (UI-first) ✅ (2026-06-19)

> **Chiến lược:** Dựng toàn bộ UI trước, mock data theo schema BE. Chưa nối API / chưa submit form thật.

### Đã có

| Trang | Component | BE tham chiếu |
|-------|-----------|---------------|
| `/dashboard` | `dashboard-view.tsx` | `GET /admin/stats`, chart (mock) |
| `/products` | `products-list-view.tsx` | Product model, CRUD `/products` |
| `/products/new` | `product-form-view.tsx` | Product fields + `/admin/upload` |
| `/categories` | `categories-view.tsx` | Category model, parentId |
| `/orders` | `orders-view.tsx` | Order + items, PATCH status |
| `/users` | `users-view.tsx` | User model (API chưa có) |
| `/banners` | `banners-view.tsx` | Banner, placement |
| `/blogs` | `blogs-view.tsx` | Blog model |
| `/coupons` | `coupons-view.tsx` | Coupon model |
| `/settings/logo` | `logo-settings-view.tsx` | Backlog BE |

### Shared components

- `admin-page-header`, `stat-card`, `status-badge`, `stock-bar`
- `search-toolbar`, `pagination-bar`, `empty-state`
- `admin-table` styles trong `globals.css`

### Mock data

- `src/types/admin.ts` — types khớp Mongoose models
- `src/data/mock/admin.ts` — fixtures KEYSHOP (Steam, Windows, Xbox…)

### Chưa làm (chờ phase logic)

- [ ] Gọi API thật thay mock
- [ ] Form submit + validation + toast errors
- [ ] Modal confirm delete
- [ ] Edit product `/products/[id]/edit`
- [ ] Banner/Blog/Coupon create modals

---

### 2.1 Auth / Login (`/auth/login`)

**Hiện tại:** UI split-panel đẹp nhưng duplicate field email, chưa submit, brand "KeyStore".

**Cần làm:**

- [ ] Form email + password (bỏ field trùng)
- [ ] Submit → `POST /auth/login` → kiểm tra `user.role === ADMIN`
- [ ] Remember me (optional, parity FE)
- [ ] Loading / error toast
- [ ] Đồng bộ brand **KEYSHOP** + tokens màu (`keyshop-blue`, `keyshop-bg`)
- [ ] Bỏ OAuth Steam/Google trên admin (hoặc chỉ admin email/password)
- [ ] Redirect sau login → `/dashboard`

### 2.2 Dashboard (`/dashboard`)

**Hiện tại:** Mock products, orders, chart; `DashboardBox` component chưa được ghép vào page.

**Cần làm:**

- [ ] Gọi `GET /admin/stats` — stat cards: Users, Products, Orders, Revenue, Coupons
- [ ] Tái sử dụng / migrate `DashboardBox` → `StatCard` grid (Tailwind, bỏ Swiper nếu không cần)
- [ ] Bảng **Recent Orders** từ `stats.recentOrders` (thay mock)
- [ ] Bảng **Recent Products** — `GET /products?limit=10&sort=-createdAt` (hoặc field tương đương BE)
- [ ] Chart analytics — **cần BE** endpoint mới (doanh thu theo ngày/tháng) hoặc tạm ẩn chart cho đến khi có API
- [ ] Nút "+ Add Product" → `/products/new`
- [ ] Welcome banner — hiển thị tên admin từ `GET /auth/me`

### 2.3 Products (`/products`, `/products/new`, `/products/[id]/edit`)

**Hiện tại:** Bảng HTML + mock; actions Edit/View/Delete chưa hoạt động.

**Cần làm:**

- [ ] List: `GET /products` — search, filter category, pagination server-side
- [ ] Cột: ảnh, tên, SKU, stock (license keys count), giá, rating, status `isActive`
- [ ] Stock progress bar (migrate `Progress` component sang Tailwind)
- [ ] Actions: View (modal hoặc trang edit), Edit, Delete (`DELETE /products/:id` + confirm dialog)
- [ ] **Add / Edit form:** tên, mô tả, giá, category, ảnh (`POST /admin/upload`), variants, license keys upload
- [ ] Export CSV (optional — UI đã có nút Export)
- [ ] **Reviews** (`/products/reviews`) — `GET /products/:id/reviews`; moderation nếu BE hỗ trợ

### 2.4 Categories (`/categories`)

**Menu:** Category List, Add, Sub Category.

**Cần làm:**

- [ ] Tree/list `GET /categories`
- [ ] Form create/edit — `POST/PUT/DELETE /categories`
- [ ] Sub-category: dùng field parent trên model Category (xác nhận schema BE)
- [ ] Toggle `isActive`

### 2.5 Orders (`/orders`, `/orders/[id]`)

**Cần làm:**

- [ ] List orders — cần xác nhận BE: admin có list all orders không (`GET /orders` với admin?)
- [ ] Chi tiết đơn: line items, payment, địa chỉ
- [ ] Expand row line items (giữ UX collapse hiện tại)
- [ ] Cập nhật status — `PATCH /orders/:id` (`updateOrderStatus`)
- [ ] Filter theo status, ngày, payment method

### 2.6 Users (`/users`)

**Cần làm:**

- [ ] **BE:** thêm `GET /admin/users` (pagination, search) nếu chưa có
- [ ] Bảng user: email, role, ngày tạo, trạng thái verify
- [ ] Actions: đổi role, khóa tài khoản (nếu BE hỗ trợ)

### 2.7 Home Slides / Banners (`/banners`)

**Cần làm:**

- [ ] List `GET /admin/banners`
- [ ] Form add/edit: ảnh upload, link, thứ tự, `isActive`
- [ ] Delete có confirm
- [ ] Preview ảnh trên mobile/desktop

### 2.8 Blogs (`/blogs`)

**Cần làm:**

- [ ] List `GET /admin/blogs`
- [ ] Rich text hoặc markdown editor cho nội dung
- [ ] Upload thumbnail `POST /admin/upload`
- [ ] CRUD đầy đủ

### 2.9 Coupons (`/coupons`)

**Cần làm:**

- [ ] List `GET /admin/coupons`
- [ ] Form: mã, %, min order, hạn dùng, `isActive`
- [ ] CRUD — chưa có trong menu Sidebar cũ → **thêm vào menu**

### 2.10 Settings — Manage Logo (`/settings/logo`)

**Cần làm:**

- [ ] **BE:** endpoint site settings / logo (chưa có → backlog BE)
- [ ] UI upload logo + favicon tạm dùng banner/settings pattern

### 2.11 Header & Sidebar (shared layout)

**Cần làm:**

- [ ] Header: toggle sidebar, search global (products/orders), notification (mock → API sau)
- [ ] User menu: profile admin, sign out
- [ ] Sidebar: NavLink active state, submenu collapse, icon Lucide
- [ ] Logout item → gọi API logout
- [ ] Đồng bộ tên app: **KEYSHOP Admin** (thay "SoftKey Admin")

---

## Phase 3 — Design system Admin (parity FE)

| Hạng mục | Hướng dẫn |
|----------|-----------|
| Màu nền | `keyshop-bg`, `keyshop-soft`, `keyshop-surface` |
| Primary | `keyshop-blue` / `keyshop-green` cho CTA |
| Border | `keyshop-line` |
| Typography | Inter (giống FE `layout.tsx`) |
| Component | Ưu tiên `components/ui/*` shadcn — Button, Input, Label, Table, Dialog, Toast |
| Table admin | Sticky header, zebra nhẹ, action column icon buttons |
| Form | Label + validation message, submit loading |
| Empty state | Illustration + CTA khi list rỗng |
| Dark theme | Admin mặc định dark (giữ aesthetic hiện tại, chuẩn hóa bằng tokens) |

**Không port nguyên CSS file-by-file** — chuyển sang Tailwind utility + vài class component (`dashboard__card` → `rounded-2xl border border-keyshop-line bg-keyshop-surface`).

---

## Phase 4 — Backend bổ sung (phối hợp BE)

| Ưu tiên | API / việc | Phục vụ Admin UI |
|---------|------------|------------------|
| Cao | `GET /admin/users` (+ PATCH role) | Trang Users |
| Cao | `GET /admin/orders` (list all, filter) | Trang Orders — xác nhận quyền admin trên `GET /orders` |
| Trung bình | `GET /admin/analytics?range=30d` | Chart dashboard |
| Trung bình | Site settings / logo upload | Manage Logo |
| Thấp | Review moderation endpoints | Product reviews |
| Thấp | Export CSV products/orders | Nút Export |

---

## Thứ tự triển khai gợi ý

```
Tuần 1 — Nền tảng
  → Next.js scaffold + proxy API + auth admin + layout shell
  → Login thật + middleware ADMIN

Tuần 2 — Core CRUD
  → Dashboard (stats API)
  → Products list + form create/edit + upload ảnh
  → Categories

Tuần 3 — Vận hành
  → Orders list + update status
  → Banners + Blogs
  → Coupons

Tuần 4 — Hoàn thiện
  → Users (sau khi BE có API)
  → Polish UI, responsive, toast errors
  → npm run build + QA checklist
```

---

## Checklist QA sau migrate

```
[ ] Login admin — user thường bị từ chối
[ ] Refresh trang — session vẫn giữ (refresh token)
[ ] Dashboard hiển thị số liệu thật từ /admin/stats
[ ] CRUD product end-to-end (tạo → hiện trên FE storefront)
[ ] Upload ảnh banner/blog qua /admin/upload
[ ] Đổi order status — phản ánh trên account user
[ ] Sidebar mobile — mở/đóng, không kẹt scroll
[ ] Logout — clear session, redirect /auth/login
[ ] npm run build (BE :888 đang chạy) — pass
[ ] CORS: admin :3001 + FE :3000 cùng gọi BE :888
```

---

## File tham chiếu (copy pattern từ FE)

| File FE | Áp dụng cho Admin |
|---------|-------------------|
| `next.config.mjs` | Rewrites `/api`, images Cloudinary |
| `src/lib/api/client.ts` | Axios + JWT refresh |
| `src/constants/apiEndpoints.ts` | Thêm nhóm `admin` |
| `src/middleware.ts` | Matcher `(admin)` routes + check role |
| `tailwind.config.ts` | Tokens `keyshop-*` |
| `components.json` | shadcn aliases |
| `src/components/ui/*` | Copy button, input, dialog, table |
| `FE-HANDOFF.md` | Quy trình dev 2 terminal, env |

---

## Ghi chú kỹ thuật

| Chủ đề | Chi tiết |
|--------|----------|
| Tách app | Admin chạy app Next.js **riêng** port `3001`, không nhúng vào FE storefront |
| Auth dùng chung | Cùng `POST /auth/login` — phân quyền bằng `role` |
| Proxy | Client gọi `/api/admin/*` — Next rewrite → BE |
| Mock | Xóa sau Phase 2.2 — không commit mock vào production |
| MUI | Loại bỏ hoàn toàn để bundle nhẹ, UI thống nhất với FE |
| Brand | Thống nhất **KEYSHOP** (Login hiện ghi KeyStore, Header ghi SoftKey) |

---

## Backlog (không blocking migrate)

- [ ] i18n tiếng Việt cho admin labels
- [ ] Audit log (ai sửa product/order)
- [ ] Bulk actions (xóa nhiều SP)
- [ ] Keyboard shortcuts
- [ ] Role phân cấp (ADMIN vs STAFF) — nếu mở rộng
- [ ] E2E Playwright cho flow admin critical
