# 05 · TESTING & QA CONTEXT

> Nama file ini masih memakai suffix `template`, tetapi isi file ini sekarang adalah konteks aktual proyek.
> Gunakan saat menulis test, menilai coverage, atau memutuskan regression mana yang wajib dijaga.

---

## 1. Testing Philosophy

Tujuan testing di repo ini adalah menjaga flow bisnis utama tetap aman ketika fitur storefront, checkout, admin mutation, atau filter catalog berubah.

Prioritas pengujian:

- Business logic di `services/*`
- Pure utility di `lib/*`
- Security contract di `lib/admin-actions.ts`
- Flow pengguna utama yang benar-benar menghasilkan nilai bisnis

Yang tidak perlu terlalu dikejar:

- Presentational UI sederhana
- Implementasi internal library pihak ketiga
- Snapshot besar yang rapuh

---

## 2. Current Test Stack

```txt
Unit / service tests : Vitest + Testing Library
E2E                  : Playwright
DOM environment      : jsdom
```

### File yang Sudah Ada

- `tests/lib/cart-logic.test.ts`
- `tests/services/product.service.test.ts`
- `tests/services/order.service.test.ts`
- `tests/components/ui/button.test.tsx`
- `tests/lib/admin-actions.test.ts`
- `tests/e2e/catalog-filters.spec.ts`
- `tests/e2e/guest-checkout.spec.ts`
- `tests/e2e/storefront-smoke.spec.ts`
- `tests/e2e/mobile-navigation.spec.ts`
- `tests/e2e/admin-smoke.spec.ts`
- `tests/e2e/admin-product-smoke.spec.ts`
- `tests/e2e/admin-showcase-smoke.spec.ts`
- `tests/e2e/admin-order-smoke.spec.ts`
- `tests/e2e/cart-regression.spec.ts`

---

## 3. Commands

Gunakan command berikut:

```bash
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:e2e:smoke
pnpm test:qa
```

Catatan:

- `pnpm test` menjalankan suite Vitest non-E2E.
- `pnpm test:e2e` memakai Playwright dan akan menyalakan dev server lewat config.
- `pnpm test:e2e:smoke` menjalankan baseline smoke suite secara serial (`--workers=1`) agar mutation admin tidak saling bentrok di environment yang sama.
- `pnpm test:qa` menjalankan Vitest lalu smoke E2E.

---

## 4. Vitest Rules

### Scope utama Vitest

- `lib/*` pure logic
- `services/*` business logic
- `lib/admin-actions.ts` untuk auth guard, validasi, dan kontrak error

### Pola yang dipakai

- Mock repository atau dependency I/O
- Test perilaku, bukan detail implementasi
- Untuk server action, verifikasi payload return dan side effect penting

### Contoh area yang wajib dijaga

- `order.service.placeOrder`
- `product.service.createProduct` / `updateProduct`
- admin mutations tanpa session
- validasi status order dan form payload

---

## 5. E2E Rules

Flow E2E yang dianggap core saat ini:

1. Filter catalog mengubah URL state via `nuqs`
2. Guest checkout dari catalog sampai redirect WhatsApp
3. Storefront smoke: browse → PDP → add to bag → cart / checkout shell
4. Cart regression: quantity update, remove item, persistence after reload
5. Admin smoke: login → navigate dashboard → color CRUD ringan
6. Admin product smoke: create → archive → restore → delete
7. Admin showcase smoke: create → edit → delete
8. Admin order smoke: fresh order → admin status update
9. Semua smoke flow aktif diverifikasi di desktop Chrome dan mobile Chrome, kecuali admin smoke yang sengaja desktop-only

### Playwright config

- Browser: desktop Chrome + mobile Chrome
- Screenshot: only on failure
- Trace: on first retry
- Web server: `pnpm dev`
- Smoke command resmi dijalankan serial (`--workers=1`) karena suite ini memutasi data shared yang sama di backend

### Admin E2E Credentials

- Default local fallback mengikuti `scripts/seed-admin.ts`
- Bisa dioverride dengan:
  - `PLAYWRIGHT_ADMIN_EMAIL`
  - `PLAYWRIGHT_ADMIN_PASSWORD`

### Current Smoke Baseline

- Verified locally: gunakan hasil `pnpm test:e2e:smoke` terbaru sebelum release
- Skip yang sekarang diharapkan:
  - `tests/e2e/admin-smoke.spec.ts` pada project mobile, karena admin workspace belum ditargetkan sebagai mobile flow utama
  - `tests/e2e/admin-product-smoke.spec.ts` pada project mobile
  - `tests/e2e/admin-showcase-smoke.spec.ts` pada project mobile
  - `tests/e2e/admin-order-smoke.spec.ts` pada project mobile
- Reusable helper ada di:
  - `tests/e2e/helpers/storefront.ts`
  - `tests/e2e/helpers/admin.ts`

---

## 6. Security Testing Minimum

Setiap admin mutation penting minimal harus punya coverage untuk:

1. Unauthenticated request ditolak
2. Invalid payload ditolak
3. Successful payload memanggil service yang benar
4. Revalidation berjalan pada route yang terdampak

Saat menambah admin action baru, tambahkan test di `tests/lib/admin-actions.test.ts` atau file test domain yang setara.

---

## 7. Practical QA Guidance

- Jika perubahan menyentuh `nuqs`, update atau tambah E2E catalog filter.
- Jika perubahan menyentuh checkout/cart/order, update unit test service dan pertimbangkan E2E checkout.
- Jika perubahan menyentuh auth admin, tambahkan test action-level, bukan hanya middleware assumption.
- Jika perubahan hanya kosmetik murni, test baru tidak wajib.

---

## 8. Current Gaps

- Belum ada integration test dengan Supabase test database sungguhan.
- Belum ada coverage gate di CI.
- E2E admin product edit flow belum cukup stabil untuk masuk smoke suite; saat ini smoke product fokus pada create/archive/restore/delete.
- Lint global repo masih punya issue legacy di luar scope test setup.

Jika ingin menaikkan level QA berikutnya, prioritas terbaik adalah:

1. Stabilkan E2E admin product edit flow dan masukkan ke smoke suite
2. Tambah integration test yang memeriksa action + service contract lebih dalam
3. Tambah CI job untuk `pnpm test` dan `pnpm test:e2e` sesuai environment
