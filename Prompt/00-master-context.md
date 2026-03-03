# 00 · MASTER CONTEXT

> Baca file ini PERTAMA KALI sebelum melakukan apapun.
> File ini adalah orchestrator — pointer ke semua konteks yang kamu butuhkan.

---

## Identitas Proyek

| Key                   | Value                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Nama Aplikasi**     | `MOEMA` — branding: `MOEMA Fashion Bags`                                                                              |
| **Deskripsi Singkat** | Premium Fashion E-commerce Platform (Terinspirasi oleh PEDRO & Charles & Keith) dengan katalog tas fashion eksklusif. |
| **Tipe Aplikasi**     | Full-stack Web App — Supabase sebagai database + Storage, custom admin panel di `/admin`                              |
| **Target User**       | Pelanggan retail e-commerce premium & Admin platform                                                                  |
| **Stage**             | MVP — Manajemen produk dengan kompresi gambar (WebP) & dashboard admin, public storefront                             |
| **Pemilik**           | Iqbal Raihan                                                                                                          |

---

## Tech Stack (CORE STACK)

```
Frontend    : Next.js 16 (App Router) + TypeScript Strict Mode
Styling     : Tailwind CSS v4 + Shadcn UI
State (URL) : nuqs (Type-safe search params - Priority #1)
State (API) : TanStack Query (Server State)
State (UI)  : React Context (Hanya untuk non-shareable global UI)
Database    : Supabase (PostgreSQL) + Supabase Storage (Gambar produk)
Auth        : NextAuth.js (v5 Beta) — Credentials provider untuk Admin
Validation  : Zod + React Hook Form
Testing     : Vitest + React Testing Library + Playwright (E2E)
```

> ⚠️ Jangan tambahkan dependency baru tanpa diskusi (khususnya untuk state management).

---

## Struktur Folder & Pola Architektur Aktual

```
app/
├── (public)/              — Routes publik pelanggan
│   ├── page.tsx           — Homepage / Storefront
│   └── product/           — Detail produk
├── admin/                 — Routes Admin (Protected)
│   ├── login/             — NextAuth email/password login
│   └── dashboard/         — Layout dashboard, butuh session
│       ├── page.tsx       — Admin stats
│       └── products/      — Manajemen CRUD produk + Image Upload
components/
├── ui/                    — Shadcn UI components (Dilarang reinvent the wheel)
├── admin/                 — Client components untuk admin (mis. ProductsTable)
└── shared/                — Komponen reusable antar public / admin
lib/
├── image-utils.ts         — Client-side image compression (browser-image-compression ke WebP)
├── prisma.ts / db.ts      — Supabase client config (jika pakai Prisma/Drizzle/Supabase-js)
└── type.ts                — Deklarasi global type (Product, AdminUser)
services/
├── product.service.ts     — Logika upload/database terkait produk
└── storage.service.ts     — Abstraksi Supabase storage ('products/' bucket)
scripts/
├── seed-admin.ts          — Hashing password via bcryptjs ke Supabase
└── seed-products.ts       — Migrasi bulk data product (CSV to Supabase)
supabase/
└── migrations/            — RLS policies, indexing, table schema
```

---

## Supabase Architecture & Storage

### Schema Inti (Postgres)

- **Product**: `id`, `name`, `baseName`, `slug`, `sku`, `color`, `dimensions`, `description`, `price`, `stock`, `images` (array of text URL).
- **AdminUser**: `id`, `email`, `passwordHash`.

### Storage (Bucket: `products`)

File disimpan dengan format terstruktur: `products/{baseName}/{baseName}-{color}-{number}.webp`
Upload wajib di-compress ke WebP menggunakan `browser-image-compression` secara client-side sebelum dikirim ke Supabase dengan ukuran maksimal +- 150KB.

---

## MASTER CODING CONVENTIONS (The "Murphy's Law" Protocol)

_Sebagai AI, kamu berperan sebagai Principal Software Architect & Engineering Lead._

### 1. Hostile Environment Assumption

- **The Potato Device:** Asumsikan user memakai HP lambat (Cegah memory leak, jangan block main-thread).
- **The Flaky Network:** Asumsikan inet putus-nyambung (Selalu pasang error handling & disable tombol).
- **The Hyperactive User:** Asumsikan user spam klik (Cegah race conditions).

### 2. Aturan Dasar (Selalu Berlaku)

1. **TypeScript Strict** — Tidak ada `any`. Gunakan `unknown` atau define type dengan benar.
2. **Tailwind v4** — **DILARANG** menggunakan `tailwind.config.js`. Gunakan `app/globals.css` dengan arahan `@theme`.
3. **No File System Storage** — Vercel = ephemeral. DILARANG pakai `fs.writeFileSync` ke public/. SELALU gunakan Supabase Storage.
4. **No Raw Mock Data di Prod** — Jangan hardcode mock array di server component akhir.
5. **URL State First** — Untuk paginasi/search filter kompleks, WAJIB gunakan `nuqs`. JANGAN pakai standard `useSearchParams` jika state kompleks.

### 3. Error Handling & Safety

1. **Trust No One:** Validasi input, Payload data, Params secara Runtime pakai **Zod**.
2. **AppError:** Gunakan custom class `AppError(message, statusCode, code)` daripada throw string asal.
3. **No Silent Failures:** Dilarang pakai `try { ... } catch (e) { console.log(e) }` di client tanpa memberitahu user (Toast/Inline UI error wajib hadir).
4. **Server Actions:** Tangkap error di dalam server action dan return `{ error: string }` ke React hook (`useActionState` / `useTransition`).

---

## INSTRUCTION FOR AI RESPONSE (The Workflow)

Saat diminta tambahan fitur/solusi:

1. **Analyze:** Cek `00-master-context` (file ini) untuk batas tumpukan teknologi dan struktur.
2. **Plan:** (Internal thought) Pikirkan integrasi design adaptive & logic yang efisien.
3. **Execute:** Berikan **KODE LENGKAP**.
   - ⚠️ DILARANG MENGGUNAKAN `// ... rest of the code`.
   - ⚠️ DILARANG memberi basa-basi seperti "Here is the code" atau resume setelah kode selesai. Cukup berikan file path dan block kode!
4. **Definition of Done (DoD):** Kode tanpa bug TS, styling sesuai komponen Shadcn yang ada, logic ter-handle.

---

## Cara Bekerja dengan Master Prompt Ini

### Setup prompt yang efektif:

```
Baca 00-master-context.md.
[Tambahkan konteks/file yang akan diubah]
Tugas: Buatkan komponen X dengan spesifikasi Y.
```

Konteks ini memastikan UI/UX premium namun codebase tetap bersih, tiped secara ketat, dan siap production.
