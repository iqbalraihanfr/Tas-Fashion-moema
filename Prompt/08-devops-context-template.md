# 08 · DEVOPS & DEPLOYMENT CONTEXT

> ⚠️ **INI ADALAH TEMPLATE** — bukan context file project aktual.
> Isi semua bagian yang ditandai `[CUSTOMIZE]`. Hapus blok ini setelah selesai.

> **Baca saat:** setup project baru, deploy ke production, konfigurasi CI/CD, atau troubleshoot infrastruktur.
> DevOps = jembatan antara development dan production. Tujuannya: deploy sering, deploy aman, recovery cepat.

---

## 1. INFRASTRUCTURE OVERVIEW

> `[CUSTOMIZE]` — gambar arsitektur infrastruktur project.

```
[CUSTOMIZE — sesuaikan dengan stack aktual. Contoh:]

┌─────────────────────────────────────────────────┐
│               [CUSTOMIZE — hosting]              │
│  Next.js App (Edge + Node.js runtime)            │
│  - Automatic preview deployments                 │
│  - Edge CDN worldwide                            │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
┌──────────┐  ┌─────────┐  ┌──────────┐
│[CUSTOMIZE│  │[CUSTOMIZE│  │[CUSTOMIZE│
│ Database]│  │ Cache/  ]│  │ Monitor ]│
│          │  │ Queue   ]│  │          │
└──────────┘  └─────────┘  └──────────┘
```

### Services

| Service | Provider | Tujuan |
|---------|----------|--------|
| Hosting | `[CUSTOMIZE]` — Vercel / Railway / AWS | App deployment + CDN |
| Database | `[CUSTOMIZE]` — Supabase / PlanetScale / Firebase | Data persistence |
| Cache/Queue | `[CUSTOMIZE]` — Upstash / Redis / tidak ada | Rate limiting, caching, jobs |
| Error tracking | `[CUSTOMIZE]` — Sentry / tidak ada | Error monitoring |
| Email | `[CUSTOMIZE]` — Resend / SendGrid / tidak ada | Transactional email |
| `[CUSTOMIZE]` | `[CUSTOMIZE]` | `[CUSTOMIZE]` |

---

## 2. ENVIRONMENT SETUP

> Daftar env vars lengkap: lihat `00-master-context.md` Section Environment & Deployment.
> Env validation dan security: lihat `03-security-context.md` Section Environment Variables.

### .env Files Structure

```bash
# [CUSTOMIZE — sesuaikan env vars dengan stack project]

# Development — .env.local (tidak di-commit)
DATABASE_URL="[CUSTOMIZE]"
AUTH_SECRET="[CUSTOMIZE — min 32 chars]"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Test — .env.test (tidak di-commit)
DATABASE_URL="[CUSTOMIZE — test database]"
AUTH_SECRET="test-secret-min-32-chars-xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production — diset di hosting dashboard (tidak pernah ada di repo)
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

# [CUSTOMIZE — tambahkan sesuai stack]
# Contoh Prisma:
# prisma/migrations/dev.db
```

---

## 3. PRE-DEPLOY AUTOMATION (lint-staged + husky)

> Tangkap error sebelum masuk ke repository — jangan andalkan CI saja.

### Setup

```bash
# Install
npm install -D husky lint-staged

# Init husky
npx husky init
```

### Configuration

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/pre-push (opsional — bisa lambat, pertimbangkan trade-off)
npm run type-check
```

### Rules

- ✅ `pre-commit`: lint + format file yang di-stage saja (cepat)
- ✅ `pre-push`: type-check (opsional, bisa di-skip kalau CI sudah cover)
- ❌ Jangan taruh test di pre-commit — terlalu lambat, bikin developer bypass hooks

---

## 4. CI/CD PIPELINE — GITHUB ACTIONS

> Ini adalah source of truth untuk CI/CD pipeline.
> Test configuration detail: lihat `05-testing-qa-context.md`.

### Urutan Pipeline (berlaku di semua project)

```
Push/PR → Quality (type-check + lint) → Test (unit + integration) → Build → Deploy
```

### Full Pipeline

```yaml
# .github/workflows/ci.yml
# [CUSTOMIZE — sesuaikan services, env vars, dan setup commands]
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  # [CUSTOMIZE — test environment variables]
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
      # [CUSTOMIZE — sesuaikan database service]
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
        # [CUSTOMIZE — sesuaikan dengan ORM/database]
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
          # [CUSTOMIZE — minimal env vars untuk build]
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
      # [CUSTOMIZE — sesuaikan dengan hosting provider]
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 5. DATABASE MIGRATION STRATEGY

> `[CUSTOMIZE]` — sesuaikan dengan ORM/database yang dipakai.
> Contoh di bawah menggunakan Prisma + PostgreSQL.

### Migration Workflow

```bash
# [CUSTOMIZE — commands sesuai ORM]

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
# [CUSTOMIZE]
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Aturan Migration (Universal)

```
1. Selalu buat migration untuk setiap schema change — jangan pakai db push di production
2. Test migration di staging sebelum production
3. Backup database sebelum migration besar
4. Migrations harus backward-compatible kalau mungkin (zero-downtime):
   - Tambah kolom dulu (nullable), lalu isi data, baru jadikan non-nullable
   - Jangan rename kolom langsung — tambah kolom baru, migrate data, hapus kolom lama
5. Jangan pernah drop table/kolom di production tanpa verifikasi data sudah di-migrate
```

---

## 6. HOSTING CONFIGURATION

> `[CUSTOMIZE]` — section ini untuk hosting provider utama.
> Contoh di bawah menggunakan Vercel.

### Vercel Configuration

```json
// vercel.json
// [CUSTOMIZE — sesuaikan region dan headers]
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
  ]
}
```

> Security headers detail: lihat `03-security-context.md` Section Security Headers.

### Docker Setup (untuk non-Vercel deployments)

> Gunakan jika deploy ke Railway, AWS ECS, DigitalOcean, atau self-hosted.
> Skip jika deploy ke Vercel (Vercel handle build sendiri).

```dockerfile
# Dockerfile
# [CUSTOMIZE — sesuaikan dengan stack]
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# [CUSTOMIZE — tambahkan build steps sesuai ORM]
# RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

```typescript
// next.config.ts — enable standalone output untuk Docker
// [CUSTOMIZE — tambahkan jika pakai Docker]
const nextConfig = {
  output: 'standalone',
}
```

---

## 7. DOMAIN & SSL

### Domain Configuration

| Key | Value |
|-----|-------|
| **Production domain** | `[CUSTOMIZE]` |
| **Preview domain pattern** | `[CUSTOMIZE]` — contoh: `pr-123.preview.app.com` |
| **DNS provider** | `[CUSTOMIZE]` — contoh: Cloudflare, Namecheap |

### SSL Rules

- ✅ HTTPS wajib di semua environment (production, staging, preview)
- ✅ HSTS header sudah di-set di hosting config (lihat Section 6)
- ✅ Redirect HTTP → HTTPS di DNS/hosting level
- ❌ Jangan pernah serve mixed content (HTTPS page loading HTTP resources)

### Redirect Rules

```
[CUSTOMIZE — pilih satu dan konsisten]

www.domain.com → domain.com (redirect, bukan serve keduanya)
ATAU
domain.com → www.domain.com
```

---

## 8. MONITORING & OBSERVABILITY

> **AI RULE:** Production app WAJIB punya minimal error tracking dan health check.

### Error Tracking

```typescript
// [CUSTOMIZE — sesuaikan dengan provider. Contoh: Sentry]

// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // [CUSTOMIZE — sample rate sesuai traffic]
})
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
// [CUSTOMIZE — sesuaikan DB check dengan ORM]

export async function GET() {
  try {
    // Test DB connection
    await db.$queryRaw`SELECT 1`    // [CUSTOMIZE]

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

### Uptime Monitoring

| Tool | Tujuan | Setup |
|------|--------|-------|
| `[CUSTOMIZE]` — BetterStack / UptimeRobot / Vercel Analytics | Uptime check | Ping `/api/health` setiap 1-5 menit |
| `[CUSTOMIZE]` — Sentry / LogRocket | Error tracking | Auto-capture errors + performance |
| `[CUSTOMIZE]` — Vercel Analytics / PostHog | Web Vitals | LCP, CLS, INP monitoring |

### Logging Rules

- ✅ Log errors dengan konteks (user ID, action, input) — tapi **jangan** log data sensitif
- ✅ Gunakan structured logging (JSON format) di production
- ✅ Set log levels: `error` (production), `warn` + `info` (staging), `debug` (development)
- ❌ Jangan `console.log` di production — gunakan logging library atau error tracker
- ❌ Jangan log passwords, tokens, atau PII

---

## 9. BRANCHING STRATEGY

```
main          ← production, protected (require PR + review)
  │
  ├── develop ← staging, integration branch (opsional)
  │     │
  │     ├── feat/add-product-search
  │     ├── feat/user-dashboard
  │     └── fix/login-redirect
  │
  └── hotfix/critical-bug ← bypass develop untuk urgent fix
```

### Branch Naming

> Untuk commit message conventions: lihat `00-master-context.md` Section Conventions.

```
feat/[short-description]           # fitur baru
fix/[short-description]            # bug fix
hotfix/[short-description]         # urgent production fix
chore/[short-description]          # maintenance, dependencies
refactor/[short-description]       # code improvement tanpa behavior change
```

---

## 10. NPM SCRIPTS

> **AI RULE:** Gunakan script names ini secara konsisten. Jangan invent nama baru tanpa diskusi.

```json
// package.json
// [CUSTOMIZE — sesuaikan dengan stack]
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

    "prepare": "husky"

    // [CUSTOMIZE — tambahkan db scripts sesuai ORM]
    // "db:generate": "prisma generate",
    // "db:push": "prisma db push",
    // "db:migrate": "prisma migrate dev",
    // "db:migrate:prod": "prisma migrate deploy",
    // "db:studio": "prisma studio",
    // "db:seed": "tsx prisma/seed.ts",
    // "db:reset": "prisma migrate reset"
  }
}
```

---

## 11. ROLLBACK STRATEGY

### App Rollback

```bash
# [CUSTOMIZE — sesuaikan dengan hosting]

# Vercel:
# Dashboard → Deployments → pilih deployment lama → Promote to Production
# Atau CLI:
vercel rollback [deployment-url]

# Docker / Railway:
# Re-deploy image tag sebelumnya
```

### Database Rollback

```
[CUSTOMIZE — sesuaikan dengan database provider]

1. Restore dari backup terakhir
2. Provider backup schedule:
   - Supabase: daily automatic backups
   - PlanetScale: branch-based, bisa revert
   - Self-hosted: pastikan backup cron terjadwal
```

### Incident Response

```
1. Deteksi       → Error tracking alert / uptime monitor
2. Acknowledge   → Tim diberi tahu, sedang ditangani
3. Mitigate      → Rollback deployment jika perlu
4. Investigate   → Cari root cause (cek logs, error tracker)
5. Fix           → Deploy fix ke production
6. Post-mortem   → Dokumen: apa yang terjadi, timeline, pencegahan
```

---

## 12. CHECKLIST DEPLOYMENT

> Gunakan sebelum deploy ke production.
> Lihat juga: `05-testing-qa-context.md` Section Checklist Testing.

### Pre-deploy

- [ ] Semua test pass di CI (unit + integration + E2E)
- [ ] Type check tidak ada error
- [ ] Build sukses di CI
- [ ] Tidak ada `console.log` yang tertinggal di kode
- [ ] Tidak ada `TODO` kritis yang belum diselesaikan
- [ ] lint-staged + husky terpasang dan berjalan

### Infrastructure

- [ ] Environment variables sudah di-set di hosting production
- [ ] Database migration sudah di-test di staging
- [ ] Health check endpoint merespons dengan status 200
- [ ] SSL/HTTPS aktif
- [ ] Domain redirect (www/non-www) sudah di-set

### Monitoring

- [ ] Error tracking terkonfigurasi dan test error terkirim
- [ ] Uptime monitoring aktif (ping `/api/health`)
- [ ] Rollback plan sudah siap (tau cara rollback kalau ada issue)

### Post-deploy

- [ ] Smoke test manual di production (cek halaman utama, auth, fitur inti)
- [ ] Cek error tracker — tidak ada spike error baru
- [ ] Cek Web Vitals — tidak ada degradasi
