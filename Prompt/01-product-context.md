# 01 · PRODUCT CONTEXT

> Baca saat: membuat fitur baru, mendesain alur user, atau memutuskan scope pekerjaan.

---

## 1. PRODUCT VISION

```text
Untuk    : The Modern Minimalist, Fashion-Forward Professionals, & Luxury Aspirants
Yang     : Membutuhkan tas berkualitas premium untuk menunjang gaya hidup harian atau eksklusif (office, event)
Produk ini adalah : Premium Fashion E-commerce Platform (Tas)
Yang     : Menyajikan katalog terkurasi dengan pengalaman belanja visual layaknya butik digital "Luxury Essentialism"
Tidak seperti : Platform tas massal (marketplace) atau toko tas budget yang ramai dan berantakan
Produk ini : Memberikan ketenangan visual tinggi melalui whitespace ekspansif, desain grid asimetris editorial, elegan, meniru standar estetika Charles & Keith, Hermès, dan PEDRO.
```

---

## 2. DOMAIN MODEL (Entity Scope)

> Entitas-entitas utama dalam sistem ecommerce premium MOEMA. "Kosakata" yang harus konsisten di seluruh codebase.
> **AI RULE:** Gunakan nama entitas ini persis seperti tertulis. Jangan buat sinonim.

```typescript
[PRODUCT]
  - id: string
  - name: string          // Full name (e.g., "Joanna Gray")
  - baseName: string      // Model Name (e.g., "Joanna")
  - slug: string          // URL friendly (e.g., "joanna-gray")
  - sku: string           // Product Code (e.g., "Y1886")
  - color: string
  - dimensions: string
  - description: text
  - price: number
  - stock: number
  - images: string[]      // URL dari Supabase ('products/joanna/joanna-gray-1.webp')
  - relasi: has many [ORDER_ITEM]

[ADMIN_USER]
  - id: string
  - email: string
  - passwordHash: string

[ORDER] & [ORDER_ITEM]
  // Akan difokuskan untuk Checkout flow nantinya.
```

**Aturan naming**: Gunakan nama entitas ini secara konsisten di database, komponen folder `features/`, nama endpoint, hingga state variable dan copy di UI.

---

## 3. USER ROLES & PERMISSIONS

| Role    | Deskripsi      | Akses                                      |
| ------- | -------------- | ------------------------------------------ |
| `guest` | Belum login    | Halaman publik saja (Shop, PDP, Cart)      |
| `user`  | User terdaftar | Checkout, Histori Pesanan                  |
| `admin` | Admin aplikasi | Panel Admin (CMS), Manajemen Stok & Produk |

> Detail implementasi auth & authorization: lihat `03-security-context.md`.

---

## 4. FITUR INTI

> List fitur yang harus ada di MVP. Setiap fitur punya deskripsi singkat dan status.

| Fitur                 | Deskripsi                                | Status      |
| --------------------- | ---------------------------------------- | ----------- |
| Product Catalog       | Listing tas premium dengan filter elegan | In-progress |
| Product Details (PDP) | Galeri besar, info sticky, drawer cart   | In-progress |
| Cart & Checkout       | Distraction-free checkout flow           | Planned     |
| Admin CMS             | Manajemen katalog stok dan gambar WebP   | Planned     |

---

## 5. USER FLOWS

> Dokumentasikan di sini **HANYA** untuk flow yang non-obvious atau multi-step.
> Flow sederhana (CRUD standar) tidak perlu didokumentasikan.
> **AI RULE:** Jika flow sudah didefinisikan di sini, ikuti urutan langkahnya — jangan skip atau tambah langkah tanpa diskusi.

### Core User Journey (Shopping Flow)

```text
1. Discovery: Hero Video/Gambar lebar -> Horizontal Scroll (New Arrival) -> Kumpulan kategori.
2. Consideration: Product Listing (PLP) -> Filter warna -> Quick View Modal untuk intip.
3. Purchase: Product Detail (PDP) -> Detail statis lengket (Sticky left info), galeri besar (Right) -> Drawer Cart sisi layar -> Checkout (Distraction-free, minimalis).
```

---

## 6. HALAMAN, ROUTES, & UX FALLBACKS

| Route              | Tipe      | UX Fallbacks / Behaviour Tambahan                                                                                                                          |
| ------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Public    | Homepage kampanye hero utama, editorial feel.                                                                                                              |
| `/shop/[category]` | Public    | Daftar grid tas/wallet. Jangan pake pagination biasa (Load more / Infinite scroll elegant).                                                                |
| `/product/[slug]`  | Public    | Galeri besar disebelah info lengket (sticky).                                                                                                              |
| `/cart`            | Public    | Minimalist Drawer atau Halaman form table clean. **Cart Kosong**: Tulis _"Your bag is empty. Explore our latest collection"_ -> arahkan ke produk rekomen. |
| `/checkout`        | Public    | Formulir harus _distraction-free_, tanpa nav bar berlebih, badge trusted/aman.                                                                             |
| `/admin/*`         | Protected | CMS rapi bagi admin memanajemen stock, gambar (WebP compression), dll.                                                                                     |

**General Fallback:**

- **Image Loading:** Jangan tampilkan placeholder jelek. Gunakan render solid color box berwarna `bg-moema-light` (Light Olive `#CFCCA7`).
- **404 Page:** Tipografi rapi dan besar "Piece Not Found.", dengan tombol garis elegan "Back to Home".

---

## 7. AESTHETIC DIRECTION & DESIGN SYSTEM (The "Premium" Standard)

Sebagai Developer, saat kamu mengerjakan frontend (UI), aktifkan Persona **Creative Director for a High-End Fashion Brand**. Kamu mendesain _Digital Boutique_, bukan website standar.

### THE "ANTI-SLOP" RULES (Strictly Enforced)

- **NO Small images**: Produk adalah _hero_. Gunakan grid dominan, full-width banners. Aspek rasio harus `aspect-[3/4]` atau `aspect-[4/5]`.
- **NO Cluttered Navigation**: Header harus rapi, dapat collapse jika perlu.
- **NO Generic "Buy Now"**: Gunakan desain sleek, hover yang berkelas (fill color pelan dari kiri). Copy harus elegan: `ADD TO BAG`.
- **NO Default Drop-Shadows**: Jangan pakai shadow standar. Gunakan border 1px yang sangat halus (`#CFCCA7`), soft diffused shadow.
- **NO Messy Alignment**: Disiplin pada grid. Elemen WAJIB alignment lurus.

### Vibe & Animasi (Framer Motion)

- **Whitespace is King**: Jika ada ruang, biarkan napas. Luxury = space.
- **Sharp Corners**: Hindari radius terlalu membulat (`rounded-lg`/`xl`). Gunakan `rounded-none` atau max `rounded-sm`.
- **Transisi**: "Slow and Smooth." Fade perlahan (opacity 0 -> 1), geser minimal (Y-axis drop). Gambar di-_reveal_ ala curtain atau scale kecil lambat `1.05x`.

### Typography

- **Headings (Serif / Luxury):** `Cormorant Garamond` (via `font-pedro-serif`). Digunakan untuk Editorial headers, "Our Story", koleksi eksklusif. Bisa gunakan gaya _Italic_.
- **Headings (Modern / Clean):** `Futura PT` (via `font-ck-bold`). Untuk nama Produk, Kategori, dan Navigasi.
- **Body / Detail:** `Proxima Nova` atau `Inter` (via `font-pedro-sans` / `font-ck-sans`). Kejelasan tinggi, letter-spacing (tracking) lebar khusus teks UPPERCASE.

### Color Palette (MOEMA Luxury)

Warna ini sudah terhubung melalui `app/globals.css`:

- **Primary (Ink Black):** `#111111` — Teks, Tombol Utama, Borders kuat.
- **Background (Canvas White):** `#FFFFFF` — Latar belakang konten utama, Card Produk.
- **Accent (MOEMA Light Olive):** `#CFCCA7` — Border halus 1px, latar belakang sekunder, hover statis.
- **Accent Deep (MOEMA Dark Olive):** `#89801D` — State "Active", badge diskon, price tags tertentu.

---

## 8. CONTENT TONE & COPYWRITING

- **Voice:** Sophisticated, Descriptive, Minimal.
- **Deskripsi Tas:** Harus berfokus pada material (tipe kulit, finish dari hardware besi) dan cara pakai (_"Perfect for evening galas"_).
- **CTA:** Singkat, lugas, mengundang: `SHOP NOW`, `DISCOVER`, `ADD TO BAG`.

---

## 9. OUT OF SCOPE (MVP)

> Fitur-fitur ini **TIDAK** dibangun sekarang. Catat di sini supaya tidak melebar.
> **AI RULE:** Jangan suggest atau implement fitur yang ada di list ini.
>
> Untuk alasan kenapa fitur tertentu di-exclude: lihat `00-master-context.md` Section Decisions Log.

- [ ] Integrasi Payment Gateway Multi-Negara (fokus lokal dulu jika ada)
- [ ] Fitur Wishlist (Tunda ke post-MVP)
- [ ] Multi-language support
- [ ] Sistem Poin / Loyalty program

---

## 10. DEFINITION OF DONE

> Sebuah fitur dianggap selesai jika:

- [ ] Memenuhi semua syarat ESTETIKA LUXURY (Anti-Slop rule).
- [ ] Responsive design (Grid asimetris/editorial harus tetap aman di form-factor mobile).
- [ ] Gambar menggunakan rasio yang presisi, dioptimalisasi via Supabase Storage.
- [ ] Component terikat pada state URL (khususnya untuk Filter / Drawer).
- [ ] Error state telah dihandle (tidak error putih kosong) dan ditampilkan ke user.
- [ ] Loading state ada.
- [ ] Lolos TypeScript strict, tanpa warning/error.
- [ ] Unit test untuk service/business logic (bila diperlukan sesuai standar project).

> Detail testing strategy per layer: lihat `05-testing-qa-context.md`.
