# Design Spec: Grouped Product Card with Dynamic Color Swatches

**Date:** 2026-03-18
**Status:** Approved
**Scope:** Storefront catalog only — admin is unaffected

---

## Problem

Every product card in the catalog shows identical hardcoded color swatches (`bg-black` and `bg-[#d4c4b7]`), regardless of the actual variants available for each model. The root cause is that `ProductCard` never received variant data — the interface was stripped to only `id, name, slug, price, images`.

---

## Goal

- One card per model (`baseName`) in the catalog grid
- Color swatches reflect the real variants stored in the database
- Clicking a swatch switches the card's image and active link to that variant
- Clicking the card navigates to the currently active variant's product page
- Admin dashboard is unchanged — it continues to manage individual color variants as separate products

---

## Architecture

### Data Flow

```
CatalogPage (server)
  → getAllProducts()           # existing, unchanged
  → groupProductsByBaseName()  # new utility
  → ProductGroup[]
      → CatalogContent        # updated interface
          → ProductCard        # rewritten as client component
```

### New Types (`lib/types.ts`)

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
  variants: ProductVariant[];  // ordered by DB insertion (createdAt desc)
};
```

`Product` type is unchanged. Admin continues to use `Product[]` throughout.

---

## New Files

### `lib/color-map.ts`

Maps admin-entered color name strings to CSS hex values for swatch rendering.

```ts
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

When a new color is added via admin, add its entry here. No other code needs to change.

### `lib/product-utils.ts`

```ts
import { Product, ProductGroup } from "@/lib/types";

export function groupProductsByBaseName(products: Product[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();

  for (const product of products) {
    const key = product.baseName;
    if (!map.has(key)) {
      map.set(key, {
        baseName: product.baseName,
        category: product.category,
        variants: [],
      });
    }
    map.get(key)!.variants.push({
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

Pure function, no side effects. Preserves the sort order returned by `getAllProducts()`.

---

## Modified Files

### `app/(customer)/catalog/page.tsx`

After `getAllProducts()`, pipe through `groupProductsByBaseName()` before passing to `CatalogContent`.

```tsx
const products = await getAllProducts({ ... });
const productGroups = groupProductsByBaseName(products);
return <CatalogContent productGroups={productGroups} title={title} />;
```

### `components/product/catalog-content.tsx`

Update the local `Product` interface and prop to accept `productGroups: ProductGroup[]`.
Map over `productGroups` instead of `products` when rendering the grid.

```tsx
interface CatalogContentProps {
  productGroups: ProductGroup[];
  title: string;
}
// ...
{productGroups.map((group) => (
  <ProductCard key={group.baseName} group={group} />
))}
```

### `components/ui/product-card.tsx`

Rewritten as a `'use client'` component. Full behaviour:

- `activeIndex` state (default `0`) selects the active variant
- Main image: `variants[activeIndex].images[0]`
- Hover image: `variants[activeIndex].images[1] ?? images[0]`
- Card `<Link>` navigates to `variants[activeIndex].slug`
- Name: `group.baseName`
- Price: `variants[activeIndex].price`
- Color swatches:
  - Rendered for all variants
  - **Always visible** (not hidden behind hover) — better UX on mobile
  - Active swatch: `ring-2 ring-offset-1 ring-foreground` + slightly larger scale
  - Inactive swatch: standard dot
  - Tooltip on hover: color name label
  - Click swatch: `setActiveIndex(i)` — no navigation, only updates card state
  - Click card image/name: navigates to active variant

---

## UX Details

| Behaviour | Decision |
|---|---|
| Swatches always visible | Yes — mobile-first, discoverability |
| Swatch click navigates | No — only changes active card state |
| Card click navigates | Yes — to active variant's slug |
| Quick Add button | Kept as-is (hover reveal) |
| Image hover effect | Kept — shows `images[1]` of active variant |
| Out-of-stock indication | Not in scope for this spec |

---

## Admin: No Changes

`products-table.tsx` already correctly uses the full `Product[]` type, showing `color`, `baseName`, `sku`, and `stock` as separate fields per row. Each color variant remains an independent product record in the database. This must stay unchanged.

`color-map.ts` is the single extension point: when a new color name is introduced via admin, its hex value is added there.

---

## Files Changed

| File | Action |
|---|---|
| `lib/types.ts` | Extend — add `ProductVariant`, `ProductGroup` |
| `lib/color-map.ts` | **New** |
| `lib/product-utils.ts` | **New** |
| `app/(customer)/catalog/page.tsx` | Edit — add grouping step |
| `components/product/catalog-content.tsx` | Edit — interface + map over groups |
| `components/ui/product-card.tsx` | Edit — client component + swatch logic |
| `components/admin/*` | **Unchanged** |
| `services/database/product.repository.ts` | **Unchanged** |

---

## Out of Scope

- Out-of-stock swatch dimming
- Color filter behaviour in catalog (still filters by individual product `color`)
- Homepage or other uses of `ProductCard` (will be aligned separately if they exist)
