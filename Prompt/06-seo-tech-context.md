# 06 · SEO & TECHNICAL WEB CONTEXT

> Gunakan file ini saat mengedit halaman publik, metadata, robots, sitemap, atau structured data.
> File ini mendokumentasikan praktik SEO yang benar-benar dipakai proyek ini.

---

## 1. SEO Principles for This Project

1. Halaman katalog dan detail produk harus crawlable dan indexable.
2. Halaman transaksional seperti cart dan checkout tidak perlu diindeks.
3. Canonical harus stabil untuk menghindari duplicate content dari query params filter/sort.
4. Metadata harus memakai Next.js Metadata API, bukan `next/head`.
5. Konten utama sebaiknya tetap tersedia dari server-rendered HTML.

---

## 2. Base URL Policy

Base URL berasal dari:

```txt
NEXT_PUBLIC_APP_URL
```

Fallback lokal proyek:

```txt
https://www.moemacollection.com
```

Helper yang dipakai:

- [lib/site-config.ts](/Users/iqbalrei/ZERTOV/tasfashione-commerce/lib/site-config.ts)

Jangan hardcode domain di page metadata baru jika helper ini sudah bisa dipakai.

---

## 3. Metadata Rules

### Root metadata

Root metadata ada di:

- [app/layout.tsx](/Users/iqbalrei/ZERTOV/tasfashione-commerce/app/layout.tsx)

Aturan:

- `metadataBase` wajib memakai base URL terpusat
- default title dan template title didefinisikan di root
- OG image default memakai `/og-image.png`

### Catalog

- Canonical tetap ke `/catalog`
- Query params filter/sort tidak dianggap halaman canonical yang terpisah

### Product page

- Gunakan `generateMetadata`
- Canonical ke `/product/[slug]`
- Ambil title, description, dan OG image dari data produk

### Transactional pages

- `/cart` dan `/checkout` harus `noindex`

### Placeholder legal pages

- Jika kontennya masih draft atau placeholder, gunakan `noindex`

---

## 4. Sitemap & Robots

### Sitemap

Sitemap file:

- [app/sitemap.ts](/Users/iqbalrei/ZERTOV/tasfashione-commerce/app/sitemap.ts)

Saat ini sitemap memuat:

- homepage
- catalog
- cookie policy
- semua product detail yang tidak diarsipkan

### Robots

Robots file:

- [app/robots.ts](/Users/iqbalrei/ZERTOV/tasfashione-commerce/app/robots.ts)

Disallow yang dipakai:

- `/admin/`
- `/admin/login`
- `/api/`
- `/cart/`
- `/checkout/`

Jangan block asset crawl penting tanpa alasan kuat.

---

## 5. Structured Data

Structured data saat ini dipakai inline di halaman yang paling penting:

- homepage: organization schema
- product detail: product schema

Aturan:

- Gunakan JSON-LD yang valid
- URL dalam schema harus absolute
- Jangan menambahkan field yang tidak benar-benar tersedia di data produk

---

## 6. Canonical Policy

- Homepage canonical: `/`
- Catalog canonical: `/catalog`
- Product canonical: `/product/[slug]`
- Halaman dengan query params filter/sort/search tidak boleh menjadi canonical page terpisah kecuali ada keputusan SEO khusus

---

## 7. Indexability Decisions

### Index

- homepage
- catalog
- product detail
- cookie policy

### Noindex

- cart
- checkout
- legal pages yang masih placeholder draft
- seluruh admin area

---

## 8. Practical Guidance

- Jika membuat halaman publik baru, tambahkan metadata minimal: `title`, `description`, `alternates.canonical`.
- Jika halaman baru punya nilai discoverability, pertimbangkan penambahan ke sitemap.
- Jika halaman baru bersifat user-specific, transaksional, atau draft, set `robots.index = false`.
- Jika page bergantung pada entity publik seperti produk, pertimbangkan JSON-LD.
