# 02 · ARCHITECTURE CONTEXT

> Baca saat: membuat file baru, menentukan di mana kode harus diletakkan, atau mereview PR.
> Ini adalah sumber kebenaran tunggal untuk struktur, pola kode, dan arsitektur aplikasi.
> System Type: Premium E-commerce Platform (Next.js 16 + Supabase)

---

## 1. Prinsip Arsitektur & Filosofi Core

1. **Feature-based, bukan type-based** — kode dikelompokkan per domain, bukan per jenis file.
2. **Server-first** — gunakan Server Component untuk SEO & performa utama, Client Component hanya di leaves (Interactive Islands).
3. **Unidirectional data flow** — data mengalir secara satu arah: User Action → Server Action → Service Layer → DB (Supabase) → Response.
4. **Thin routes, fat services** — routing dan layer actions hanya untuk auth/parsing data, **business logic selalu diletakkan di service**.
5. **Colocate everything** — test, types, schema diletakkan berdekatan dengan kode yang mendeskripsikan mereka.

---

## 2. STRICT DIRECTORY STRUCTURE

**AI INSTRUCTION:** Follow this structure exactly. Do not invent new top-level folders.

```
/
├── app/                              # Next.js App Router — ROUTING ONLY
│   ├── (public)/                     # Public marketing pages
│   ├── (shop)/                       # E-commerce flow (Shop, Product, Cart)
│   ├── (auth)/                       # Route group: layout tanpa sidebar
│   ├── admin/                        # Protected Admin Dashboard
│   ├── api/                          # Route Handlers (Webhooks, External)
│   ├── global.css                    # Tailwind v4 Imports & Theme
│   └── layout.tsx                    # Root Layout (Providers)
├── components/                       # KOMPONEN SHARED
│   ├── ui/                           # Dumb components (Button, Input). Sangat reusable.
│   ├── layout/                       # Headers, Footers, Sidebars
│   ├── features/                     # Smart Components (ProductCard, CartDrawer) - CONNECTED to logic
│   └── shared/                       # Pure dumb components (PageHeader) - DISCONNECTED from logic
├── features/                         # DOMAIN LOGIC — dikelompokkan per domain (bisa juga di dalam services)
├── lib/                              # Singleton & konfigurasi third-party
│   ├── utils.ts                      # Helper functions murni (cn, formatters)
│   ├── constants.ts                  # Config constants
│   └── hooks/                        # Global hooks (use-media-query)
├── services/                         # BUSINESS LOGIC LAYER
│   ├── database/                     # Data Access Layer / Eksekusi query DB
│   ├── auth/                         # Layanan Autentikasi
│   ├── products/                     # Layanan Produk (Fetching, stock checks)
│   └── whatsapp/                     # Layanan formatting dan logik WhatsApp
├── types/                            # Global TypeScript Definitions
│   └── database.types.ts             # Supabase Generated Types
└── supabase/                         # Migrations & DB Config
```

### Aturan Import

```
✅ BOLEH:
  app/        → import dari features/, components/, lib/, services/
  services/   → import dari lib/, types/
  components/ → import dari lib/, hooks/

❌ DILARANG:
  services/A  → import dari services/B (circular dependency, gunakan event/callback jika butuh coupling)
  lib/        → import dari features/ atau services/ (lib harus murni agnostik)
  components/ui → import dari features/ atau services/ (UI atom harus murni komponen presentasional)
```

---

## 3. CORE DATA MODELS (The Source of Truth)

**AI INSTRUCTION:** Use these exact field names. Do not hallucinate fields.

1. **`users` (profiles):**
   - `id` (uuid, PK), `email`, `full_name`, `avatar_url`, `role` ('admin' | 'customer').
2. **`products`:**
   - `id` (uuid), `slug` (unique), `name` (Full name), `baseName`, `sku`, `color`, `price` (int), `sale_price` (nullable), `stock` (int), `images` (text[]), `category_id`, `is_active`, `description`.
3. **`categories`:**
   - `id`, `name`, `slug`, `image_url`.
4. **`orders` & `order_items`:**
   - `orders`: `id` (uuid), `user_id` (nullable for guest), `customer_name`, `customer_phone`, `status` ('pending_inquiry', 'confirmed', 'shipped'), `total_amount`, `whatsapp_link`, `shipping_address`, `awb_number`.
   - `order_items`: `id`, `order_id`, `product_id`, `quantity`, `price_at_time`.

---

## 4. POLA PER LAYER (Strictly Enforced)

Menjaga arsitektur tetap bersih untuk proses scale dan maintainability yang prima. Kita sangat menghindari fungsi koneksi langsung (`supabase.from()`) di dalam komponen UI.

### Layer 1: Schema Validator (`schemas.ts`)

Semua input harus divalidasi dengan **Zod**.

```typescript
import { z } from "zod";
export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});
```

### Layer 2: Data Access Layer (DAL / `services/database/`)

Hanya berisi query eksekusi ke DB (Supabase). Tidak ada validasi logic bisnis di sini.

```typescript
// services/database/product.repository.ts
export const productQueries = {
  findById: (id: string) =>
    supabase.from("products").select().eq("id", id).single(),
};
```

### Layer 3: Service Layer (Business Logic / `services/`)

"Otak" sesungguhnya tempat validasi rule dan orkestrasi berpusat. Mengakses file DAL, untuk menghindari akses Supabase direct di sembarang tempat.

```typescript
// services/products/product.service.ts
export const productService = {
  async checkout(input: CheckoutInput) {
    // 1. Stock Check (Validasi Rule)
    // 2. Create Order (Orkestrasi DB via DAL)
    // 3. Generate Link WA (Orkestrasi Sistem)
  },
};
```

### Layer 4: Action Layer (`actions.ts` / Server Actions)

Jembatan tipis sebagai middleware antara Client Component dan Logic Service. Bertanggung jawab mengecek sesi, input parse (Zod), hit service, dan revalidate path caching Next.js.

```typescript
"use server";
export async function createProductAction(formData: FormData) {
  // 1. Auth check
  // 2. Parsed validasi input via Zod
  // 3. Hit productService
  // 4. revalidatePath
}
```

### Layer 5: Data Fetching Component (di Server Page Components)

Ambil data di render server tanpa API round-trip dengan memanggil servis (ReadOnly).

```typescript
// app/admin/products/page.tsx
export default async function ProductsPage() {
  const products = await productService.getAll()
  return <ProductList products={products} />
}
```

---

## 5. STATE MANAGEMENT STRATEGY (HYBRID)

1. **URL State (Priority #1 - "Gunakan agar bisa dishare"):**
   - **Library:** `nuqs` (Type-safe Search Params).
   - **Penggunaan:** Filters warna, Price Range, Pagination, Sorting, Search Queries.
   - **Rule:** Ketika browser di-reload, user harus melihat urutan state UI filter yang persis sama.
2. **Server State (Caching & Revalidation):**
   - **Library:** React Server Components & fitur `fetch` native Next.js. Cache Revalidation.
   - **Penggunaan:** Query ketersediaan stok produk, fetching base data user.
3. **Global Client State:**
   - **Library:** React Context (atau Zustand saat benar-benar kompleks saja).
   - **Penggunaan:** State keranjang kasual (`CartProvider`), Session Auth sementara, Toast UI. Hanya ditujukan untuk partisi UI client yang ringan dan ephemeral state.

---

## 6. TECH INTEGRATIONS & CORE FLOWS

### Checkout Flow (Hybrid WhatsApp)

Sistem MOEMA bersifat _High-touch closing_. Transaksi tidak langsung payment-gateway.

1. **User Action:** User populate item pada Cart -> Tekan "Checkout via WhatsApp".
2. **Logic Server:**
   - Validasi Stok dan kalkulasi Harga Asli on-server.
   - Catat `Order` ke tabel Supabase (status `PENDING_INQUIRY`). Analitik diutamakan meski tidak jadi convert.
   - Merancang URL format Pesan WhatsApp (`wa.me/?text=...`) dari details order tersebut.
3. **Client-side End:** Bersihkan status Cart lokal lalu open tab re-direct ke App WhatsApp.

### Database & Auth

- **Supabase (PostgreSQL):** Fitur pencegahan RLS (Row Level Security) WAJIB diapply. Gunakan inisialisasi client `ANON_KEY` untuk level read. Hanya pergunakan varian `SERVICE_ROLE_KEY` jika action via background server wajib melakukan by-pass access RLS - pergunakan dengan _sangat hati-hati_.
- **NextAuth.js (v5 / Auth.js):** Aktif dipergunakan pada login path Admin (`CredentialsProvider`). Route protector pada root `/admin` dihandle middleware integrasi `auth.config.ts`.

### Media & File Storage

- **Supabase Storage:** Asset berada pada publik bucket (e.g. `products`, `avatars`).
- **Aliran Upload:** Harus ada tahapan kompresi sebelum push network (library rekomendasi: `browser-image-compression`, kapabilitas file max 500KB WebP) diikuti hit Signed URL / Server Action.

### Error Handling

Struktur handling wajib membungkus block spesifik pada Boundary yang sesuai:

- Ekstensi `AppError` secara custom. Handle di Server / API.
- Re-direct notifikasi interaktif via Toast (Asynchronous operations).

---

## 7. TAILWIND 4 CONVENTIONS & STYLING

### `globals.css`

Aplikasi memakai sintaks Tailwind 4 modern.

```css
@import "tailwindcss";

@theme {
  /* Design tokens — didefinisikan secara HSL/OKLCH sebagai base token */
  --color-brand-50: oklch(97% 0.02 250);
  --color-brand-600: oklch(48% 0.22 250);
  --font-sans: "Inter Variable", sans-serif;
}

@layer components {
  /* Di-apply exsklusif untuk patterns structural > 3x, selebihnya utility directly */
  .card {
    @apply rounded-lg border border-zinc-200 bg-white p-4 shadow-sm;
  }
}
```

Untuk Button/Atomic komponen: Wajib standarisasi format **CVA (class-variance-authority)**, kemudian disambung dengan helper native `cn()` lib (gabungan `clsx` + `tailwind-merge`).

---

## 8. NAMING CONVENTIONS

| Komponen Type                  | Convention Case          | Contoh Target                             |
| ------------------------------ | ------------------------ | ----------------------------------------- |
| File React Komponen            | PascalCase               | `ProductCard.tsx` atau `UserTable.tsx`    |
| File fungsi / non-komponen     | kebab-case               | `product-service.ts`, `database.types.ts` |
| Letak Hierarki / Folder        | kebab-case               | `services/database/user-queries/`         |
| File Hooks                     | camelCase + `use` prefix | `useCart`, `useDeviceDetection`           |
| Fungsional API / Server Action | camelCase + `Action`     | `createOrderAction`                       |
| Skema Zod (Validation)         | camelCase + `Schema`     | `checkoutSchema`                          |
| Interface Tipe Data (Types/TS) | PascalCase               | `Product`, `CreateOrderInput`             |
| File Environment Variabels     | SCREAMING_SNAKE_CASE     | `NEXT_PUBLIC_SUPABASE_URL`                |

---

## 9. SERVER VS CLIENT COMPONENT DECISION (ATURAN BAKU)

```
Kapan memerlukan 'use client' tag di React?
1. Apakah butuh `useState` / `useEffect` secara dinamis?       → YA = 'use client'
2. Terdapat handle events onClick, onChange form lokal?         → YA = 'use client'
3. Akses local API milik browser seperti localStorage, window?  → YA = 'use client'

Ke-tiga kondisi di atas sama sekali TIDAK diperlukan?           → SERVER COMPONENT (default)
```

_Trik Skalabilitas:_ Dorong tag identifier `'use client'` agar diletakkan di sub-komponen _titik terendah / ujung (leaf nodes)_ sebisa mungkin, sehingga parent tree anda tetap valid sebagai server component!

---

## 10. ANTI-PATTERNS (JANGAN DILAKUKAN)

- ❌ **Menyatukan logic kompleks langsung pada Server Action:** Eksekusi query logic harus di delegasi ke layer Service. Controller action hanya pemanggil / handler interface middleware.
- ❌ **Melakukan fetch Next.js via `/api/` khusus ke diri-sendiri:** Daripada me-route dan fetch network loop `/api/users` jika hanya sekadar meload halaman client, baiknya muat fungsi fetch-nya sebagai Server Component dan oper datanya serah terima by Props Down ke hirarki Client Element bersangkutan.
- ❌ **Bertoleransi dengan Tipe Data `any`:** Selalu deklarasikan TypeScript eksplisit (Atau manfaatkan Gen-Type skema Supabase otomatis).
- ❌ **Terkontaminasi Magic Numbers & Inline Styling Native:** Dilarang meletakkan `<div style={{ marginTop: '15px' }}>`. Konsiten gunakan CSS konfig Tailwind utility.
