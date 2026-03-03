# 03 · SECURITY CONTEXT
> Baca saat: membuat API route, Server Action, form input, auth flow, atau fitur yang melibatkan data sensitif.
> Security bukan fitur tambahan — ini built-in dari awal.

---

## Prinsip Keamanan

1. **Never trust the client** — selalu validasi ulang di server, tidak peduli validasi di frontend
2. **Least privilege** — setiap user hanya punya akses ke apa yang mereka butuhkan
3. **Defense in depth** — jangan andalkan satu layer keamanan saja
4. **Fail secure** — saat ragu, tolak akses
5. **Audit everything** — setiap aksi sensitif harus tercatat

---

## Authentication — Better Auth

### Config
```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { db } from './db'

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,       // wajib verifikasi email
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,         // 7 hari
    updateAge: 60 * 60 * 24,             // refresh setiap 24 jam
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  rateLimit: {
    enabled: true,
    window: 60,                          // 60 detik
    max: 10,                             // max 10 request login per window
  },
})

export type Session = typeof auth.$Infer.Session
```

### Helper: Get Session di Server
```typescript
// lib/auth.ts (tambahan)
import { headers } from 'next/headers'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireRole(role: 'admin' | 'user') {
  const session = await requireAuth()
  if (session.user.role !== role) throw new Error('FORBIDDEN')
  return session
}
```

---

## Authorization — Role-Based Access Control (RBAC)

### Middleware (Route Protection)
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth check untuk public routes
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Cek session dari cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Cek admin routes
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    // Verifikasi role — lakukan di Server Component untuk detail
    // Di middleware hanya cek kehadiran session
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Permission Check di Server Action
```typescript
// Selalu check permission di Server Action, bukan hanya di middleware
export async function deleteProductAction(id: string) {
  // 1. Cek auth
  const session = await requireAuth()

  // 2. Cek role
  if (session.user.role !== 'admin') {
    return { error: 'Tidak punya izin untuk menghapus produk' }
  }

  // 3. Cek ownership (kalau relevan)
  const product = await productQueries.findById(id)
  if (!product) return { error: 'Produk tidak ditemukan' }

  // 4. Baru eksekusi
  await productService.delete(id)
  revalidatePath('/products')
  return { success: true }
}
```

---

## Input Validation — Zod

### Aturan Validasi
```typescript
// Selalu gunakan .safeParse(), bukan .parse()
// .parse() throw error; .safeParse() return { success, data, error }

// ✅ Benar
const parsed = schema.safeParse(input)
if (!parsed.success) return { error: parsed.error.flatten() }
const safeData = parsed.data // TypeScript tahu ini sudah valid

// ❌ Salah — error tidak tertangkap dengan baik
const data = schema.parse(input) // bisa throw unhandled exception
```

### Schema Patterns Penting
```typescript
import { z } from 'zod'

// String sanitization
const nameSchema = z.string()
  .min(1, 'Tidak boleh kosong')
  .max(100, 'Maksimal 100 karakter')
  .trim()                              // hapus whitespace
  .regex(/^[a-zA-Z\s]+$/, 'Hanya huruf dan spasi')

// ID validation (hindari SQL injection via ID manipulation)
const idSchema = z.string().cuid2()   // atau .uuid()

// File upload validation
const fileSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, 'Maksimal 5MB'),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
})

// Pagination (hindari abuse)
const paginationSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})
```

---

## OWASP Top 10 — Mitigasi per Issue

### 1. Broken Access Control
```typescript
// ❌ Salah: hanya cek login, tidak cek ownership
const product = await db.product.findUnique({ where: { id } })

// ✅ Benar: cek login DAN ownership
const product = await db.product.findUnique({
  where: { id, userId: session.user.id }  // user hanya bisa akses miliknya
})
```

### 2. Injection (SQL, XSS)
```typescript
// SQL Injection: Prisma otomatis parameterized queries — aman
// Tapi hindari queryRaw dengan string interpolation:

// ❌ Salah
await db.$queryRaw`SELECT * FROM users WHERE email = '${email}'`

// ✅ Benar
await db.$queryRaw`SELECT * FROM users WHERE email = ${email}` // Prisma handle escaping
// atau gunakan queryRawUnsafe hanya jika benar-benar perlu, dengan sanitasi manual

// XSS: React otomatis escape JSX — aman
// Tapi hati-hati dengan dangerouslySetInnerHTML:
// ❌ Jangan pernah render HTML dari user input tanpa sanitasi
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Gunakan library sanitizer
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### 3. Sensitive Data Exposure
```typescript
// ❌ Jangan return field sensitif ke client
const user = await db.user.findUnique({ where: { id } })
return user // includes passwordHash, resetToken, dll.!

// ✅ Select hanya field yang diperlukan
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true, role: true }
})
```

### 4. CSRF
```
Server Actions Next.js sudah include CSRF protection built-in.
Untuk API routes yang menerima state-changing requests:
- Gunakan SameSite cookie
- Validasi Origin header
- Better Auth handle ini secara otomatis
```

### 5. Security Headers
```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // sesuaikan
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
    ].join('; ')
  },
]
```

---

## Environment Variables — Secrets Management

```typescript
// lib/env.ts — validasi semua env vars di sini
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),         // openssl rand -base64 32
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    UPSTASH_REDIS_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
```

**Aturan secrets**:
- Tidak pernah commit `.env` (ada di `.gitignore`)
- Tidak pernah log secrets ke console
- Secrets disimpan di Vercel Environment Variables / vault
- Rotasi secrets secara berkala
- `NEXT_PUBLIC_` prefix hanya untuk yang benar-benar perlu di client (non-secret)

---

## Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'app:ratelimit',
})

// Gunakan di Server Action atau API Route
export async function sensitiveAction() {
  const ip = headers().get('x-forwarded-for') ?? 'unknown'
  const { success } = await rateLimiter.limit(ip)

  if (!success) {
    return { error: 'Terlalu banyak request. Coba lagi nanti.' }
  }

  // ... lanjutkan
}
```

---

## Checklist Security Review

Sebelum merge PR yang menyentuh auth/data sensitif:

- [ ] Semua input divalidasi dengan Zod di server
- [ ] Auth check ada di setiap Server Action yang butuh login
- [ ] Role check ada untuk aksi yang butuh permission khusus
- [ ] Ownership check ada (user tidak bisa akses data user lain)
- [ ] Field sensitif tidak dikirim ke client
- [ ] Tidak ada secret di client-side code
- [ ] Rate limiting ada untuk endpoint sensitif
- [ ] Error message tidak expose internal detail ke user
