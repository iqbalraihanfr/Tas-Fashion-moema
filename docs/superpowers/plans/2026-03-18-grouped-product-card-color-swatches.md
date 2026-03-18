# Grouped Product Card with Dynamic Color Swatches — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded color swatches on product cards with real dynamic swatches derived from product variant data, grouped by model (`baseName`), across both the catalog and homepage.

**Architecture:** Server components fetch `Product[]` as before; a new pure utility `groupProductsByBaseName()` converts the flat list into `ProductGroup[]` before it reaches the UI. `ProductCard` becomes a client component that holds `activeIndex` state, switching images and navigation target as the user clicks swatches.

**Tech Stack:** Next.js 15 (App Router), TypeScript (strict), Tailwind CSS, Supabase

**Spec:** `docs/superpowers/specs/2026-03-18-grouped-product-card-color-swatches-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/types.ts` | Modify | Add `ProductVariant` and `ProductGroup` types |
| `lib/color-map.ts` | **Create** | Map color name strings → hex CSS values |
| `lib/product-utils.ts` | **Create** | `groupProductsByBaseName()` pure utility |
| `app/(customer)/catalog/page.tsx` | Modify | Pipe `getAllProducts()` result through grouping |
| `components/product/catalog-content.tsx` | Modify | Accept `ProductGroup[]`, update grid render + toolbar count + empty state |
| `components/ui/product-card.tsx` | Modify | Client component with active variant state + swatch buttons |
| `app/(customer)/page.tsx` | Modify | Fetch `*`, group, render `<ProductCard group={...} />` |

---

## Task 1: Add `ProductVariant` and `ProductGroup` types

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add types after the existing `Product` type**

Open `lib/types.ts`. After line 17 (the closing `};` of `Product`), add:

```ts
export type ProductVariant = {
  id: string;
  slug: string;
  color: string;
  price: number;
  images: string[];
  stock: number;
};

export type ProductGroup = {
  baseName: string;
  category: string | null;
  variants: ProductVariant[]; // order follows the originating query's sort
};
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
cd /Users/iqbalrei/ZERTOV/tasfashione-commerce
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or the same pre-existing errors as before — note the baseline).

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat(types): add ProductVariant and ProductGroup types"
```

---

## Task 2: Create `lib/color-map.ts`

**Files:**
- Create: `lib/color-map.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/color-map.ts
// Maps admin-entered color name strings to CSS hex values.
// When a new color is added via admin, add its entry here — no other file needs to change.

const COLOR_MAP: Record<string, string> = {
  "Black": "#1a1a1a",
  "White": "#f5f5f5",
  "Gray": "#9ca3af",
  "Cream": "#f5f0e8",
  "Camel": "#c19a6b",
  "Pine Brown": "#6b4c3b",
  "Tan": "#d2b48c",
  "Navy": "#1e3a5f",
  "Olive": "#6b7c45",
  "Burgundy": "#800020",
  "Dusty Pink": "#d4a5a5",
  "Sage": "#b2bfad",
};

export function colorToHex(colorName: string): string {
  return COLOR_MAP[colorName] ?? "#d4c4b7"; // fallback: neutral beige
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/color-map.ts
git commit -m "feat(lib): add color-map utility for swatch hex values"
```

---

## Task 3: Create `lib/product-utils.ts`

**Files:**
- Create: `lib/product-utils.ts`

- [ ] **Step 1: Create the file**

```ts
// lib/product-utils.ts
import { Product, ProductGroup } from "@/lib/types";

/**
 * Groups a flat list of Product records by baseName.
 * Products without a baseName are skipped (data integrity guard).
 * Variant order within each group follows the sort of the input array.
 */
export function groupProductsByBaseName(products: Product[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();

  for (const product of products) {
    if (!product.baseName) continue;

    if (!map.has(product.baseName)) {
      map.set(product.baseName, {
        baseName: product.baseName,
        category: product.category,
        variants: [],
      });
    }

    map.get(product.baseName)!.variants.push({
      id: product.id,
      slug: product.slug,
      color: product.color,
      price: product.price,
      images: product.images,
      stock: product.stock,
    });
  }

  return Array.from(map.values());
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/product-utils.ts
git commit -m "feat(lib): add groupProductsByBaseName utility"
```

---

## Task 4: Update `CatalogPage` to group products

**Files:**
- Modify: `app/(customer)/catalog/page.tsx`

- [ ] **Step 1: Add the grouping step**

Current file (full content):
```tsx
import { getAllProducts } from "@/services/database/product.repository";
import { loadSearchParams } from "./search-params";
import { CatalogContent } from "@/components/product/catalog-content";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, sort, search, minPrice, maxPrice } = await loadSearchParams.parse(searchParams);

  const products = await getAllProducts({
    search: search || undefined,
    category: category || undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    sort: (sort === 'price_asc' || sort === 'price_desc' || sort === 'newest') ? sort : undefined,
  });

  const title = search
    ? `Hasil untuk "${search}"`
    : category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Semua Koleksi";

  return <CatalogContent products={products} title={title} />;
}
```

Replace with:
```tsx
import { getAllProducts } from "@/services/database/product.repository";
import { groupProductsByBaseName } from "@/lib/product-utils";
import { loadSearchParams } from "./search-params";
import { CatalogContent } from "@/components/product/catalog-content";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, sort, search, minPrice, maxPrice } = await loadSearchParams.parse(searchParams);

  const products = await getAllProducts({
    search: search || undefined,
    category: category || undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    sort: (sort === 'price_asc' || sort === 'price_desc' || sort === 'newest') ? sort : undefined,
  });

  const productGroups = groupProductsByBaseName(products);

  const title = search
    ? `Hasil untuk "${search}"`
    : category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Semua Koleksi";

  return <CatalogContent productGroups={productGroups} title={title} />;
}
```

- [ ] **Step 2: Type-check** (will fail — CatalogContent prop not updated yet, that's expected)

```bash
npx tsc --noEmit 2>&1 | grep -i "productGroups\|products"
```

Expected: error about `productGroups` not matching `CatalogContent`'s expected prop. This is expected at this step.

- [ ] **Step 3: Commit the page change**

```bash
git add app/\(customer\)/catalog/page.tsx
git commit -m "feat(catalog): pipe getAllProducts through groupProductsByBaseName"
```

---

## Task 5: Update `CatalogContent` to accept `ProductGroup[]`

**Files:**
- Modify: `components/product/catalog-content.tsx`

- [ ] **Step 1: Apply all changes**

In `components/product/catalog-content.tsx`:

1. Add import at the top:
   ```tsx
   import { ProductGroup } from "@/lib/types";
   ```

2. **Remove** the local `interface Product` block (lines 12–18):
   ```ts
   // DELETE THIS ENTIRE BLOCK:
   interface Product {
     id: string;
     name: string;
     slug: string;
     price: number;
     images: string[];
   }
   ```

3. **Replace** `CatalogContentProps`:
   ```tsx
   // BEFORE:
   interface CatalogContentProps {
     products: Product[];
     title: string;
   }

   // AFTER:
   interface CatalogContentProps {
     productGroups: ProductGroup[];
     title: string;
   }
   ```

4. **Update** the function signature:
   ```tsx
   // BEFORE:
   export function CatalogContent({ products, title }: CatalogContentProps) {

   // AFTER:
   export function CatalogContent({ productGroups, title }: CatalogContentProps) {
   ```

5. **Update** `CatalogToolbar` `totalProducts` prop (find the line with `totalProducts={products.length}`):
   ```tsx
   // BEFORE:
   totalProducts={products.length}

   // AFTER:
   totalProducts={productGroups.length}
   ```

6. **Update** the empty state guard (find `products.length === 0`):
   ```tsx
   // BEFORE:
   {products.length === 0 ? (

   // AFTER:
   {productGroups.length === 0 ? (
   ```

7. **Update** the grid render (find the `products.map` block):
   ```tsx
   // BEFORE:
   <div className={`grid ${gridClass} gap-x-4 gap-y-10`}>
     {products.map((product) => (
       <ProductCard key={product.id} product={product} />
     ))}
   </div>

   // AFTER:
   <div className={`grid ${gridClass} gap-x-4 gap-y-10`}>
     {productGroups.map((group) => (
       <ProductCard key={group.baseName} group={group} />
     ))}
   </div>
   ```

- [ ] **Step 2: Type-check** (will still fail — ProductCard prop not updated yet)

```bash
npx tsc --noEmit 2>&1 | grep -E "error|ProductCard|group"
```

Expected: errors on `ProductCard` receiving `group` instead of `product`. Expected at this step.

- [ ] **Step 3: Commit**

```bash
git add components/product/catalog-content.tsx
git commit -m "feat(catalog-content): accept ProductGroup[] instead of Product[]"
```

---

## Task 6: Rewrite `ProductCard` as a client component

**Files:**
- Modify: `components/ui/product-card.tsx`

This is the core task. Replace the entire file with:

- [ ] **Step 1: Write the new ProductCard**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { colorToHex } from "@/lib/color-map";
import { ProductGroup } from "@/lib/types";

interface ProductCardProps {
  group: ProductGroup;
}

export default function ProductCard({ group }: ProductCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVariant = group.variants[activeIndex];

  const imageUrl = activeVariant.images?.[0] ?? "/placeholder-bag.jpg";
  const hoverImageUrl = activeVariant.images?.[1] ?? imageUrl;

  return (
    <div className="group flex flex-col h-full">
      <Link href={`/product/${activeVariant.slug}`} className="block">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-[#f5f5f5]">
          {/* Main Image */}
          <Image
            src={imageUrl}
            alt={group.baseName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
          />
          {/* Hover Image */}
          <Image
            src={hoverImageUrl}
            alt={`${group.baseName} - view 2`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 scale-105"
          />
          {/* Quick Add Badge */}
          <div className="absolute bottom-0 left-0 w-full translate-y-full bg-white/90 py-2 text-center text-[10px] font-semibold uppercase tracking-widest backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
            Quick Add
          </div>
        </div>
      </Link>

      <div className="mt-4 space-y-1 text-center">
        <Link href={`/product/${activeVariant.slug}`} className="block">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground line-clamp-1">
            {group.baseName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Rp {activeVariant.price.toLocaleString("id-ID")}
          </p>
        </Link>

        {/* Color swatches — always visible, one per variant */}
        {group.variants.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {group.variants.map((variant, i) => (
              <button
                key={variant.id}
                onClick={() => setActiveIndex(i)}
                title={variant.color}
                aria-label={variant.color}
                className={`rounded-full border transition-all duration-200 cursor-pointer ${
                  i === activeIndex
                    ? "h-3 w-3 border-foreground ring-2 ring-foreground ring-offset-1"
                    : "h-2.5 w-2.5 border-gray-300 hover:scale-110"
                }`}
                style={{ backgroundColor: colorToHex(variant.color) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Note on the wrapping structure: the card uses a `<div>` as the outer wrapper (not `<Link>`) to allow swatch `<button>` clicks without conflicting with navigation. The image and name are each wrapped in their own `<Link>`. This is valid HTML (button inside div, not inside a).

- [ ] **Step 2: Type-check — expect clean compile**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only from `app/(customer)/page.tsx` which still uses the old `product` prop. The catalog path should be clean.

- [ ] **Step 3: Commit**

```bash
git add components/ui/product-card.tsx
git commit -m "feat(product-card): rewrite as client component with dynamic color swatches"
```

---

## Task 7: Update homepage to use `ProductGroup`

**Files:**
- Modify: `app/(customer)/page.tsx`

- [ ] **Step 1: Add import and update the query + render**

At the top of `app/(customer)/page.tsx`, add the import:
```tsx
import { groupProductsByBaseName } from "@/lib/product-utils";
```

Find the Supabase query for new arrivals (currently line ~9–16):
```tsx
// BEFORE:
const [{ data: newArrivals, error }, showcases] = await Promise.all([
  supabase
    .from('Product')
    .select('id, name, slug, price, images')
    .eq('is_archived', false)
    .order('createdAt', { ascending: false })
    .limit(8),
  showcaseService.getActiveShowcases(),
]);
```

Change `select(...)` to `select('*')`:
```tsx
// AFTER:
const [{ data: newArrivals, error }, showcases] = await Promise.all([
  supabase
    .from('Product')
    .select('*')
    .eq('is_archived', false)
    .order('createdAt', { ascending: false })
    .limit(8),
  showcaseService.getActiveShowcases(),
]);
```

Find the `const products = ...` line and replace it:
```tsx
// BEFORE:
const products = newArrivals || [];

// AFTER:
// Cast is safe: the project has no generated Supabase schema types,
// so newArrivals is typed as `any[]`. The cast makes the intent explicit.
const productGroups = groupProductsByBaseName((newArrivals ?? []) as import("@/lib/types").Product[]);
```

Find the grid render block:
```tsx
// BEFORE:
<div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// AFTER:
<div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
  {productGroups.map((group) => (
    <ProductCard key={group.baseName} group={group} />
  ))}
</div>
```

- [ ] **Step 2: Type-check — expect fully clean compile**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: **no errors**. All four modified files now agree on types.

- [ ] **Step 3: Commit**

```bash
git add app/\(customer\)/page.tsx
git commit -m "feat(home): group new arrivals by model, render with ProductGroup"
```

---

## Task 8: Build verification

- [ ] **Step 1: Run Next.js production build**

```bash
pnpm build 2>&1 | tail -30
```

Expected: build succeeds with no TypeScript or module errors. Warning about `select('*')` fetching more data than needed is acceptable (it's a low-traffic homepage with a limit of 8).

- [ ] **Step 2: Run dev server and manually verify**

```bash
pnpm dev
```

Check the following in the browser:

| Page | Check |
|---|---|
| `/catalog` | Each card shows model name (not color-suffixed name); swatches visible under each card; multiple swatches for multi-variant models |
| `/catalog` | Clicking a swatch switches the card image and does not navigate |
| `/catalog` | Clicking the card image or name navigates to the correct variant |
| `/catalog` | Single-variant models show no swatches (clean) |
| `/` (homepage) | "New In" section shows grouped cards with correct swatches |
| `/admin/dashboard/products` | Unchanged — all individual variants still show as separate rows |

- [ ] **Step 3: Final commit if any last-minute fixes applied**

```bash
git add -p  # stage only intentional changes
git commit -m "fix: post-verification tweaks"
```

---

## Color Map Maintenance

When admin adds a product with a new color name not in `COLOR_MAP`, the swatch will render in the fallback beige (`#d4c4b7`) rather than the correct color. To fix, add the color to `lib/color-map.ts`:

```ts
"New Color Name": "#hexvalue",
```

No other file needs to change. This is the single extension point for new colors.
