# 06 · SEO & TECHNICAL WEB CONTEXT
> Baca saat: membuat halaman publik, mengonfigurasi metadata, atau memikirkan indexability.
> SEO teknis = membuat konten yang bagus bisa ditemukan dan dibaca mesin pencari dengan benar.

---

## Prinsip SEO Teknis

1. **Crawlable** — search engine bot bisa mengakses dan membaca halaman
2. **Indexable** — halaman layak masuk index (tidak ada noindex yang tidak sengaja)
3. **Renderable** — konten penting ada di HTML, bukan hanya di JavaScript
4. **Linkable** — setiap halaman punya URL canonical yang stabil
5. **Fast** — Core Web Vitals adalah ranking factor

---

## Metadata — Next.js Metadata API

Next.js App Router punya Metadata API bawaan. **Tidak perlu `react-helmet` atau library lain.**

### Static Metadata
```typescript
// app/layout.tsx — metadata default untuk seluruh site
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),

  title: {
    default: '[APP_NAME] — [Tagline]',
    template: '%s | [APP_NAME]',          // Halaman lain: "Produk | AppName"
  },

  description: '[Deskripsi 150-160 karakter yang compelling dan mengandung keyword utama]',

  keywords: ['keyword utama', 'keyword sekunder', 'nama brand'],

  authors: [{ name: '[Nama Brand]', url: 'https://[domain].com' }],

  creator: '[Nama Brand]',

  // Open Graph — tampilan saat di-share di sosmed
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://[domain].com',
    siteName: '[APP_NAME]',
    title: '[APP_NAME] — [Tagline]',
    description: '[Deskripsi OG — bisa lebih panjang dari meta description]',
    images: [
      {
        url: '/og-image.png',            // 1200x630px
        width: 1200,
        height: 630,
        alt: '[Deskripsi gambar untuk screen reader]',
      },
    ],
  },

  // Twitter/X Card
  twitter: {
    card: 'summary_large_image',
    title: '[APP_NAME] — [Tagline]',
    description: '[Deskripsi]',
    images: ['/og-image.png'],
    creator: '@[twitter_handle]',
  },

  // Robot directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verifikasi search console
  verification: {
    google: '[google-verification-code]',
  },

  // Canonical URL
  alternates: {
    canonical: 'https://[domain].com',
  },
}
```

### Dynamic Metadata (per halaman)
```typescript
// app/(public)/products/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'
import { productService } from '@/features/products/services'

type Props = {
  params: Promise<{ slug: string }>
}

// generateMetadata dijalankan di server — bisa fetch data
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const product = await productService.findBySlug(slug)

  if (!product) return { title: 'Produk Tidak Ditemukan' }

  const parentImages = (await parent).openGraph?.images ?? []

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        { url: product.imageUrl, width: 800, height: 600, alt: product.name },
        ...parentImages,
      ],
    },
    alternates: {
      canonical: `/products/${slug}`,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  // ...
}
```

---

## Sitemap & Robots

### Sitemap Otomatis
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { productService } from '@/features/products/services'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Dynamic pages
  const products = await productService.getAllForSitemap()
  const productPages: MetadataRoute.Sitemap = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...productPages]
}
```

### Robots.txt
```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

---

## Structured Data (Schema.org / JSON-LD)

Memberi konteks ke search engine tentang apa yang ada di halaman — bisa menghasilkan rich results (bintang, harga, dll. di SERP).

```tsx
// Buat helper component
// components/seo/JsonLd.tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Penggunaan di product page
export default async function ProductPage({ params }: Props) {
  const product = await productService.findBySlug(params.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IDR',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* ... page content */}
    </>
  )
}
```

### JSON-LD Types yang Umum

| Tipe Halaman | Schema Type |
|---|---|
| Produk/item | `Product` |
| Artikel/blog | `Article` |
| Halaman bisnis | `Organization` + `LocalBusiness` |
| Breadcrumb | `BreadcrumbList` |
| FAQ | `FAQPage` |
| Review | `Review` + `AggregateRating` |

---

## URL Structure Best Practices

```
✅ BAIK — deskriptif, keyword-rich, stabil
https://domain.com/products/laptop-gaming-asus-rog-2024

❌ HINDARI
https://domain.com/p?id=12345         # tidak deskriptif
https://domain.com/products/12345     # ID saja
https://domain.com/Products/Laptop    # case-sensitive issues
```

### Slug Generation
```typescript
// lib/utils.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // hapus karakter khusus
    .replace(/\s+/g, '-')            // spasi → dash
    .replace(/-+/g, '-')             // multiple dash → single
    .trim()
}

// Di service, pastikan slug unik
async function createUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name)
  let counter = 0

  while (await db.product.findFirst({ where: { slug } })) {
    counter++
    slug = `${generateSlug(name)}-${counter}`
  }

  return slug
}
```

---

## Rendering Strategy per Halaman

| Halaman | Strategi | Alasan |
|---------|----------|--------|
| Landing page | Static (SSG) | Tidak berubah, kecepatan max |
| Blog/artikel | ISR (revalidate tiap jam) | Berubah, tapi tidak real-time |
| Product listing | ISR (revalidate tiap 5 menit) | Perlu fresh, tapi cached |
| Product detail | ISR (revalidate tiap menit) | Harga/stock bisa berubah |
| Dashboard | Dynamic (no cache) | Data personal, real-time |
| Search results | Dynamic | Bergantung query |

```typescript
// Cara set di Next.js App Router

// Static — tidak perlu set apa-apa (default untuk halaman tanpa dynamic data)
export const dynamic = 'force-static'

// ISR
export const revalidate = 3600 // detik

// Dynamic (no cache)
export const dynamic = 'force-dynamic'
```

---

## Checklist SEO

Sebelum launch halaman publik baru:

- [ ] `<title>` ada dan unique per halaman (50-60 karakter)
- [ ] `<meta description>` ada (150-160 karakter, mengandung keyword)
- [ ] Open Graph image ada (1200x630px)
- [ ] Canonical URL sudah di-set
- [ ] Structured data JSON-LD ada (kalau relevan: produk, artikel, dll.)
- [ ] Halaman ada di sitemap.xml
- [ ] Robots.txt tidak memblok halaman yang harusnya diindeks
- [ ] URL menggunakan slug deskriptif (bukan ID)
- [ ] Heading hierarchy benar: satu H1, H2/H3 untuk subheading
- [ ] Gambar punya alt text yang deskriptif
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Mobile-friendly (test di Google Mobile-Friendly Test)
- [ ] HTTPS aktif
