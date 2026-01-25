# 03-quality-ops-context.md

## 1. TECHNICAL SEO STANDARDS (E-COMMERCE EDITION)

**Goal:** Rank #1 for Fashion Keywords & Rich Snippets Presentation.
**Reference:** Next.js 16 Metadata API.

### Metadata Strategy (`generateMetadata`)

- **Templates:** Use `title.template` in `layout.tsx` for consistent branding.
  - _Format:_ `%s | MOEMA - Premium Luxury Bags`
- **Dynamic Product Pages:**
  - MUST fetch product data (cached) and populate:
    - `title`: Product Name.
    - `description`: Short summary (Meta Description).
    - `openGraph.images`: High-res Product Image.

### Structured Data (JSON-LD) - CRITICAL

**Why?** So Google shows "Price", "In Stock", and "Rating" stars directly in search results.

**Implementation:**

- Render a `<script type="application/ld+json">` inside the Product Detail Page (`page.tsx`).
- **Schema Type:** `Product` & `BreadcrumbList`.
- **Required Fields:**
  - `name`: Product Name.
  - `image`: Array of image URLs.
  - `offers`:
    - `@type`: `Offer`
    - `priceCurrency`: `IDR`
    - `price`: Raw number.
    - `availability`: `https://schema.org/InStock` (Dynamic check).

---

## 2. PERFORMANCE & CORE WEB VITALS (THE "PREMIUM FEEL")

**Goal:** The site must feel "Instant" (SPA-like) but indexable.
**Metrics:** LCP (Largest Contentful Paint) < 2.5s.

### Image Optimization Strategy (Fashion is visual)

- **Library:** `next/image` is MANDATORY. Never use `<img>`.
- **Hero Images (Above the Fold):**
  - MUST use `priority={true}`.
  - MUST use explicit `sizes` prop (e.g., `(max-width: 768px) 100vw, 50vw`).
- **Product Grid (Below the Fold):**
  - Lazy load automatically (default).
  - Use `placeholder="blur"` (blurDataURL) to prevent white flashes.

### Font Optimization

- **Fonts:** `next/font` (local or google).
- **Strategy:** Preload critical fonts (subset `latin`).
- **CLS Prevention:** Ensure usage of `variable` fonts to allow fallback sizing, preventing layout shifts when the custom font loads.

---

## 3. TESTING STRATEGY (PRAGMATIC)

**Philosophy:** Validation over Coverage. We test to sleep well, not to satisfy a metric.

### 1. Integration Tests (Business Logic)

- **Tool:** `Vitest`.
- **Focus:** `services/` folder.
- **Scenario:**
  - "Calculate Total Price correctly with quantity."
  - "Apply Discount Code if valid."
  - "Prevent Checkout if Stock < Request."
- **Mocking:** Mock the Database calls (`repositories`), test the Logic.

### 2. End-to-End (E2E) Tests (User Flows)

- **Tool:** `Playwright`.
- **Focus:** Critical Paths only.
  1.  **Guest Checkout Flow:** Open Home -> Click Product -> Add to Cart -> Click Checkout -> Verify WhatsApp Link Generated.
  2.  **Search Flow:** Type bag name -> Verify Result appears.

### 3. What to SKIP

- **Unit Testing UI:** Do not test if a button is "blue". Visual checks are manual.
- **Snapshot Testing:** Too brittle for a design-heavy project.

---

## 4. SECURITY & DATA SAFETY

### Input Validation (The First Line of Defense)

- **Zod Schema:** Every Server Action must parse input with Zod.
  - _Anti-Pattern:_ Trusting `formData.get('price')` directly.
  - _Best Practice:_ `ProductSchema.parse(data)`.

### Database Security (Supabase RLS)

- **Rule:** NOTHING is public by default except Product Reads.
- **Policies:**
  - `products`: Public Read, Admin Write.
  - `users`: Self Read/Write only.
  - `orders`: Self Read, Admin Read.

### Asset Security

- **Public Bucket:** Product images, Avatars (Read-only public).
- **No Delete:** Clients cannot DELETE files. Only Admins via Dashboard.

---

## 5. MONITORING & LOGGING

### Error Logging

- **Tool:** Supabase Logs / Sentry (Free Tier).
- **Filter:** specific `AppError` vs generic `500 Crash`.

### Analytics (Privacy Friendly)

- **Tool:** Vercel Analytics.
- **Goal:** Track "Add to Cart" conversion rate.

---

## 6. ACCESSIBILITY (A11Y) - INCLUSIVE LUXURY

**Standard:** WCAG 2.1 AA.

- **Keyboard Nav:** Users must be able to Tab through the Menu and Filter bar.
- **Alt Text:** ALL Product images need description.
  - _Bad:_ "bag.jpg"
  - _Good:_ "Cream Canvas Tote Bag with Leather Strap detail."
- **Contrast:** Ensure the light grey text (`#CFCCA7`) is legible against white. If not, darken it for text usage (`#89801D`).
