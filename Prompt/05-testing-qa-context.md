# 05 · TESTING, QA, & OPS CONTEXT

> Baca saat: menyiapkan test, setup CI/CD, review performa SEO/A11y, dan konfigurasi logging.
> Gabungan panduan Testing, Performance, Security, dan SEO Teknis spesifik untuk MOEMA.

---

## 1. STRATEGI TESTING (PRAGMATIC)

Analogi: Test adalah **jaring pengaman** sirkus. Akrobat tetap perlu latihan (kode yang baik), tapi jaring ada untuk menangkap ketika sesuatu yang tidak terduga terjadi.
**Filosofi:** Validation over Coverage. Kita menulis test agar bisa tidur tenang tanpa regresi parah, bukan sekadar memuaskan metrik percentage code-coverage.

### Testing Pyramid

```text
          ▲
         /E2E\          (Sedikit) Playwright - Flow kritis user (Checkout WA, Pencarian, Login)
        /─────\
       / Integ \        (Sedang) Vitest - Hit Action + Service + hit local test DB Supabase
      /─────────\
     /   Unit    \      (Banyak) Vitest - Cepat, mock DB, pure business logic
    /_____________\
```

### Apa yang perlu di-Test:

1. **Unit / Integration (Vitest):** Fokus utama diletakkan di layer `services/`.
   - Menghitung total harga dan mengaplikasikan Diskon/Promo dengan benar.
   - Mencegah Checkout ke WhatsApp apabila `Stock < Request`.
   - Validasi data layer menggunakan `Zod`.
2. **E2E (Playwright):** Fokus ke Critical Paths murni dari perspektif User di browser.
   - Flow _Guest Checkout_: User Buka Home → Klik Produk di grid → Add to Cart → Klik Checkout → Verifikasi skrip Link WhatsApp berhasil digenerate otomatis.
   - Flow _Search Catalog_: User mengetik nama seri tas (misal: "moema") → Verifikasi hasil loading list produk dengan nama tersebut eksis di viewport.

### Apa yang harus di-SKIP:

- **Unit Testing komponen UI React:** Jangan habiskan effort mengetes "apakah button ini render CSS rounded-lg biru". Lakukan hal ini murni secara visual QA (manual testing visual).
- **Snapshot Testing DOM:** Hindari, terlalu sering rusak (brittle) pada project iterasi desain e-commerce.

---

## 2. PANDUAN INTEGRASI TEST & MOCKING

### Setup Helper & Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["services/**", "lib/**"],
      exclude: ["components/**", "app/**"], // Pure UI diabaikan dalam Vitest Coverage
    },
  },
});
```

### Mocking Business Logic (Supabase DAL)

Karena Supabase SDK membungkus data network request secara remote, test Unit _service layer_ diwajibkan untuk mem-mock repository databasenya:

```typescript
import { describe, it, expect, vi } from "vitest";
import { productService } from "./product.service";

describe("productService.checkout", () => {
  it("seharusnya gagal melanjutkan dan throw AppError saat stok tas 0", async () => {
    // Inject Mock repository
    vi.mocked(productRepository.getProductById).mockResolvedValue({ stock: 0 });

    await expect(
      productService.checkoutToWhatsApp({ productId: "p-1", qty: 1 }),
    ).rejects.toThrow("Stok item tas ini sedang tidak tersedia.");
  });
});
```

---

## 3. TECHNICAL SEO & METADATA

**Goal:** Menempati Rank #1 indexing Google Search terkait keywords tas lokal dan memunculkan Rich Snippets Produk di list pencarian.

- **Metadata Global Setup:** Definisikan native string `title.template` app/layout.tsx (Contoh: `%s | MOEMA - Premium Luxury Bags`).
- **Dynamic Product Pages (PDP):**
  - Fungsional `generateMetadata()` mem-fetch secara cached entity detail produk pada route handler.
  - Membawa `title` nama tipe tas, `description` rangkuman singkat dari content, dan wajib nge-mount properti `openGraph.images` original picture tas ukuran high-res.
- **Structured Data (JSON-LD) - WAJIB:**
  - Sisipkan tag elemen `<script type="application/ld+json">` pada Halaman Detail Produk (`page.tsx`).
  - Harus berisi Schema Standard `Product` & `BreadcrumbList`.
  - Attribut kunci: string `name`, array link `image`, block object `offers` (`priceCurrency: IDR`, `price` dalam bentuk Number murni tanpa RP, dan `availability: https://schema.org/InStock`). Ini agar badge 'Rp X.XXX' dan 'In stock' mejeng di depan Google langsung.

---

## 4. PERFORMANCE & WEB VITALS (SPA-LIKE LUXURY FEEL)

**UX Metrics:** Poin ukur LCP (Largest Contentful Paint) tidak lebih dari 2.5s. Rendering navigasi web harus merasa se-"Instant" possible tapi tak mengorbankan indeks Search Engine.

- **Optimalisasi Asset Gambar Fashion (Super Visual):**
  - **Diharamkan menggunakan Native HTML `<img src=`**! Mutlak menggunakan package `next/image`.
  - **Prioritas (Above the Fold):** Banner utama Hero harus dilengkapi flag prop `priority={true}` agar langsung dibongkar pre-load oleh head engine. Setup strict ukuran dengan `sizes="(max-width: 768px) 100vw, 50vw"`.
  - **Scroll Bawah (Grid Produk):** Biarkan atribut lazy-load default Next.js bekerja. Pastikan memakai prop atribut `placeholder="blur"` plus implementasi `blurDataURL` (base64 minim) supaya transisi render saat scroll tidak terjadi flickr putih polos kilat.
- **Font & Anti-CLS Rules:**
  - Manfaatkan local import formatwoff2 dan config internal Next `next/font`.
  - Variabel font diinjeksikan secara pre-load (subset latin). Memakai parameter flex CSS modern sehingga tidak ada _Layout Shift_ / layout yang bergeser tiba-tiba ketika text loading menimpa text native default awal.

---

## 5. KEAMANAN DATA & INFRASTRUKTUR SECURITY

1. **Garda Validasi (Input Defense API/Actions):**
   - Server Actions DILARANG percaya langsung request string polosan seperti `formData.get('harga')`.
   - Segala input yang masuk ke back-end WAJIB parsed by **Zod Schema** (`ProductSchema.safeParse(...)`).
2. **Supabase Row Level Security (RLS DB):**
   - Aturan Emas: SELURUH tabel tidak ada yang 100% public kecuali reading Katalog Barang.
   - **Tabel `products`**: Akses Read publik, Akses Write via Action berlevel _Auth Admin_ saja.
   - **Tabel `users`**: Proteksi limit `User` murni hanya dapat melakukan View / Updates pada baris record miliknya sendiri berdasarkan `auth.uid()`.
   - **Tabel `orders`**: `Self Tracking` read via `user_id`. Dan visibilitas total khusus Admin (`service_role`).
3. **Storage Asset Security:**
   - Bucket Storage images produk / logo bersifat public Read-Only (Akses render URL gambar).
   - Hak membuang (`DELETE`) URL assets melalui client side sangat di-blok. Fitur penghapusan terpusat eksklusif hit function melalui Admin Endpoint backend-side.

---

## 6. MONITORING DENGAN LOGGING APM

- **Metrik Analitik Pengguna (Privacy-Friendly):** Gunakan script `Vercel Analytics` free-tier. Sasaran utamanya mengukur event klik Call To Action `Add to Cart / Button Whatsapp` Conversion Rates per jumlah views page masing-masing katalog tas.
- **Error Tracking & Bug Report:** Gunakan default Supabase DB Logs / Next.js Server logs (Sentry).
- Filterisasi sistem wajib difokuskan pada report `AppError` custom internal vs Error exception Server Drop 500 fatal biasa (contoh timeout Vercel DB connection mati).

---

## 7. ACCESSIBILITY (A11Y) - INCLUSIVE PREMIUM UX

- **Menu & Keyboard Traps:** Harus dipastikan setiap flow menu navigasi Header, Filter Category samping kiri, hingga Tombol Beli sanggup difokuskan sempurna hanya secara navigasi shortcut Tab-Keyboard user (tanpa mouse).
- **SEO & Alt Tags:** Jangan sembarang menulis judul deskripsi kosong/asal.
  - ❌ _Buruk_: `<Image alt="foto tas 3.jpeg" />`
  - ✅ _Premium Standard_: `<Image alt="Premium Tote Bag Seri Midnight Canvas paduan leather detail." />`
- **Konstak Visual Color-Palette:** Pastikan kontras keterbacaan aman di atas warna cerah beige atau cream white. Bila warna gray lux terlihat samar (contoh kode hex `#CFCCA7`), otomatis redupkan/tuakan sedikit khusus ke kode text font solid seperti `#89801D` supaya font jelas terbaca. Standarnya minimal pass WCAG 2.1 level AA.
