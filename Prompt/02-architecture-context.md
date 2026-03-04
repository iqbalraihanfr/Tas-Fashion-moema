# 02 · ARCHITECTURE CONTEXT

> Baca saat: membuat file baru, menentukan di mana kode harus diletakkan, atau mereview PR.
> Ini adalah sumber kebenaran tunggal untuk struktur, pola kode, dan arsitektur aplikasi.
> System Type: Premium E-commerce Platform (Next.js 16 + Supabase)

---

## 1. PRINSIP ARSITEKTUR & FILOSOFI CORE

1. **Feature-based + Layered (Hybrid)** — Kode dikelompokkan per domain bisnis (`features/`, `services/`), namun tetap mengikuti lapisan teknis yang ketat (Schema → Query/DAL → Service → Action → Component).
2. **Server-first** — Server Component adalah default untuk SEO & performa utama. Client Component hanya di leaf nodes (Interactive Islands) yang butuh interaktivitas browser.
3. **Unidirectional data flow** — Data mengalir satu arah: DB → Query → Service → Action → Component. Tidak ada shortcut.
4. **Thin routes, fat services** — `app/` hanya routing. Actions hanya middleware/auth parsing. **Business logic selalu di service layer**.
5. **Colocate everything** — Test, types, schema diletakkan berdekatan dengan kode yang mendeskripsikannya (Colocate by domain). Logic yang relevan hanya ke satu domain tinggal di `features/{domain}/`, logic yang dipakai 2+ domain naik ke `services/`.
6. **Atomic UI Hierarchy** — Komponen UI mengikuti granularitas Atom → Molecule → Organism. Setiap komponen hanya boleh berada di satu tempat yang sesuai level-nya.

> Data flow overview: lihat `00-master-context.md` Section Data Flow.
> Domain list dan glossary: lihat `01-product-context.md` Section Domain Model.

---

## 2. STRICT DIRECTORY STRUCTURE

**AI INSTRUCTION:** Follow this structure exactly. Do not invent new top-level folders.

```
/
├── app/                              # Next.js App Router — ROUTING ONLY
│   ├── (public)/                     # Public marketing pages / storefront
│   ├── (shop)/                       # E-commerce flow (Shop, Product, Cart)
│   ├── (auth)/                       # Route group: layout public auth / tanpa sidebar
│   ├── admin/                        # Protected Admin Dashboard
│   ├── api/                          # HANYA untuk webhook & third-party callback
│   ├── globals.css                   # Tailwind v4 Imports & Theme tokens
│   └── layout.tsx                    # Root Layout (Providers, font, metadata)
│
├── features/                         # DOMAIN LOGIC — satu folder per domain bisnis
│   │                                 # ← ORGANISM LEVEL: Komponen yang "tahu" konteks bisnis.
│   │                                 #   Boleh fetch data, punya state, connect ke services.
│   ├── products/
│   │   ├── components/               # Smart components spesifik untuk domain produk
│   │   │   ├── ProductCard.tsx       # Tahu tentang Product type, price formatting, dll
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductFilters.tsx
│   │   ├── hooks/                    # Client-side hooks spesifik domain produk
│   │   │   └── use-product-filters.ts
│   │   ├── schemas.ts                # Zod schemas untuk produk - single source of truth
│   │   └── actions.ts                # Server Actions untuk produk - jembatan client ↔ server
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartDrawer.tsx
│   │   │   └── CartItem.tsx
│   │   ├── hooks/
│   │   │   └── use-cart.ts
│   │   └── CartProvider.tsx
│   │
│   └── orders/
│       ├── components/
│       ├── schemas.ts
│       └── actions.ts
│
├── services/                         # BUSINESS LOGIC & SHARED SERVICES (Dipakai 1 atau 2+ domain)
│   ├── database/                     # Data Access Layer / Queries — query Supabase
│   │   ├── product.repository.ts
│   │   └── order.repository.ts
│   ├── products/                     # Business logic HANYA untuk domain produk
│   │   └── product.service.ts
│   ├── orders/
│   │   └── order.service.ts
│   ├── storage/                      # Shared services untuk seluruh domain
│   │   └── storage.service.ts
│   ├── auth/
│   └── whatsapp/
│
├── components/                       # SHARED UI COMPONENTS (Bukan milik domain manapun)
│   ├── ui/                           # ← ATOM LEVEL: Komponen primitif paling kecil.
│   │   │                             #   Zero business logic, zero data fetching. Stand-alone.
│   │   │                             #   Contoh: Button, Input, Badge, Avatar, Spinner, Tooltip
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── shared/                       # ← MOLECULE LEVEL: Gabungan Atom yang BELUM tahu konteks bisnis.
│   │   │                             #   Hanya menerima data via props. Tidak fetch data sendiri.
│   │   │                             #   Contoh: PageHeader, DataTable, EmptyState, ConfirmDialog
│   │   ├── page-header.tsx
│   │   ├── data-table.tsx
│   │   └── ...
│   │
│   └── layout/                       # ← TEMPLATE LEVEL: Struktur UI persisten halaman.
│       │                             #   Header, Footer, Sidebar. Boleh fetch global data (session, dll).
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
│
├── lib/                              # Singleton & konfigurasi third-party (murni agnostik)
│   ├── utils.ts                      # cn(), formatCurrency(), dll
│   ├── constants.ts
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client config
│   │   └── server.ts                 # Supabase server config
│   └── hooks/                        # Shared hooks lintas domain (use-media-query, use-debounce)
│
├── types/                            # GLOBAL TYPES (Tidak spesifik ke satu domain)
│   └── database.types.ts             # Supabase Generated Types
│
└── supabase/                         # Migrations, DB Config, RLS policies, indexing
```

---

## 3. COMPONENT DECISION TREE — Di Mana Harus Diletakkan?

**AI INSTRUCTION:** Gunakan decision tree ini setiap kali membuat komponen baru.

```
Apakah komponen ini fetch data sendiri atau punya business logic?
│
├── YA → Masuk ke features/{domain}/components/
│         (Smart Component / Organism — tahu konteks bisnis)
│
└── TIDAK → Apakah ia hanya menerima data via props?
            │
            ├── Apakah ini struktur layout halaman (Header, Sidebar)?
            │   └── → components/layout/      (TEMPLATE)
            │
            ├── Apakah ini primitif terkecil (Button, Input, Icon)?
            │   └── → components/ui/          (ATOM — Wajib CVA bila memiliki 2+ variant/size)
            │
            └── Apakah ini gabungan beberapa atom (PageHeader, DataTable)?
                └── → components/shared/      (MOLECULE)
```

### ⚠️ Aturan Kritis: TIDAK ADA `components/features/`

| Sebelumnya (Ambigu)                   | Sekarang (Jelas)                               |
| ------------------------------------- | ---------------------------------------------- |
| `components/features/ProductCard.tsx` | `features/products/components/ProductCard.tsx` |
| `components/features/CartDrawer.tsx`  | `features/cart/components/CartDrawer.tsx`      |

**Rule:** Jika komponen "tahu" tentang domain bisnis tertentu → dia selalu milik `features/{domain}/components/`.

---

## 4. ATOMIC DESIGN TAXONOMY (Panduan Granularitas)

**AI INSTRUCTION:** Gunakan level ini untuk menentukan seberapa "kecil" suatu komponen harus dibuat.

### Atom (`components/ui/`)

- Unit terkecil yang tidak bisa dipecah lagi.
- Zero business logic, zero data fetching.
- Props hanya untuk konfigurasi visual: `variant`, `size`, `disabled`, `className`.
- **Wajib menggunakan CVA** untuk variant management jika punya 2+ variant atau 2+ ukuran.
- Contoh: `Button`, `Input`, `Label`, `Badge`, `Avatar`, `Spinner`, `Checkbox`, `Tooltip`.

### Molecule (`components/shared/`)

- Gabungan 2+ Atom yang membentuk unit fungsional.
- Tidak tahu konteks bisnis — hanya menerima data generik via props.
- Boleh punya internal UI state ringan (open/close dropdown, hover).
- Tidak boleh fetch data sendiri.
- **Boleh menggunakan CVA** jika punya variant opsional.
- Contoh: `PageHeader`, `DataTable`, `EmptyState`, `SearchBar`, `ConfirmDialog`, `Pagination`.

### Organism (`features/{domain}/components/`)

- Komponen yang sudah "tahu" konteks bisnis spesifik (Gabungan Molecules).
- Boleh fetch data, connect ke hooks domain, punya server/client logic.
- Menggunakan Atom dan Molecule sebagai building blocks.
- Contoh: `ProductCard`, `CartDrawer`, `OrderTable`, `CheckoutForm`.

### Template (`components/layout/` + `app/*/layout.tsx`)

- Struktur skeleton / layout halaman persisten yang tidak re-render saat navigasi.
- Boleh fetch global data (session, user profile).
- Contoh: `DashboardLayout`, `Header`, `Sidebar`, `Footer`.

### Page (`app/*/page.tsx`)

- Template + data nyata dari service.
- Hanya di `app/` directory.
- Harus sangat tipis: fetch data → pass ke Organism.
- Tidak ada logic kompleks di sini.

---

## 5. HYBRID SERVICE RULE

**AI GUIDE:** Gunakan rule ini untuk memutuskan di mana logic harus tinggal.

```
Logic ini hanya relevan untuk satu domain bisnis?
│
├── YA → services/{domain}/*.service.ts        (Colocated Service)
│         Contoh: validations produk, ketersediaan stok
│
└── TIDAK (dipakai 2+ domain) → services/{shared-name}/*.service.ts  (Shared Service)
          Contoh: email (auth+billing), storage (produk+avatar)
```

---

## 6. ATURAN IMPORT

```
✅ BOLEH:
  app/                    → features/, components/, lib/, services/, hooks/
  features/{domain}/      → components/, lib/, hooks/, services/, types/
  features/{domain}/      → features/{other-domain}/ (Gunakan services/ sebagai mediator jika butuh logic)
  services/               → lib/, types/
  components/shared/      → components/ui/, lib/, hooks/
  components/layout/      → components/ui/, components/shared/, lib/, hooks/
  components/ui/          → lib/ SAJA

❌ DILARANG:
  components/ui/          → features/, services/, components/shared/  (atom harus agnostik)
  components/shared/      → features/, services/                      (molecule harus agnostik)
  features/A              → import langsung features/B (Gunakan `services/` sebagai mediator).
  lib/                    → features/, services/                      (lib harus agnostik)
  services/A              → import dari services/B (Gunakan callback/event jika benar-benar butuh coupling)
```

---

## 7. CORE DATA MODELS (The Source of Truth / Tabel Supabase)

**AI INSTRUCTION:** Gunakan field ini. Jangan halusinasi (hallucinate) field baru.

1. **`users` (profiles):** `id` (uuid, PK), `email`, `full_name`, `avatar_url`, `role` ('admin' | 'customer').
2. **`products`:** `id` (uuid), `slug` (unique), `name`, `baseName`, `sku`, `color`, `price` (int), `sale_price` (nullable), `stock` (int), `images` (text[]), `category_id`, `is_active`, `description`.
3. **`categories`:** `id`, `name`, `slug`, `image_url`.
4. **`orders`:** `id` (uuid), `user_id` (nullable), `customer_name`, `customer_phone`, `status` ('pending_inquiry' | 'confirmed' | 'shipped'), `total_amount`, `whatsapp_link`, `shipping_address`, `awb_number`.
5. **`order_items`:** `id`, `order_id`, `product_id`, `quantity`, `price_at_time`.

---

## 8. POLA PER LAYER (Strictly Enforced)

### Layer 1: Schema Validator (`schemas.ts` di dalam `features/{domain}/`)

```typescript
// features/products/schemas.ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0),
});

// Schema adalah single source of truth — type diturunkan dari schema
export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### Layer 2: Query / Data Access Layer (`services/database/`)

```typescript
// services/database/product.repository.ts
// Hanya berisi database queries — tidak ada HTTP/business logic kompleks
import { createServerClient } from "@/lib/supabase/server";

export const productQueries = {
  findById: async (id: string) => {
    const supabase = await createServerClient();
    return supabase.from("products").select().eq("id", id).single();
  },
  findAll: async () => {
    const supabase = await createServerClient();
    return supabase.from("products").select().eq("is_active", true);
  },
};
```

### Layer 3: Service Layer (`services/{domain}/`)

```typescript
// services/products/product.service.ts
// Business logic murni — tidak tahu tentang UI atau HTTP
import { productQueries } from "@/services/database/product.repository";
import type { CreateProductInput } from "@/features/products/schemas";

export const productService = {
  async getAll() {
    const { data, error } = await productQueries.findAll();
    if (error) throw new AppError("Failed to fetch products", error);
    return data;
  },
  async checkout(input: CheckoutInput) {
    /* ... */
  },
};
```

### Layer 4: Server Action (`features/{domain}/actions.ts`)

> Detail auth & role guard pattern: lihat `03-security-context.md`.

```typescript
// features/products/actions.ts
"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createProductSchema } from "./schemas";
import { productService } from "@/services/products/product.service";

export async function createProductAction(formData: FormData) {
  // 1. Auth & role check
  const session = await auth();
  if (!session || session.user.role !== "admin")
    return { error: "Unauthorized" };

  // 2. Parse & validasi input
  const parsed = createProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  // 3. Hit service (tidak ada logic bisnis di sini)
  try {
    const product = await productService.create(parsed.data);
    revalidatePath("/admin/products");
    return { data: product };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
```

### Layer 5: Page Component (`app/*/page.tsx`)

```typescript
// app/admin/products/page.tsx
// Server Component — fetch langsung ke service, tidak lewat /api/
import { productService } from "@/services/products/product.service";
import { ProductGrid } from "@/features/products/components/ProductGrid";

export default async function ProductsPage() {
  const products = await productService.getAll();
  return <ProductGrid products={products} />;
}
```

---

## 9. STATE MANAGEMENT STRATEGY (HYBRID)

1. **URL State (Priority #1):** Library `nuqs`. Untuk filters, pagination, sorting, search. Rule: reload browser = state harus sama.
2. **Server State:** Next.js Server Components + TanStack Query jika diperlukan. Untuk data produk, user base data.
3. **Global UI State:** React Context (atau Zustand bila kompleks). Untuk navigasi side menus, UI theme, carts, notifications.

---

## 10. CVA PATTERN — STANDARD UNTUK SEMUA ATOM

**AI RULE:** Semua komponen di `components/ui/` wajib menggunakan pola ini jika punya variants.

### Setup Wajib di `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Pola CVA Lengkap

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 1. Base styles dan variants
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-brand-600 text-white hover:bg-brand-700',
        secondary:   'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
        outline:     'border border-zinc-300 bg-transparent hover:bg-zinc-50',
        ghost:       'hover:bg-zinc-100 hover:text-zinc-900',
        danger:      'bg-red-600 text-white hover:bg-red-700',
        link:        'text-brand-600 underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-8 px-3 text-xs',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

// 2. Props menggabungkan HTML attributes + CVA variants
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

// 3. Implementasi — cn() wajib!
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Spinner className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// 4. Export variants untuk komposisi di komponen lain
export { Button, buttonVariants };
```

### Kapan Wajib CVA vs Tidak

| Kondisi                                      | Keputusan                                   |
| -------------------------------------------- | ------------------------------------------- |
| Komponen punya 2+ variant visual atau ukuran | ✅ Wajib CVA                                |
| Komponen hanya satu tampilan visual          | ❌ Langsung kombinasi tailwind class        |
| Molecule/Organism kompleks                   | ⚠️ Opsional, pertimbangkan properti boolean |

---

## 11. TAILWIND 4 CONVENTIONS & STYLING

> Color tokens aktual ada di file `00-master-context.md` dan `app/globals.css`.

### `globals.css`

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(97% 0.02 250);
  --color-brand-600: oklch(48% 0.22 250);
  --font-sans: "Inter Variable", sans-serif;
}

@layer components {
  /* HANYA untuk structural pattern yang muncul 3x+, selebihnya gunakan utility langsung */
  .card {
    @apply rounded-lg border border-zinc-200 bg-white p-4 shadow-sm;
  }
}
```

### Hierarki Styling (Prioritas Berurutan)

1. **Tailwind utilities** → default untuk semua komponen.
2. **CVA** → untuk Atom dengan 2+ variants.
3. **`cn()` + `className` prop** → selalu expose agar komponen bisa di-override secara aman (tailwind-merge diandalkan untuk resolve konflik).
4. **`@layer components`** → hanya untuk struktur yang sama >3 kali.
5. **❌ Dilarang:** `style={{}}` inline styling native atau magic numbers.

---

## 12. ROLE PATTERN & API ROUTES CONVENTIONS

### Server Role Guard Pattern

```typescript
// Pattern standar check role server action
const session = await auth.getSession();
if (!session) return { error: "Unauthorized" }; // Belum login
if (session.user.role !== "admin") return { error: "Forbidden" }; // Salah role
```

### API Routes (`app/api/`)

**HANYA** digunakan untuk:

- Webhook pihak ketiga
- Autenteksi Oauth Callbacks
- Endpoint aplikasi eksternal.

**JANGAN GUNAKAN** `/api/` internal fetching - Server actions atau query function wajib digunakan bersama Server Component.

---

## 13. NAMING CONVENTIONS

| Komponen Type               | Convention                | Contoh                             |
| --------------------------- | ------------------------- | ---------------------------------- |
| File React Component        | PascalCase                | `ProductCard.tsx`,`UserTable.tsx`  |
| File non-komponen           | kebab-case                | `product.service.ts`,`use-cart.ts` |
| Folder                      | kebab-case                | `features/order-management/`       |
| Hooks                       | camelCase +`use`prefix    | `useCart`,`useProductFilters`      |
| Server Actions              | camelCase +`Action`suffix | `createOrderAction`                |
| Zod Schemas                 | camelCase +`Schema`suffix | `checkoutSchema`                   |
| TypeScript Types/Interfaces | PascalCase                | `Product`,`CreateOrderInput`       |
| Service method / Fungsi     | camelCase                 | `productService.create()`          |
| Env variable                | SCREAMING_SNAKE_CASE      | `NEXT_PUBLIC_API_URL`              |

---

## 14. SERVER VS CLIENT COMPONENT

```
Butuh useState / useReducer?                → 'use client'
Butuh useEffect / lifecycle?                → 'use client'
Butuh event handler (onClick, onChange)?    → 'use client'
Butuh browser API (window, localStorage)?  → 'use client'
Butuh third-party library yang butuh DOM?  → 'use client'

Semua kondisi di atas TIDAK ada?           → Server Component (default)
```

**Golden rule:** Push `'use client'` ke leaf node serendah mungkin. Parent tree harus tetap Server Component.

---

## 15. ANTI-PATTERNS (JANGAN DILAKUKAN)

- ❌ **Logic bisnis di Server Action** — Harus di services. Action hanya proxy keamanan + validasi!
- ❌ **Fetch data di Client Component untuk data utama** — Harus Server Component jika memungkinkan.
- ❌ **Fetch internal via `/api/` route dari file Pages** — Langsung call methods seperti `productService.getAll()`.
- ❌ **Import antar `features` langsung (`features/A` <- `features/B`)** — Manfaatkan folder `services/` yang memuat logika universal.
- ❌ **Import domain ke ATOM / UI (`components/ui` <- `features/`)** — Atom murni presentasional dan agnostik, haram membawa business domain.
- ❌ **Tipe `any`** — Error TS tak terlihat, define type secukupnya menggunakan `zod` bila payload kompleks.
- ❌ **Inline style asli** — `<div style={{ marginTop: '15px' }}>` → Gunakan `className="mt-4"`.
- ❌ **Lupa CN Wrapper dalam CVA** — Komponen harus dibugkus: `cn(buttonVariants({ variant }), className)`.
