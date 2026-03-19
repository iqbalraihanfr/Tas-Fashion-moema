# 02 · ARCHITECTURE CONTEXT

> File ini menjelaskan arsitektur aktual repo ini.
> Gunakan ini saat membuat file baru, memindahkan logic, atau menilai apakah sebuah perubahan terlalu invasif.

---

## 1. Prinsip Arsitektur

1. `app/` tetap tipis: routing, page composition, dan fetch data level halaman.
2. Business logic ada di `services/`.
3. Query langsung ke Supabase ada di `services/database/`.
4. Server actions adalah jembatan input user ke service layer.
5. Shared UI primitives tetap di `components/ui/`.
6. Struktur domain existing dihormati; refactor ke bentuk ideal dilakukan bertahap, bukan big-bang.

---

## 2. Struktur Aktual yang Harus Diikuti

```txt
app/
├── (customer)/                 Public storefront
│   ├── page.tsx
│   ├── catalog/
│   ├── product/[slug]/
│   ├── cart/
│   ├── checkout/
│   ├── privacy/
│   ├── terms/
│   └── cookie-policy/
├── admin/
│   ├── login/
│   └── dashboard/
│       ├── page.tsx
│       ├── products/
│       ├── orders/
│       ├── colors/
│       └── showcase/
└── components-showcase/

components/
├── ui/
├── layout/
├── providers/
├── admin/
└── product/

context/
└── cart-context.tsx

features/
└── products/ProductNavProvider.tsx

lib/
├── actions.ts
├── admin-actions.ts
├── errors.ts
├── image-utils.ts
├── sharp-compress.ts
├── supabase.ts
└── validations/

services/
├── database/
├── product.service.ts
├── order.service.ts
├── showcase.service.ts
└── storage.service.ts
```

---

## 3. Placement Rules

### `app/`

- Halaman dan layout saja.
- Fetch data boleh dilakukan di page/layout server component.
- Jangan taruh business logic berat di sini.

### `components/ui/`

- Primitive reusable.
- Tidak boleh tahu domain produk/order/admin.

### `components/layout/`

- Shell UI global seperti navbar, footer, cart sheet, cookie consent.

### `components/product/`

- Domain UI storefront yang sudah eksis.
- Gunakan folder ini saat mengedit area catalog/product existing.

### `components/admin/`

- Domain UI admin yang sudah eksis.
- Gunakan folder ini saat mengedit form/table/action UI admin existing.

### `features/`

- Dipakai jika sebuah modul baru memang layak dicolocate penuh per domain.
- Jangan paksa memindahkan modul lama ke `features/` tanpa task refactor yang jelas.

### `context/`

- Hanya untuk global UI state yang memang non-shareable via URL.
- Contoh saat ini: cart state.

### `lib/`

- Utilitas agnostik, validation, helper action, client config.
- `lib/admin-actions.ts` untuk mutasi admin.
- `lib/actions.ts` untuk auth/public mutations.

### `services/database/`

- Source of truth untuk query Supabase.
- Jangan query Supabase langsung dari component client.

### `services/*.service.ts`

- Tempat business rules dan orchestration antarlayer.
- Service boleh memanggil repository dan storage service.

---

## 4. Data Flow yang Dipakai

### Read

```txt
Page / Server Component
→ services/database/*
→ Supabase
→ component props
```

### Write

```txt
Form
→ server action
→ Zod validation
→ service
→ repository / storage
→ Supabase
```

---

## 5. Incremental Refactor Policy

- Jangan memindahkan file hanya untuk mengejar struktur ideal.
- Jika task menyentuh area lama, pertahankan struktur lama kecuali ada manfaat nyata.
- Jika membuat modul baru yang self-contained, prefer `features/{domain}`.
- Jika refactor struktur dilakukan, lakukan scoped per domain, bukan seluruh repo sekaligus.

---

## 6. Import Rules

### Boleh

- `app/*` → `components/*`, `lib/*`, `services/*`, `context/*`, `features/*`
- `components/admin/*` → `components/ui/*`, `components/layout/*`, `lib/*`, `services/*`
- `components/product/*` → `components/ui/*`, `lib/*`, `services/*`, `features/*`
- `services/*` → `services/database/*`, `lib/*`

### Hindari

- Query Supabase langsung dari client component
- Business logic langsung di page
- Storage mutation langsung dari component
- Mengakses `SUPABASE_SERVICE_ROLE_KEY` di browser code

---

## 7. Routing Notes

- Public storefront saat ini berada di route group `(customer)`.
- Admin area berada di `/admin/dashboard/*`.
- Login admin berada di `/admin/login`.
- Route group `(customer)` adalah struktur aktual; jangan diganti ke `(public)` / `(shop)` tanpa refactor routing yang memang disengaja.

---

## 8. Practical Guidance

- Tambah atau edit mutation admin: mulai dari `lib/admin-actions.ts`.
- Tambah query baru: mulai dari `services/database/*`.
- Tambah aturan bisnis: mulai dari `services/*.service.ts`.
- Tambah UI admin existing: letakkan di `components/admin`.
- Tambah UI storefront existing: letakkan di `components/product`.
