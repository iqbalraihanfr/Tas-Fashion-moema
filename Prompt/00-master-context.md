# 00 · MASTER CONTEXT

> Baca file ini terlebih dahulu sebelum menambah fitur, refactor, atau review implementasi.
> File ini adalah source of truth proyek, bukan template generik.

---

## 1. Identitas Proyek

| Key | Value |
| --- | --- |
| Nama aplikasi | `MOEMA` |
| Branding | `MOEMA Fashion Bags` / `MOEMA Collection` |
| Tipe aplikasi | Full-stack fashion e-commerce dengan admin panel custom |
| Domain utama | `moemacollection.com` |
| Stage | MVP yang sudah berjalan |
| Audience | Pelanggan retail dan admin internal |

---

## 2. Core Stack

```txt
Frontend    : Next.js 16 App Router + TypeScript strict
Styling     : Tailwind CSS v4 + shadcn/ui
URL state   : nuqs
Server state: TanStack Query
UI state    : React Context
Database    : Supabase Postgres
Storage     : Supabase Storage
Auth        : NextAuth.js v5 beta (Credentials for admin only)
Validation  : Zod + React Hook Form
Testing     : Vitest + React Testing Library + Playwright
```

### Rules

- Jangan tambah dependency baru tanpa diskusi.
- Jangan ganti framework, auth provider, atau database tanpa keputusan eksplisit.
- Hindari refactor folder besar-besaran jika perubahan bisa dilakukan incremental.

---

## 3. Keputusan Penting

| Keputusan | Alasan |
| --- | --- |
| Bucket produk memakai `product-images`, bukan `products` | Memisahkan aset produk dari aset lain dan memudahkan policy/operational limit per bucket |
| Upload produk memakai hybrid pipeline: preprocess ringan di client, normalisasi final di server dengan `sharp` | Admin UX tetap nyaman saat preview/crop, tetapi output final tetap konsisten, tajam, dan selalu WebP |
| Domain UI lama tetap berada di `components/admin` dan `components/product` | Menghindari refactor struktural besar yang belum memberi value langsung |
| `features/` dipakai secara selektif untuk area baru atau provider domain tertentu | Arah arsitektur tetap feature-based, tetapi migrasi dilakukan bertahap |
| Semua mutasi admin wajib dicek lagi lewat `auth()` di server action | Middleware saja tidak cukup untuk melindungi mutation endpoint |

---

## 4. Data Flow Aktual

### Read Path

```txt
Server Component / Page
→ repository di services/database/*
→ Supabase
→ props ke component
```

### Write Path

```txt
Form submit
→ Server Action (lib/actions.ts / lib/admin-actions.ts)
→ Zod validation
→ service layer
→ repository / storage
→ Supabase
```

### Auth Flow

```txt
/admin/login
→ NextAuth Credentials
→ cek AdminUser di Supabase
→ session cookie
→ middleware protect /admin/dashboard/*
→ server action tetap verify session via auth()
```

---

## 5. Struktur Proyek Aktual

```txt
app/
├── (customer)/                 Public storefront, catalog, cart, checkout
├── admin/                      Login + dashboard admin
└── components-showcase/        Halaman showcase komponen

components/
├── ui/                         Primitive shadcn/ui
├── layout/                     Navbar, footer, cart sheet, cookie consent
├── admin/                      Domain UI admin yang sudah ada
├── product/                    Domain UI storefront/catalog yang sudah ada
└── providers/                  Query provider, dsb.

context/
└── cart-context.tsx            Global cart UI state

features/
└── products/ProductNavProvider.tsx

lib/
├── actions.ts                  Public/server actions umum
├── admin-actions.ts            Admin mutations
├── image-utils.ts              Client-side image preprocess helper
├── sharp-compress.ts           Final image normalization di server
├── supabase.ts                 Public + admin Supabase clients
└── errors.ts                   AppError

services/
├── database/                   DAL / repository Supabase
├── product.service.ts          Business logic produk
├── order.service.ts            Business logic order
├── showcase.service.ts         Business logic showcase
└── storage.service.ts          Upload/delete image di storage
```

### Catatan

- Ini adalah struktur aktual yang harus dihormati saat mengedit area yang sudah ada.
- Jika membuat modul domain baru yang benar-benar terisolasi, `features/{domain}` tetap preferred.
- Jangan melakukan pemindahan file lintas folder hanya demi “rapi” jika tidak dibutuhkan oleh task.

---

## 6. Storage & Image Pipeline

### Product Images

- Bucket: `product-images`
- Path: `products/{baseName}/{baseName}-{color}-{number}.webp`
- Client-side: crop/resize/preprocess ringan untuk UX admin
- Server-side: kompresi final dan normalisasi ke WebP memakai `sharp`
- Target output: kecil tetapi tetap tajam; angka operasional saat ini sekitar `~200KB`, tidak wajib kaku `150KB`

### Prinsip

- Fokus pada kualitas visual katalog premium.
- Upload input boleh lebih besar, tetapi hasil final harus konsisten.
- Service role key hanya dipakai di server.

---

## 7. Error Handling Rules

- Gunakan `AppError(message, statusCode, code)` untuk service/repository error.
- Server action harus menangkap error internal dan mengembalikan payload ringkas ke UI.
- Jangan menampilkan detail Supabase/Postgres ke user.
- Client UI tidak boleh gagal diam-diam; tampilkan inline error atau state yang jelas.

---

## 8. Environment Variables

Semua env var harus tercantum di `.env.example`.

| Variable | Scope | Kegunaan |
| --- | --- | --- |
| `AUTH_SECRET` | server | Secret NextAuth |
| `NEXT_PUBLIC_APP_URL` | client/server | Base URL untuk metadata dan URL absolut |
| `NEXT_PUBLIC_SUPABASE_URL` | client/server | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server | Public anon key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Admin/storage/repository mutator |

---

## 9. Current Implementation Guidance

- Untuk admin mutations, edit `lib/admin-actions.ts`.
- Untuk public order/auth actions, edit `lib/actions.ts`.
- Untuk query ke database, mulai dari `services/database/*`.
- Untuk business logic, taruh di `services/*.service.ts`.
- Untuk UI storefront lama, lanjutkan pola di `components/product/*`.
- Untuk UI admin lama, lanjutkan pola di `components/admin/*`.

---

## 10. Context Map

| File | Status | Kegunaan |
| --- | --- | --- |
| `00-master-context.md` | aktual | Source of truth proyek |
| `01-product-context.md` | referensi domain | Produk, halaman, dan kebutuhan bisnis |
| `02-architecture-context.md` | aktual | Struktur dan placement rules yang benar untuk repo ini |
| `03-security-context.md` | aktual | Auth, secrets, dan security rules yang berlaku |
| `05-testing-qa-context-template.md` | template referensi | Dipakai saat perlu menyusun strategi QA |
| `06-seo-tech-context.md` | referensi implementasi | Metadata, sitemap, structured data |
| `07-content-context-template.md` | template referensi | Tone, content workflow |
| `08-devops-context-template.md` | template referensi | CI/CD dan deployment checklist |
| `09-pre-launch-checklist-prompt.md` | checklist referensi | Final QA sebelum launch |

---

## 11. Working Rule for AI / Contributor

1. Cek file ini lebih dulu.
2. Jika task menyentuh struktur kode, baca `02-architecture-context.md`.
3. Jika task menyentuh auth, env, action, atau data sensitif, baca `03-security-context.md`.
4. Jika template referensi bertentangan dengan implementasi aktual, ikuti implementasi aktual atau usulkan perubahan hanya jika ada alasan engineering yang kuat.
