# 05 · TESTING & QA CONTEXT

> ⚠️ **INI ADALAH TEMPLATE** — bukan context file project aktual.
> Isi semua bagian yang ditandai `[CUSTOMIZE]`. Hapus blok ini setelah selesai.

> **Baca saat:** menulis test, mereview coverage, atau memutuskan apa yang perlu di-test.
> Test bukan untuk membuktikan kode benar — tapi untuk mendeteksi ketika kode jadi salah.

---

## 1. FILOSOFI TESTING

Analogi: Test adalah **jaring pengaman** sirkus. Akrobat tetap perlu latihan (kode yang baik), tapi jaring ada untuk menangkap ketika sesuatu yang tidak terduga terjadi. Tujuan bukan agar akrobat selalu jatuh ke jaring — tapi agar tim bisa bergerak cepat tanpa takut.

> Testing criteria di level fitur: lihat `01-product-context.md` Section Definition of Done.

**Apa yang di-test:**
- Business logic yang kompleks dan punya banyak edge case
- Integrasi antara komponen penting (service + database)
- User flow utama dari perspektif end-user
- Security concerns (auth, permission, ownership, input validation)

**Apa yang tidak di-test:**
- Implementasi detail internal (method private, naming, dll.)
- Third-party library (ORM, Auth, dll. — mereka punya test sendiri)
- UI yang pure presentational (render dengan props, hasilnya obvious)

---

## 2. TESTING PYRAMID

```
          ▲
         /E2E\          Sedikit — lambat, tapi paling realistis
        /─────\         Playwright
       /  Integ \       Medium — test beberapa layer bersamaan
      /──────────\      Vitest + test database
     /   Unit     \     Banyak — cepat, isolasi, per-function
    /______________\    Vitest
```

**Rasio target**: 70% unit / 20% integration / 10% E2E

---

## 3. SETUP

### Vitest (Unit + Integration)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/features/**', 'src/lib/**'],
      exclude: ['src/features/**/components/**'],  // UI tidak di-cover vitest
      thresholds: {
        functions: 80,
        branches: 75,
        lines: 80,
      }
    }
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') }
  }
})
```

### Test Database Setup

```typescript
// tests/setup.ts
// [CUSTOMIZE — sesuaikan dengan database/ORM yang dipakai]

// Contoh: Prisma + PostgreSQL
import { beforeAll, afterAll, afterEach } from 'vitest'
import { db } from '@/lib/db'

beforeAll(async () => {
  await db.$connect()
})

afterEach(async () => {
  // [CUSTOMIZE — cleanup tables sesuai domain project, order matters (FK constraints)]
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.user.deleteMany()
})

afterAll(async () => {
  await db.$disconnect()
})
```

### Playwright (E2E)

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 4. UNIT TEST — SERVICE LAYER

> Contoh di bawah menggunakan domain `products` sebagai ilustrasi.
> `[CUSTOMIZE]` — ganti dengan domain aktual project dari `01-product-context.md` Section Domain Model.
>
> Service adalah target utama unit test karena mengandung business logic.
> Layer structure: lihat `02-architecture-context.md` Section Pola Per Layer.

```typescript
// features/products/services.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productService } from './services'
import { productQueries } from './queries'

// Mock queries — kita test logic, bukan database
vi.mock('./queries')

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create product when name is unique', async () => {
      // Arrange
      vi.mocked(productQueries.findByName).mockResolvedValue(null)
      vi.mocked(productQueries.create).mockResolvedValue({
        id: 'prod_1',
        name: 'Test Product',
        price: 100000,
        stock: 10,
        createdAt: new Date(),
      })

      // Act
      const result = await productService.create({
        name: 'Test Product',
        price: 100000,
        stock: 10,
      })

      // Assert
      expect(result.name).toBe('Test Product')
      expect(productQueries.create).toHaveBeenCalledOnce()
    })

    it('should throw error when product name already exists', async () => {
      // Arrange
      vi.mocked(productQueries.findByName).mockResolvedValue({
        id: 'existing',
        name: 'Test Product',
      } as any)

      // Act & Assert
      await expect(
        productService.create({ name: 'Test Product', price: 100000, stock: 10 })
      ).rejects.toThrow('Produk dengan nama ini sudah ada')
    })

    it('should throw error when price is negative', async () => {
      await expect(
        productService.create({ name: 'Test', price: -1, stock: 10 })
      ).rejects.toThrow()
    })
  })
})
```

---

## 5. INTEGRATION TEST — ACTION + SERVICE + DB

> Contoh di bawah menggunakan domain `products` sebagai ilustrasi.
> `[CUSTOMIZE]` — ganti dengan domain aktual project.
>
> Test yang menyentuh database sungguhan (test DB).

```typescript
// features/products/actions.test.ts
import { describe, it, expect } from 'vitest'
import { createProductAction } from './actions'
import { db } from '@/lib/db'

// [CUSTOMIZE — buat helper sesuai domain project]
async function createAdminUser() {
  return db.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin',
      role: 'admin',
    }
  })
}

describe('createProductAction', () => {
  it('should create product with valid data', async () => {
    const admin = await createAdminUser()

    const formData = new FormData()
    formData.append('name', 'Laptop Gaming')
    formData.append('price', '15000000')
    formData.append('stock', '5')

    // Mock auth session
    vi.mock('@/lib/auth', () => ({
      requireAuth: vi.fn().mockResolvedValue({ user: admin }),
    }))

    const result = await createProductAction(formData)

    expect(result.error).toBeNull()
    expect(result.data?.name).toBe('Laptop Gaming')

    // Verify actually saved to DB
    const saved = await db.product.findFirst({ where: { name: 'Laptop Gaming' } })
    expect(saved).toBeDefined()
  })

  it('should return validation error for invalid price', async () => {
    const formData = new FormData()
    formData.append('name', 'Product')
    formData.append('price', '-1000')  // invalid

    const result = await createProductAction(formData)

    expect(result.error).toBeDefined()
    expect(result.data).toBeNull()
  })
})
```

---

## 6. SECURITY TEST PATTERNS

> **AI RULE:** Setiap fitur yang punya auth/permission check WAJIB punya minimal test-test di bawah ini.
> Detail security rules per layer: lihat `03-security-context.md` Section Security Rules Per Layer.

### Wajib di-test:

1. **Unauthorized access** — action tanpa session harus return error
2. **Wrong role** — user biasa akses admin action harus ditolak
3. **Ownership violation** — user A nggak bisa akses/edit data user B
4. **Invalid input** — schema validation harus reject input berbahaya

### Contoh

> `[CUSTOMIZE]` — ganti domain dan action name dengan yang aktual.

```typescript
describe('security: createProductAction', () => {
  it('should reject unauthenticated request', async () => {
    vi.mock('@/lib/auth', () => ({
      requireAuth: vi.fn().mockRejectedValue(new Error('UNAUTHORIZED')),
    }))

    const formData = new FormData()
    formData.append('name', 'Test')

    const result = await createProductAction(formData)
    expect(result.error).toBeDefined()
  })

  it('should reject non-admin user', async () => {
    vi.mock('@/lib/auth', () => ({
      requireAuth: vi.fn().mockResolvedValue({
        user: { id: 'user_1', role: 'user' }
      }),
    }))

    const result = await createProductAction(new FormData())
    expect(result.error).toContain('izin')
  })

  it('should reject ownership violation', async () => {
    // [CUSTOMIZE — test bahwa user A tidak bisa akses data user B]
    vi.mock('@/lib/auth', () => ({
      requireAuth: vi.fn().mockResolvedValue({
        user: { id: 'user_A', role: 'user' }
      }),
    }))

    // Attempt to access/edit data owned by user_B
    const result = await updateProductAction('product_owned_by_B', new FormData())
    expect(result.error).toBeDefined()
  })
})
```

---

## 7. E2E TEST — USER FLOW

> Contoh di bawah menggunakan flow auth + products sebagai ilustrasi.
> `[CUSTOMIZE]` — ganti dengan user flow aktual project dari `01-product-context.md` Section User Flows.

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Register
    await page.goto('/register')
    await page.getByLabel('Nama').fill('John Doe')
    await page.getByLabel('Email').fill('john@example.com')
    await page.getByLabel('Password').fill('SecurePass123!')
    await page.getByRole('button', { name: 'Daftar' }).click()

    await expect(page).toHaveURL(/dashboard|verify/)
    await expect(page.getByText('Selamat datang')).toBeVisible()
  })

  test('user cannot access dashboard when not logged in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})

// tests/e2e/products.spec.ts
// [CUSTOMIZE — ganti dengan domain aktual]
test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL('/dashboard')
  })

  test('admin can create a product', async ({ page }) => {
    await page.goto('/dashboard/products/new')
    await page.getByLabel('Nama Produk').fill('Laptop Gaming X')
    await page.getByLabel('Harga').fill('15000000')
    await page.getByRole('button', { name: 'Simpan Produk' }).click()

    await expect(page.getByText('Produk berhasil dibuat')).toBeVisible()
    await expect(page).toHaveURL('/dashboard/products')
  })
})
```

---

## 8. TEST UTILITIES & HELPERS

> Buat factory function untuk setiap domain di `01-product-context.md` Section Domain Model.
> Naming: `create[Entity]Factory` — contoh: `createUserFactory`, `createNoteFactory`
> `[CUSTOMIZE]` — ganti contoh di bawah dengan domain aktual project.

### Pattern

```typescript
// tests/helpers/index.ts

// Satu factory per entity — input type harus match schema di features/{domain}/schemas.ts
// [CUSTOMIZE — buat factory untuk setiap entity di domain model]

export function createProductFactory(overrides?: Partial<CreateProductInput>) {
  return {
    name: 'Default Product',
    price: 100000,
    stock: 10,
    ...overrides,
  }
}

export function createUserFactory(overrides?: Partial<CreateUserInput>) {
  return {
    email: `user-${Date.now()}@test.com`,
    name: 'Test User',
    role: 'user' as const,
    ...overrides,
  }
}

// Mock session — [CUSTOMIZE — sesuaikan fields dengan auth library]
export function mockSession(user?: Partial<User>) {
  return {
    user: {
      id: 'user_test',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      ...user,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}
```

---

## 9. CI PIPELINE — TESTING

> `[CUSTOMIZE]` — sesuaikan database service dan setup commands dengan stack project.
> Detail CI/CD lengkap: lihat `08-devops-context.md`.

### Urutan wajib (berlaku di semua project):

1. Type check (`tsc --noEmit`)
2. Lint (`eslint`)
3. Unit tests
4. Integration tests (butuh database)
5. E2E tests (butuh running app)

```yaml
# .github/workflows/test.yml
# [CUSTOMIZE — sesuaikan services, env vars, dan setup commands]
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      # [CUSTOMIZE — sesuaikan database service]
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        env:
          # [CUSTOMIZE — sesuaikan env vars]
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
        run: |
          npx prisma db push
          npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 10. COVERAGE TARGETS

> Layer names sesuai `02-architecture-context.md` Section Pola Per Layer.

| Layer | Target | Alasan |
|-------|--------|--------|
| `services.ts` | ≥ 90% | Business logic — paling kritis |
| `schemas.ts` | ≥ 85% | Validasi edge cases |
| `queries.ts` | ≥ 70% | Covered lewat integration test |
| `actions.ts` | ≥ 75% | Covered lewat integration test |
| `components/` | Tidak wajib | E2E sudah cover flow utama |

---

## 11. CHECKLIST TESTING

> Gunakan sebelum merge PR.
> Lihat juga: `01-product-context.md` Section Definition of Done.

- [ ] Unit test untuk setiap business rule baru di `services.ts`
- [ ] Security test untuk setiap action yang punya auth/permission check
- [ ] Integration test untuk Server Action baru
- [ ] E2E test untuk user flow baru (kalau ada)
- [ ] Tidak ada test yang di-skip (`test.skip`) tanpa alasan
- [ ] Coverage tidak turun dari threshold
- [ ] Semua test pass di CI
