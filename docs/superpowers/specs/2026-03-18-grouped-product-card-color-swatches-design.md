# Design Spec: Grouped Product Card with Dynamic Color Swatches

**Date:** 2026-03-18
**Status:** Approved
**Scope:** Storefront catalog + homepage — admin is unaffected

---

## Problem

Every product card in the catalog shows identical hardcoded color swatches (`bg-black` and `bg-[#d4c4b7]`), regardless of the actual variants available for each model. The root cause is that `ProductCard` never received variant data — the interface was stripped to only `id, name, slug, price, images`.

---

## Goal

- One card per model (`baseName`) in the catalog grid and homepage "New In" section
- Color swatches reflect the real variants stored in the database
- Clicking a swatch switches the card's image and active link to that variant
- Clicking the card navigates to the currently active variant's product page
- Admin dashboard is unchanged — it continues to manage individual color variants as separate products

---

## Architecture

### Data Flow

```
CatalogPage (server)
  → getAllProducts()            # existing, unchanged
  → groupProductsByBaseName()   # new utility
  → ProductGroup[]
      → CatalogContent          # updated interface
          → ProductCard          # rewritten as client component

Home (server)
  → Supabase query (select * instead of partial select)
  → groupProductsByBaseName()
  → ProductGroup[]
      → ProductCard
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
  variants: ProductVariant[]; // order follows the originating query's sort
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

When a new color is added via admin, add its entry here. No other code changes.

### `lib/product-utils.ts`

```ts
import { Product, ProductGroup } from "@/lib/types";

export function groupProductsByBaseName(products: Product[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();

  for (const product of products) {
    // Guard: skip products without a baseName (data integrity edge case)
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

Pure function, no side effects. Variant order within each group follows the sort of the input array (e.g., `createdAt desc` by default, or `price_asc` when user sorts by price). The default active variant (`activeIndex = 0`) is therefore the most recently added variant in default sort.

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

Three changes:
1. **Remove** the local `interface Product` (lines 12–18) — it becomes unused
2. **Import** `ProductGroup` from `@/lib/types`
3. **Update** `CatalogContentProps` to `productGroups: ProductGroup[]`
4. **Update** the grid render to map over `productGroups`:
   ```tsx
   {productGroups.map((group) => (
     <ProductCard key={group.baseName} group={group} />
   ))}
   ```
5. **Update** the empty state guard: `products.length === 0` → `productGroups.length === 0`
6. **Update** `CatalogToolbar`'s `totalProducts` prop: `products.length` → `productGroups.length` (count reflects distinct models, which is the right number to show shoppers)

### `app/(customer)/page.tsx`

The homepage currently queries only `id, name, slug, price, images`. Change to:
1. Select `*` (or add `baseName, color` to the select) so grouping has the required fields
2. Run the result through `groupProductsByBaseName()`
3. Render `<ProductCard group={group} />` instead of `<ProductCard product={product} />`

```tsx
const { data: newArrivals } = await supabase
  .from('Product')
  .select('*')
  .eq('is_archived', false)
  .order('createdAt', { ascending: false })
  .limit(8);

const productGroups = groupProductsByBaseName(newArrivals ?? []);
```

Note: `.limit(8)` now applies before grouping — the final number of cards shown may be fewer than 8 if multiple variants share a `baseName`. This is acceptable behaviour for "New In".

### `components/ui/product-card.tsx`

Rewritten as a `'use client'` component accepting `group: ProductGroup`.

**Props:**
```ts
interface ProductCardProps {
  group: ProductGroup;
}
```

**State:**
```ts
const [activeIndex, setActiveIndex] = useState(0);
const activeVariant = group.variants[activeIndex];
```

**Rendering:**
- Main image: `activeVariant.images[0] ?? "/placeholder-bag.jpg"`
- Hover image: `activeVariant.images[1] ?? activeVariant.images[0] ?? "/placeholder-bag.jpg"`
- Card `<Link>` href: `/product/${activeVariant.slug}`
- Name: `group.baseName`
- Price: `activeVariant.price`

**Color swatches:**
```tsx
<div className="mt-2 flex justify-center gap-1.5">
  {group.variants.map((variant, i) => (
    <button
      key={variant.id}
      onClick={(e) => { e.preventDefault(); setActiveIndex(i); }}
      title={variant.color}  // native tooltip — no TooltipProvider needed
      className={`rounded-full border transition-all duration-200 ${
        i === activeIndex
          ? "h-3 w-3 border-foreground ring-2 ring-foreground ring-offset-1"
          : "h-2.5 w-2.5 border-gray-300 hover:scale-110"
      }`}
      style={{ backgroundColor: colorToHex(variant.color) }}
    />
  ))}
</div>
```

Key decisions:
- **Swatches always visible** (no hover-gate) — mobile-first, improves discoverability
- **Tooltip via HTML `title`** attribute — avoids needing a `TooltipProvider` ancestor in the customer layout
- **Swatch click does not navigate** — only updates `activeIndex`; navigation happens only when the user clicks the card image or name
- **`e.preventDefault()`** inside swatch `onClick` prevents the wrapping `<Link>` from firing

---

## UX Decisions

| Behaviour | Decision |
|---|---|
| Swatches always visible | Yes — better mobile UX |
| Swatch click navigates | No — updates card state only |
| Card image/name click navigates | Yes — to active variant's slug |
| Tooltip implementation | Native `title` attribute |
| Active swatch indicator | `ring-2 ring-foreground ring-offset-1` + larger size |
| Default active variant | `index 0` = first returned by query (newest by default) |
| Quick Add button | Kept as-is (hover reveal) |
| Image hover effect | Kept — shows `images[1]` of active variant |
| Out-of-stock indication | Out of scope |

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
| `app/(customer)/page.tsx` | Edit — fetch `*`, group, pass `ProductGroup` |
| `components/product/catalog-content.tsx` | Edit — remove local interface, update props + map |
| `components/ui/product-card.tsx` | Edit — client component + swatch logic |
| `components/admin/*` | **Unchanged** |
| `services/database/product.repository.ts` | **Unchanged** |

---

## Out of Scope

- Out-of-stock swatch dimming / strikethrough
- Color filter in catalog sidebar (still filters individual product `color` field at DB level)
- Recommended products section on product detail page (uses `getRecommendedProducts`, separate concern)
