# 08 · DEVOPS & DEPLOYMENT CONTEXT
> Baca saat: setup project baru, deploy ke production, konfigurasi CI/CD, atau troubleshoot infrastruktur.
> DevOps = jembatan antara development dan production. Tujuannya: deploy sering, deploy aman, recovery cepat.

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────┐
│                   Vercel                         │
│  Next.js App (Edge + Node.js runtime)            │
│  - Automatic preview deployments                 │
│  - Edge CDN worldwide                            │
│  - Analytics & Web Vitals                        │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
┌──────────┐  ┌─────────┐  ┌──────────┐
│ Supabase │  │ Upstash │  │  Sentry  │
│ (Postgres│  │ (Redis) │  │ (Error)  │
│  + Auth) │  │         │  │          │
└──────────┘  └─────────┘  └──────────┘
```

---

## Environment Setup

### .env Files Structure
```bash
# Development — .env.local (tidak di-commit)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb_dev"
AUTH_SECRET="dev-secret-min-32-chars-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Test — .env.test (tidak di-commit)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb_test"
AUTH_SECRET="test-secret-min-32-chars-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production — diset di Vercel Dashboard (tidak pernah ada di repo)
```

### .gitignore (Wajib)
```gitignore
# Environment
.env
.env.local
.env.*.local
.env.production

# Next.js
.next/
out/

# Dependencies
node_modules/

# Build
dist/

# OS
.DS_Store

# Logs
*.log
npm-debug.log*

# Prisma
prisma/migrations/dev.db
```

### Env Validation
```typescript
// lib/env.ts — T3 Env
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),

    // Optional integrations
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    SENTRY_DSN: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // Email (pilih salah satu)
    RESEND_API_KEY: z.string().optional(),

    // OAuth (optional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
})
```

---

## CI/CD Pipeline — GitHub Actions

### Full Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

jobs:
  # Job 1: Quality Checks
  quality:
    name: Type Check & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

  # Job 2: Tests
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: quality

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Setup test database
        run: npx prisma db push
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}
          AUTH_SECRET: test-secret-min-32-chars-xxxxxxxxxxx
          NEXT_PUBLIC_APP_URL: http://localhost:3000

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: github.ref == 'refs/heads/main'

  # Job 3: Build check
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ env.DATABASE_URL }}
          AUTH_SECRET: test-secret-min-32-chars-xxxxxxxxxxx
          NEXT_PUBLIC_APP_URL: https://preview.app.com

  # Job 4: Deploy (hanya di main)
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Database Migration Strategy

### Prisma Migration Workflow
```bash
# Development — buat migration baru
npx prisma migrate dev --name add_product_table

# Cek status migration
npx prisma migrate status

# Production — apply migrations yang pending
npx prisma migrate deploy

# Reset database (HANYA development!)
npx prisma migrate reset
```

### Migration di CI/CD
```yaml
# Tambahkan ke deploy job — sebelum app start
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Aturan Migration
```
1. Selalu buat migration untuk setiap schema change — jangan pakai db push di production
2. Test migration di staging sebelum production
3. Backup database sebelum migration besar
4. Migrations harus backward-compatible kalau mungkin (zero-downtime)
   - Tambah kolom dulu (nullable), lalu isi data, baru jadikan non-nullable
   - Jangan rename kolom langsung — tambah kolom baru, migrate data, hapus kolom lama
```

---

## Vercel Configuration

### vercel.json
```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-DNS-Prefetch-Control", "value": "on" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/health",
      "destination": "/api/health"
    }
  ]
}
```

### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test DB connection
    await db.$queryRaw`SELECT 1`

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    })
  } catch {
    return Response.json({ status: 'error' }, { status: 503 })
  }
}
```

---

## Branching Strategy

```
main          ← production, protected (require PR + review)
  │
  ├── develop ← staging, integration branch
  │     │
  │     ├── feature/add-product-search
  │     ├── feature/user-dashboard
  │     └── fix/login-redirect
  │
  └── hotfix/critical-bug ← bypass develop untuk urgent fix
```

### Branch Naming
```
feature/[jira-id]-short-description
fix/[jira-id]-short-description
hotfix/critical-issue
chore/update-dependencies
```

### Commit Message (Conventional Commits)
```
feat: tambah fitur pencarian produk
fix: perbaiki redirect setelah login
chore: update dependencies
docs: update README setup
refactor: ekstrak logika auth ke service
test: tambah unit test untuk productService
perf: optimasi query N+1 di order list
```

---

## npm Scripts (package.json)
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "preview": "next build && next start",

    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",

    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset"
  }
}
```

---

## Rollback Strategy

### Vercel Rollback
```bash
# Via dashboard: Vercel Dashboard → Deployments → pilih deployment lama → Promote to Production
# Atau via CLI:
vercel rollback [deployment-url]
```

### Database Rollback
```bash
# Prisma tidak support automatic rollback migration
# Gunakan backup restore:
# 1. Supabase: Dashboard → Database → Backups → Restore
# 2. Manual: pg_restore dari backup file
```

### Incident Response
```
1. Deteksi       → Sentry alert / monitoring
2. Acknowledge   → Tim diberi tahu, sedang ditangani
3. Mitigate      → Rollback deployment jika perlu
4. Investigate   → Cari root cause
5. Fix           → Deploy fix
6. Post-mortem   → Dokumen apa yang terjadi, timeline, dan pencegahan
```

---

## Checklist Deployment

Sebelum deploy ke production:

- [ ] Semua test pass di CI
- [ ] Type check tidak ada error
- [ ] Build sukses di CI
- [ ] Environment variables sudah di-set di Vercel production
- [ ] Database migration sudah di-test di staging
- [ ] Health check endpoint merespons dengan status 200
- [ ] Tidak ada `console.log` yang tertinggal di kode
- [ ] Tidak ada `TODO` kritis yang belum diselesaikan
- [ ] Sentry terkonfigurasi dan test error terkirim ke dashboard
- [ ] Rollback plan sudah siap (tau cara rollback kalau ada issue)
