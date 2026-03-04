# 06 · SEO & TECHNICAL WEB CONTEXT

> **Baca saat:** membuat halaman publik, mengonfigurasi metadata, atau memikirkan indexability.
> SEO teknis = membuat konten yang bagus bisa ditemukan dan dibaca mesin pencari dengan benar.
> **Framework:** Next.js App Router (Metadata API built-in). Tidak perlu `react-helmet` atau library SEO lain.

---

## 1. PRINSIP SEO TEKNIS

1. **Crawlable** — search engine bot bisa mengakses dan membaca halaman
2. **Indexable** — halaman layak masuk index (tidak ada noindex yang tidak sengaja)
3. **Renderable** — konten penting ada di HTML (Server Component), bukan hanya di JavaScript
4. **Linkable** — setiap halaman punya URL canonical yang stabil
5. **Fast** — Core Web Vitals adalah ranking factor
6. **Semantic** — HTML yang bermakna membantu crawler memahami struktur konten
7. **Accessible** — aksesibilitas dan SEO saling menguatkan

> Performance detail: lihat `04-sre-perf-context.md`.

---

## 2. METADATA — NEXT.JS METADATA API

> **AI RULE:** Selalu gunakan Next.js Metadata API. Jangan pakai `<Head>`, `next/head`, atau library SEO third-party.

### Static Metadata (root layout)

```typescript
// app/layout.tsx — metadata default untuk seluruh site
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://moema.id"),

  title: {
    default: "MOEMA — Premium Bags & Accessories",
    template: "%s | MOEMA", // Halaman lain: "Product | MOEMA"
  },

  description:
    "Temukan koleksi tas premium eksklusif di MOEMA Fashion Bags. Desain elegan, fungsional, dan berkualitas tinggi untuk menunjang gaya hidup modern Anda.",

  keywords: [
    "tas fashion",
    "premium bags",
    "MOEMA",
    "tas kulit",
    "fashion wanita",
  ],

  authors: [{ name: "Iqbal Raihan", url: "https://iqbalraihan.com" }],

  creator: "Iqbal Raihan",

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "MOEMA",
    title: "MOEMA — Premium Bags & Accessories",
    description:
      "Temukan koleksi tas premium eksklusif di MOEMA Fashion Bags. Desain elegan, fungsional, dan berkualitas tinggi.",
    images: [
      {
        url: "/og-image.webp", // 1200x630px
        width: 1200,
        height: 630,
        alt: "MOEMA Fashion Bags - Exclusive Collection",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MOEMA",
    description: "Temukan koleksi tas premium eksklusif di MOEMA Fashion Bags.",
    images: ["/og-image.webp"],
    creator: "@moemabags",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "google-site-verification-code",
  },

  alternates: {
    canonical: "/",
  },
};
```

### Dynamic Metadata (per halaman)

```typescript
// app/(public)/product/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.findBySlug(slug);

  if (!product) return { title: "Produk Tidak Ditemukan" };

  const parentImages = (await parent).openGraph?.images ?? [];

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0] || "/default-product.webp",
          width: 800,
          height: 800,
          alt: product.name,
        },
        ...parentImages,
      ],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}
```

---

## 3. DYNAMIC OG IMAGE GENERATION

> Next.js mendukung file-based OG image generation via `opengraph-image.tsx`.
> Setiap halaman bisa punya preview image yang unik — bukan satu gambar generic untuk seluruh site.
> Ini significant advantage untuk social media click-through rate.

### File Structure

```
app/
├── opengraph-image.png              # Static fallback (1200x630px) — default
├── product/
│   └── [slug]/
│       ├── opengraph-image.tsx      # Dynamic — generate dari data
│       └── page.tsx
```

### Dynamic OG Image

```typescript
// app/product/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const alt = 'Preview Produk MOEMA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await productService.findBySlug(slug)

  return new ImageResponse(
    (
      <div style={{
        fontSize: 64,
        background: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)',
        color: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
      }}>
        <h1 style={{ textAlign: 'center' }}>{product.name}</h1>
      </div>
    ),
    { ...size }
  )
}
```

> **Limitasi Satori (rendering engine):**
> Supported: Flexbox, basic typography, borders, shadows, gradients, absolute positioning.
> Tidak supported: CSS Grid, `calc()`, CSS variables, `transform`, animations.

---

## 4. SITEMAP & ROBOTS

### Sitemap Otomatis

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://moema.id";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic pages
  const products = await productService.getAllSlugs();
  const dynamicPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(), // Ganti dengan product.updatedAt jika ada
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...dynamicPages];
}
```

### Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://moema.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 5. CANONICAL URL & TRAILING SLASH

> Duplicate content adalah masalah SEO yang silent — kamu nggak tahu sampai ranking turun.
> Pastikan satu URL = satu halaman. Tidak boleh ada dua URL yang serve konten yang sama.

### Rules

- ✅ Set `metadataBase` di root layout — semua canonical URL jadi absolute
- ✅ Pilih SATU format trailing slash dan konsisten (`/about` atau `/about/`, bukan keduanya)
- ✅ Set `alternates.canonical` di setiap halaman publik
- ❌ Jangan biarkan `www` dan non-`www` serve konten yang sama — redirect salah satu

```typescript
// next.config.ts
const nextConfig = {
  trailingSlash: false, // /catalog (bukan /catalog/)
};
```

```typescript
// Setiap halaman publik WAJIB punya canonical
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `/product/${params.slug}`, // Relative — metadataBase otomatis jadi absolute
    },
  };
}
```

---

## 6. STRUCTURED DATA (JSON-LD)

> Memberi konteks ke search engine — bisa menghasilkan rich results (bintang, harga, FAQ, dll.).

### Helper Component

```tsx
// components/seo/JsonLd.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Penggunaan

```tsx
// app/(public)/product/[slug]/page.tsx
export default async function ProductPage({ params }) {
  const product = await productService.findBySlug(params.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug}`,
      priceCurrency: "IDR",
      price: product.price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* ... page content */}
    </>
  );
}
```

### JSON-LD Types yang Umum

| Tipe Halaman   | Schema Type                  | Kapan Pakai             |
| -------------- | ---------------------------- | ----------------------- |
| Artikel/blog   | `Article` / `BlogPosting`    | Konten editorial        |
| Produk/item    | `Product`                    | E-commerce, marketplace |
| Halaman bisnis | `Organization`               | About page, homepage    |
| Breadcrumb     | `BreadcrumbList`             | Navigasi multi-level    |
| FAQ            | `FAQPage`                    | Halaman FAQ             |
| Review         | `Review` + `AggregateRating` | Halaman dengan rating   |
| Software       | `SoftwareApplication`        | SaaS landing page       |

---

## 7. RENDERING STRATEGY & CACHING

> **AI RULE:** Halaman publik harus Server Component (SSG/ISR). Jangan pernah CSR untuk halaman yang perlu di-index.

### `generateStaticParams` — Pre-render Dynamic Routes

> Setiap halaman publik dengan dynamic route (`[slug]`, `[id]`) **WAJIB** punya `generateStaticParams`.
> Halaman dashboard/admin TIDAK perlu.

```typescript
// app/(public)/product/[slug]/page.tsx
export async function generateStaticParams() {
  const products = await productService.getAllSlugs();
  return products.map((product) => ({ slug: product.slug }));
}

// Kombinasikan dengan ISR
export const revalidate = 3600; // re-generate setiap 1 jam
```

### Strategy per Tipe Halaman

| Halaman         | Strategi     | Config                   | Alasan                       |
| --------------- | ------------ | ------------------------ | ---------------------------- |
| Landing page    | Static (SSG) | default / `force-static` | Tidak berubah, kecepatan max |
| Product listing | ISR          | `revalidate = 300`       | Perlu fresh, tapi cached     |
| Product detail  | ISR          | `revalidate = 60`        | Harga/stock bisa berubah     |
| Dashboard Admin | Dynamic      | `force-dynamic`          | Data personal, real-time     |
| Search results  | Dynamic      | `force-dynamic`          | Bergantung query             |

```typescript
// Cara set di Next.js App Router
export const dynamic = "force-static"; // SSG
export const revalidate = 3600; // ISR (detik)
export const dynamic = "force-dynamic"; // SSR (no cache)
```

> Detail caching dan performance: lihat `04-sre-perf-context.md`.

---

## 8. IMAGE OPTIMIZATION

> Selalu gunakan `next/image` — jangan pernah `<img>` biasa untuk halaman publik.
> Impact langsung ke LCP dan CLS.

### Rules

- ✅ Selalu sertakan `width` dan `height` (atau gunakan `fill`) — mencegah CLS
- ✅ Gunakan `priority` untuk gambar above-the-fold (hero, banner) — percepat LCP
- ✅ Gunakan `sizes` prop untuk responsive images — hemat bandwidth
- ✅ Selalu isi `alt` yang deskriptif — SEO + accessibility
- ❌ Jangan import gambar dari domain yang belum di-whitelist di `next.config.ts`
- ❌ Jangan `priority` pada gambar below-the-fold — counter-productive

```typescript
// Hero image — above the fold, wajib priority
<Image
  src="/hero.webp"
  alt="Tas MOEMA seri klasik edisi terbaru"
  width={1200}
  height={600}
  priority
  sizes="100vw"
/>

// Card image — below the fold
<Image
  src={product.images[0]}
  alt={product.name}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, 33vw"
/>
```

### Remote Images Config

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vxcswxkmrscbqkigzclg.supabase.co" },
    ],
  },
};
```

---

## 9. SEMANTIC HTML & HEADING HIERARCHY

> **AI RULE:** Ikuti aturan ini setiap kali membuat halaman publik.

### Heading Rules

- ✅ Tepat SATU `<h1>` per halaman — ini judul utama
- ✅ Hierarchy berurutan: `<h1>` → `<h2>` → `<h3>` — jangan loncat dari h1 ke h3
- ❌ Jangan gunakan heading untuk styling — gunakan Tailwind (`text-2xl font-bold`)
- ❌ Jangan taruh `<h1>` di layout — setiap page harus define `<h1>` sendiri

### Semantic Elements

```typescript
// ✅ Benar — semantic
<main>
  <article>
    <h1>{product.name}</h1>
    <section>
      <h2>Spesifikasi</h2>
      <p>...</p>
    </section>
  </article>
  <aside>
    <nav aria-label="Produk terkait">...</nav>
  </aside>
</main>

// ❌ Salah — div soup
<div>
  <div>
    <div className="text-3xl font-bold">{product.name}</div>
    <div>
      <div className="text-xl">Spesifikasi</div>
      <p>...</p>
    </div>
  </div>
</div>
```

---

## 10. ACCESSIBILITY BASICS YANG IMPACT SEO

> Google secara eksplisit menghargai situs yang aksesibel. Accessibility dan SEO saling menguatkan.
> Untuk komponen UI: lihat `02-architecture-context.md` Section Atomic Design.

### Rules

- ✅ Semua `<Image>` / `<img>` WAJIB punya `alt` yang deskriptif — bukan kosong, bukan "image", bukan filename
- ✅ Decorative images: `alt=""` (kosong string, bukan tanpa alt) — screen reader skip
- ✅ Links dan buttons harus punya label yang jelas — gunakan `aria-label` jika teks visual nggak cukup
- ✅ Form inputs harus punya `<label>` yang terhubung — gunakan `htmlFor` atau wrap
- ✅ Focus visible harus ada — jangan `outline-none` tanpa pengganti visual
- ✅ Color contrast minimal 4.5:1 untuk body text, 3:1 untuk heading besar
- ✅ Skip navigation link untuk keyboard users

```typescript
// ✅ Link dengan icon — butuh aria-label
<a href="/cart" aria-label="Lihat Keranjang Belanja">
  <CartIcon />
</a>

// ✅ Skip to content — taruh di awal body
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to content
</a>

// Di content utama
<main id="main-content">
  {/* ... */}
</main>
```

---

## 11. i18n SEO — MULTI-LANGUAGE (OPSIONAL)

> Jika project punya lebih dari satu bahasa, search engine perlu tahu versi bahasa mana yang ditampilkan ke user mana.
> MOEMA menggunakan bahasa utama Indonesia, tapi disiapkan untuk skalabilitas.

---

## 12. RESOURCE HINTS

> Gunakan untuk domain eksternal yang pasti diakses (font, analytics, CDN).
> Impact langsung ke LCP dan FCP.

```typescript
// components/seo/ResourceHints.tsx
'use client'
import ReactDOM from 'react-dom'

export function ResourceHints() {
  // Font provider
  ReactDOM.preconnect('https://fonts.googleapis.com')
  ReactDOM.preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })
  ReactDOM.preconnect('https://vxcswxkmrscbqkigzclg.supabase.co')

  return null
}

// Taruh di root layout
// app/layout.tsx
import { ResourceHints } from '@/components/seo/ResourceHints'

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ResourceHints />
        {children}
      </body>
    </html>
  )
}
```

---

## 13. ERROR & NOT FOUND PAGES

> **AI RULE:** Setiap project WAJIB punya `not-found.tsx` dan `error.tsx` di root app.
> Google harus terima status code yang benar — 404 untuk not found, bukan 200.

### `not-found.tsx`

```typescript
// app/not-found.tsx
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan - MOEMA',
  robots: { index: false },       // Jangan index halaman 404
}

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-3xl font-bold">Produk Tidak Ditemukan</h1>
        <Link href="/catalog" className="mt-4 underline">Kembali ke Katalog</Link>
    </main>
  )
}
```

### Trigger di Dynamic Route

```typescript
// app/(public)/product/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await productService.findBySlug(slug);
  if (!product) notFound(); // Return 404 status code — BUKAN redirect
  // ...
}
```

---

## 14. URL STRUCTURE

```
✅ BAIK — deskriptif, keyword-rich, stabil
https://moema.id/product/classic-leather-tote

❌ HINDARI
https://moema.id/p?id=12345         # tidak deskriptif
https://moema.id/product/12345      # ID saja
```

### Slug Generation

```typescript
// lib/utils.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
```

> Untuk naming conventions: lihat `02-architecture-context.md` Section Naming Conventions.

---

## 15. CHECKLIST SEO

> Gunakan sebelum launch halaman publik baru.
> Lihat juga: `01-product-context.md` Section Definition of Done.

### Metadata & Indexing

- [ ] `<title>` ada dan unique per halaman (50-60 karakter)
- [ ] `<meta description>` ada (150-160 karakter, mengandung keyword)
- [ ] Canonical URL di-set via `alternates.canonical`
- [ ] Robots.txt tidak memblok halaman yang harusnya diindeks
- [ ] Halaman ada di `sitemap.xml`

### Open Graph & Social

- [ ] OG image ada (1200x630px) — static atau dynamic
- [ ] Twitter card di-set (`summary_large_image`)

### Rendering & Performance

- [ ] Halaman publik menggunakan Server Component (SSG/ISR)
- [ ] `generateStaticParams` ada untuk semua dynamic public routes
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] `next/image` dipakai dengan `priority` untuk above-the-fold

### Content & Accessibility

- [ ] Heading hierarchy benar: satu H1, H2/H3 berurutan
- [ ] Semantic HTML: `<main>`, `<article>`, `<section>`, `<nav>`
- [ ] Semua gambar punya alt text deskriptif
- [ ] Links/buttons punya label yang jelas
- [ ] Color contrast memenuhi WCAG (4.5:1 body, 3:1 large text)
- [ ] URL menggunakan slug deskriptif (bukan ID)

### Structured Data

- [ ] JSON-LD ada untuk halaman produk
- [ ] Test di Google Rich Results Test

### Infrastructure

- [ ] HTTPS aktif
- [ ] `not-found.tsx` dan `error.tsx` ada di root app
- [ ] Trailing slash konsisten (`next.config.ts`)
- [ ] Resource hints di-set untuk domain eksternal Supabase
