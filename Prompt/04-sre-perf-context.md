# 04 · SRE & PERFORMANCE CONTEXT
> Baca saat: mengoptimasi performa, setup caching, menangani error di produksi, atau scaling.
> SRE = Site Reliability Engineering — seni membuat sistem yang tidak down dan cepat.

---

## Prinsip Performa

1. **Measure first** — jangan optimasi tanpa data. Profil dulu, baru fix
2. **Cache aggressively, invalidate carefully** — caching itu mudah, invalidation itu susah
3. **Fail gracefully** — sistem harus tetap berguna meski sebagian error
4. **Observe everything** — kalau tidak bisa diukur, tidak bisa diperbaiki
5. **Make it work → make it right → make it fast** — urutan ini penting

---

## Caching Strategy — Next.js 15

Next.js 15 menggunakan model caching baru yang lebih eksplisit. Default: **tidak ada cache**, harus opt-in.

### 1. Static Page (Full Cache)
```typescript
// Untuk halaman yang tidak berubah
export const dynamic = 'force-static'

// Atau revalidate setiap N detik (ISR)
export const revalidatePeriod = 3600 // 1 jam
```

### 2. Data Cache via `fetch`
```typescript
// Cache response fetch secara spesifik
const data = await fetch('https://api.example.com/data', {
  next: {
    revalidate: 3600,        // Revalidate setiap 1 jam
    tags: ['products'],      // Tag untuk selective revalidation
  }
})

// Force no cache (selalu fresh)
const data = await fetch('https://api.example.com/realtime', {
  cache: 'no-store'
})
```

### 3. Server Component Caching via `cache()`
```typescript
import { cache } from 'react'
import { db } from '@/lib/db'

// Deduplicate request yang sama dalam satu render cycle
export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } })
})

// Dipanggil 10x di tree → query DB hanya 1x
```

### 4. On-Demand Revalidation
```typescript
import { revalidatePath, revalidateTag } from 'next/cache'

// Setelah mutasi data
export async function updateProductAction(id: string, data: unknown) {
  await productService.update(id, data)

  revalidatePath(`/products/${id}`)         // Revalidate specific page
  revalidatePath('/products', 'layout')     // Revalidate layout
  revalidateTag('products')                 // Revalidate semua yang punya tag 'products'
}
```

### 5. Redis Caching (Upstash) — untuk Data Berat
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'
export const redis = Redis.fromEnv()

// Pola cache-aside
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get<T>(key)
  if (cached) return cached

  const fresh = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(fresh))
  return fresh
}

// Penggunaan
const products = await getCachedData(
  'products:featured',
  () => productService.getFeatured(),
  60 * 30 // 30 menit
)
```

---

## Database Performance

### Indexing Strategy
```prisma
// schema.prisma — tambahkan index untuk query yang sering
model Product {
  id        String   @id @default(cuid())
  slug      String   @unique           // auto-indexed
  category  String
  price     Float
  createdAt DateTime @default(now())

  @@index([category])                  // filter by category
  @@index([category, price])           // filter category + sort by price
  @@index([createdAt])                 // sort by date
}
```

### N+1 Query Prevention
```typescript
// ❌ N+1 — 1 query untuk list + N query untuk setiap item
const orders = await db.order.findMany()
for (const order of orders) {
  order.user = await db.user.findUnique({ where: { id: order.userId } }) // N queries!
}

// ✅ Eager loading dengan include
const orders = await db.order.findMany({
  include: {
    user: { select: { id: true, name: true, email: true } },
    items: { include: { product: true } }
  }
})
```

### Pagination — Cursor-based (untuk data besar)
```typescript
// Offset pagination → lambat untuk halaman besar (LIMIT 20 OFFSET 10000)
// Cursor pagination → konsisten O(1) per page

export async function getProductsCursor(cursor?: string, limit = 20) {
  return db.product.findMany({
    take: limit + 1,                            // ambil 1 extra untuk cek hasMore
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: 'desc' },
  })
}
```

---

## Frontend Performance

### Image Optimization
```tsx
import Image from 'next/image'

// Selalu gunakan next/image, bukan <img>
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority               // untuk LCP image (above the fold)
  placeholder="blur"     // blur placeholder saat loading
  sizes="(max-width: 768px) 100vw, 50vw"  // responsive sizes
/>
```

### Dynamic Import (Code Splitting)
```typescript
import dynamic from 'next/dynamic'

// Komponen berat yang tidak perlu di-load awal
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div className="h-64 animate-pulse bg-zinc-100 rounded-lg" />,
  ssr: false,           // kalau butuh browser API
})

// Modal, dialog — load saat pertama kali dibuka
const UserModal = dynamic(() => import('@/features/users/components/UserModal'))
```

### Font Optimization
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
})
```

### Core Web Vitals Targets

| Metric | Deskripsi | Target |
|--------|-----------|--------|
| **LCP** | Largest Contentful Paint — kapan konten utama muncul | < 2.5s |
| **INP** | Interaction to Next Paint — responsivitas interaksi | < 200ms |
| **CLS** | Cumulative Layout Shift — stabilitas layout | < 0.1 |
| **FCP** | First Contentful Paint | < 1.8s |
| **TTFB** | Time to First Byte | < 800ms |

### Cara Monitor
- **Vercel Analytics** — Real User Monitoring otomatis
- **PageSpeed Insights** — Test on-demand
- **Sentry Performance** — trace per-transaction

---

## Error Handling

### Prinsip
```
User-facing error  → pesan yang jelas, actionable, tidak expose internals
Developer error    → log lengkap ke Sentry dengan context
Recoverable error  → tampilkan, biarkan user retry
Fatal error        → error boundary, fallback UI
```

### Error Boundary
```tsx
// app/error.tsx — global error boundary
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log ke Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-zinc-900">Terjadi Kesalahan</h2>
      <p className="text-zinc-500">Kami sudah dicatat masalah ini.</p>
      <button onClick={reset} className="btn-primary">
        Coba Lagi
      </button>
    </div>
  )
}

// app/[feature]/error.tsx — feature-level error boundary (lebih granular)
```

### Server Action Error Pattern
```typescript
// Selalu return error object, jangan throw ke client
export async function createAction(data: FormData) {
  try {
    const result = await service.create(parseData(data))
    return { data: result, error: null }
  } catch (err) {
    // Log ke Sentry dengan context
    Sentry.captureException(err, {
      extra: { action: 'createAction', userId: session?.user.id }
    })

    // Return user-friendly error
    const message = err instanceof AppError
      ? err.message              // error yang kita buat sendiri — aman di-show ke user
      : 'Terjadi kesalahan. Silakan coba lagi.'  // unexpected error — generic message

    return { data: null, error: message }
  }
}

// Custom AppError class
export class AppError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AppError'
  }
}
```

### Loading States
```tsx
// Selalu ada loading state untuk aksi async
function SubmitButton() {
  const { pending } = useFormStatus()  // dari react-dom

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary disabled:opacity-50"
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        'Simpan'
      )}
    </button>
  )
}
```

---

## Monitoring Setup — Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.01,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,     // mask PII di replay
      blockAllMedia: false,
    }),
  ],

  beforeSend(event) {
    // Filter event yang tidak perlu di-track
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') return null
    return event
  },
})
```

---

## Checklist Performance

Sebelum deploy ke production:

- [ ] Lighthouse score > 90 (mobile)
- [ ] Tidak ada N+1 query (cek dengan Prisma log di dev)
- [ ] Image menggunakan next/image dengan sizes prop
- [ ] Font menggunakan next/font
- [ ] Dynamic import untuk komponen berat (chart, editor, dll.)
- [ ] Error boundary ada di setiap major feature
- [ ] Loading state ada di semua aksi async
- [ ] Sentry terkonfigurasi dan test error sampai
- [ ] Cache strategy sudah didefinisikan untuk setiap halaman
