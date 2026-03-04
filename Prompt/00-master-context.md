# 00 · MASTER CONTEXT

> Baca file ini PERTAMA KALI sebelum melakukan apapun.
> File ini adalah orchestrator — pointer ke semua konteks yang kamu butuhkan.

---

## 1. IDENTITAS PROYEK

| Key                   | Value                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Nama Aplikasi**     | `MOEMA` — branding: `MOEMA Fashion Bags`                                                                              |
| **Deskripsi Singkat** | Premium Fashion E-commerce Platform (Terinspirasi oleh PEDRO & Charles & Keith) dengan katalog tas fashion eksklusif. |
| **Tipe Aplikasi**     | Full-stack Web App — Supabase sebagai database + Storage, custom admin panel di `/admin`                              |
| **Target User**       | Pelanggan retail e-commerce premium & Admin platform                                                                  |
| **Stage**             | MVP — Manajemen produk dengan kompresi gambar (WebP) & dashboard admin, public storefront                             |
| **Domain / URL**      | `[CUSTOMIZE]`                                                                                                         |
| **Author**            | Iqbal Raihan                                                                                                          |
| **Contact / Links**   | `[CUSTOMIZE]` — email, GitHub, LinkedIn, dll.                                                                         |

---

## 2. TECH STACK (CORE STACK)

> **AI RULE:** Jangan tambahkan dependency baru tanpa diskusi eksplisit dengan developer.

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

### Dependency Rules

- ❌ Jangan tambah dependency baru tanpa diskusi
- ❌ Jangan suggest migrasi database, auth, atau framework
- ❌ Jangan buat folder top-level baru di luar yang sudah didefinisikan di `02-architecture-context.md`
- ✅ Boleh suggest improvement dalam batasan stack yang sudah ada

---

## 3. CONVENTIONS

| Aspek                          | Aturan                                     | Contoh                                      |
| ------------------------------ | ------------------------------------------ | ------------------------------------------- |
| Code comments                  | `[CUSTOMIZE]` — EN / ID / bilingual        | `// Validate before save`                   |
| Commit message                 | `[CUSTOMIZE]` — conventional commits, dll. | `feat(notes): add slug generation`          |
| Branch naming                  | `[CUSTOMIZE]`                              | `feat/add-note-editor`, `fix/auth-redirect` |
| Error messages (user-facing)   | `[CUSTOMIZE]` — EN / ID / bilingual        | `"Email tidak valid"`                       |
| Error messages (developer/log) | `[CUSTOMIZE]`                              | `"Failed to fetch user"`                    |
| Env variable naming            | SCREAMING_SNAKE_CASE                       | `DATABASE_URL`                              |

> Untuk naming conventions kode (file, komponen, fungsi): lihat `02-architecture-context.md` Section Naming Conventions.

---

## 4. DECISIONS LOG

> Catat keputusan arsitektur penting di sini.
> Format: Keputusan → Alasan → Alternatif yang dipertimbangkan.
> Ini bukan changelog — hanya keputusan yang **MENGAPA**, bukan APA.
>
> **AI RULE:** Jangan suggest perubahan yang bertentangan dengan keputusan di tabel ini tanpa konfirmasi eksplisit.

| Keputusan     | Alasan        | Alternatif Ditolak |
| ------------- | ------------- | ------------------ |
| `[CUSTOMIZE]` | `[CUSTOMIZE]` | `[CUSTOMIZE]`      |

---

## 5. DATA FLOW

> Gambarkan jalur data utama di aplikasi ini.
> **AI RULE:** Gunakan pattern ini saat menentukan di mana logic harus ditaruh.

### Read Path (user melihat data)

```
[CUSTOMIZE — contoh:]
Server Component → service → query → DB → return ke component
```

### Write Path (user mengubah data)

```
[CUSTOMIZE — contoh:]
Form submit → Server Action → schema validation → service → query → DB
```

### Auth Flow

```
[CUSTOMIZE — contoh:]
Login form → auth provider → set session/cookie → redirect
```

> Detail implementasi per layer: lihat `02-architecture-context.md` Section Pola Per Layer.
> Detail security & auth: lihat `03-security-context.md`.

---

## 6. STRUKTUR FOLDER & ARSITEKTUR AKTUAL

> Update tree ini setiap kali ada perubahan struktur signifikan.
> Untuk pattern dan aturan penempatan file: lihat `02-architecture-context.md`.

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

## 7. SUPABASE ARCHITECTURE & STORAGE

### Schema Inti (Postgres)

- **Product**: `id`, `name`, `baseName`, `slug`, `sku`, `color`, `dimensions`, `description`, `price`, `stock`, `images` (array of text URL).
- **AdminUser**: `id`, `email`, `passwordHash`.

### Storage (Bucket: `products`)

File disimpan dengan format terstruktur: `products/{baseName}/{baseName}-{color}-{number}.webp`
Upload wajib di-compress ke WebP menggunakan `browser-image-compression` secara client-side sebelum dikirim ke Supabase dengan ukuran maksimal +- 150KB.

---

## 8. DESIGN SYSTEM

> Definisikan tokens utama di `globals.css` sebagai CSS custom properties.
> Detail lengkap styling conventions: lihat `02-architecture-context.md` Section Tailwind Conventions.

### Color Tokens

| Token         | Value         | Usage         |
| ------------- | ------------- | ------------- |
| `[CUSTOMIZE]` | `[CUSTOMIZE]` | `[CUSTOMIZE]` |

### Font Tokens

| Tailwind Class | Font          | Usage                                          |
| -------------- | ------------- | ---------------------------------------------- |
| `[CUSTOMIZE]`  | `[CUSTOMIZE]` | `[CUSTOMIZE]` — heading / body / accent / mono |

---

## 9. MASTER CODING CONVENTIONS (The "Murphy's Law" Protocol)

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

## 10. ENVIRONMENT & DEPLOYMENT

### Environment Variables

> **AI RULE:** Jangan hardcode value. Jangan invent env var baru tanpa menambahkannya di sini dan di `.env.example`.

| Variable      | Scope           | Deskripsi     |
| ------------- | --------------- | ------------- |
| `[CUSTOMIZE]` | server / client | `[CUSTOMIZE]` |

> **Konvensi:**
>
> - Client-accessible: prefix `NEXT_PUBLIC_`
> - Server-only: tanpa prefix — JANGAN expose ke client
> - Semua env var harus terdaftar di tabel ini dan di `.env.example`

### Deployment

| Key                     | Value               |
| ----------------------- | ------------------- |
| **Platform**            | Vercel              |
| **Branch strategy**     | `main` = production |
| **Build command**       | `npm run build`     |
| **Preview URL pattern** | `[CUSTOMIZE]`       |

> Detail CI/CD pipeline: lihat `08-devops-context.md`.

---

## 11. STRUKTUR CONTEXT FILES

> **AI RULE:** Ketika kamu menemukan topik yang overlap dengan context file lain,
> sebutkan file mana yang harus dibaca untuk detail lengkap.
> Jangan assume informasi di satu file sudah cukup jika tabel di bawah menunjukkan
> ada file lain yang lebih spesifik untuk topik tersebut.

| File                         | Scope                                     | Baca Saat                       |
| ---------------------------- | ----------------------------------------- | ------------------------------- |
| `00-master-context.md`       | Overview, data flow, identity             | Selalu, di awal — **wajib**     |
| `01-product-context.md`      | Halaman, fitur, content structure         | Saat tambah halaman/fitur baru  |
| `02-architecture-context.md` | Folder structure, pola kode, import rules | Saat buat/edit file apapun      |
| `03-security-context.md`     | Auth, authorization, data protection      | Saat edit auth/middleware/role  |
| `04-sre-perf-context.md`     | Caching, performance, monitoring          | Saat optimasi performa          |
| `05-testing-qa-context.md`   | Test strategy, coverage, CI               | Saat menulis/review test        |
| `06-seo-tech-context.md`     | Metadata, sitemap, structured data        | Saat edit metadata/SEO          |
| `07-content-context.md`      | Copywriting, tone, voice                  | Saat tulis/edit copy UI         |
| `08-devops-context.md`       | CI/CD, env management, deployment         | Saat deploy atau setup pipeline |

---

## 12. INSTRUCTION FOR AI RESPONSE (The Workflow)

Saat diminta tambahan fitur/solusi:

1. **Analyze:** Cek `00-master-context.md` (file ini) untuk batas tumpukan teknologi dan struktur. Pahami juga context files lain yang sesuai scope jika diperlukan.
2. **Plan:** (Internal thought) Pikirkan integrasi design adaptive & logic yang efisien. Ikuti data flow dari section "DATA FLOW" di `00-master-context.md`.
3. **Execute:** Berikan **KODE LENGKAP**.
   - ⚠️ DILARANG MENGGUNAKAN `// ... rest of the code`.
   - ⚠️ DILARANG memberi basa-basi seperti "Here is the code" atau resume setelah kode selesai. Cukup berikan file path dan block kode!
4. **Definition of Done (DoD):** Kode tanpa bug TS, styling sesuai komponen (Shadcn/UI), logic ter-handle, environment termanage, aman, testable.

### Setup prompt yang efektif:

```
Baca 00-master-context.md.
[Tambahkan context file yang relevan — lihat tabel di Section 11]
[Tambahkan konteks/file yang akan diubah]
Tugas: Buatkan komponen X dengan spesifikasi Y.
```

Konteks ini memastikan UI/UX premium namun codebase tetap bersih, tiped secara ketat, dan siap production.
