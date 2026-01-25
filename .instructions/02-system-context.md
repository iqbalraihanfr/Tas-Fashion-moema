# 02-system-context.md

## 1. SYSTEM ARCHITECTURE & PHILOSOPHY

**System Type:** Premium E-commerce Platform (Next.js 16 + Supabase)

**CORE PHILOSOPHY: HYBRID RENDERING & PERFORMANCE**
We leverage Next.js App Router to its fullest: **Server Components** for initial load & SEO, **Client Components** for interactivity.

1.  **SEO First:** All Product Listing Pages (PLBP) and Product Detail Pages (PDP) must be Server Rendered.
2.  **Interactive Islands:** Complex UI (Cart, Filter Bar, Checkout) are Client Components.

**DATA FLOW:**
`User Action` -> `Server Action` -> `Service Layer` -> `Supabase (Data Layer)` -> `Response`

**STATE MANAGEMENT STRATEGY (Hybrid):**

1.  **URL State (Priority #1 - The "Shareable" Rule):**
    - **Library:** `nuqs` (Type-safe Search Params).
    - **Usage:** Filters (Color, Price), Pagination, Sorting, Search Queries.
    - **Rule:** If a user reloads the page, they must see the _exact_ same filtered view.

2.  **Server State (Caching & Revalidation):**
    - **Library:** `TanStack Query` (for client-side fetching/optimistic updates) OR native `fetch` (server-side).
    - **Usage:** Real-time inventory checking, User profile data.

3.  **Global Client State:**
    - **Library:** React Context (Zustand optional if complex).
    - **Usage:** Shopping Cart (`CartProvider`), Toast Notifications, User Session.

---

## 2. LAYERED ARCHITECTURE STANDARDS

To ensure **scalability** and **maintainability**, we avoid writing `supabase.from(...)` directly inside UI components.

### Layer 1: Data Access Layer (DAL)

- **Location:** `services/database/` or `lib/data/`
- **Naming:** `[entity].data.ts`
- **Role:** Wrapper around Supabase Client.
- **Responsibilities:**
  - Execute specific SQL/PostgREST queries.
  - Handle RLS (Row Level Security) context implicitly.
  - Return typed data (DTOs).
- **Rule:** No business logic here. Just strict data retrieval/mutation.

### Layer 2: Service Layer (Business Logic)

- **Location:** `services/`
- **Naming:** `[entity].service.ts`
- **Role:** The "Brain" ensuring business rules.
- **Responsibilities:**
  - **Validation:** "Can this user actually buy this?" (Stock check).
  - **Orchestration:** Create Order Record (Pending) -> Generate WhatsApp Link -> Clear Cart.
  - **Error Handling:** Throw distinct `AppError` types.
- **Rule:** THIS is where you implement "Business Logic".

### Layer 3: Presentation / Entry Points

1.  **Server Components (Pages):** Call `Service Layer` (Read-only) directly for performance.
2.  **Server Actions (Mutations):** Call `Service Layer` to perform updates (AddToBag, PlaceInquiry).
3.  **Route Handlers (API):** Handle Webhooks or External integrations.

---

## 3. TECH STACK SPECIFICS & BEST PRACTICES

### Database: Supabase (PostgreSQL)

- **Schema:** Defined in migrations (`supabase/migrations`).
- **Safety:** **Row Level Security (RLS)** must be enabled on ALL tables.
  - _Public Read:_ Products, Categories.
  - _Private Write:_ Users can only edit their own Profile/Orders.
  - _Admin Write:_ Admin role required for Product/Inventory updates.
- **Types:** Auto-generated from DB schema (`supabase gen types`).

### Auth: NextAuth.js (v5)

- **Strategy:** Supabase Adapter.
- **Session:** Handled via Middleware (`auth.config.ts`).
- **Role:** Middleware protects `/admin` and `/account` routes.

### Validation: Zod

- **Input:** All Server Actions must validate `FormData` or `JSON` using Zod schemas.
- **Env:** Use `env.mjs` or similar to validate process.env at build time.

---

## 4. CHECKOUT FLOW (WHATSAPP INQUIRY)

**Business Model:** No direct payment gateway. User confirms order -> Redirects to WhatsApp Admin.

**Flow Strategy:**

1.  **Cart Validation:** User clicks "Checkout" -> Server validates Stock & Price.
2.  **Order Record:**
    - Server creates an `Order` in Supabase with status `PENDING_INQUIRY`.
    - Why? To keep analytics and customer history even if they don't chat.
3.  **Redirect & Clear:**
    - Server returns a structured WhatsApp Link (`wa.me/...?text=...`).
    - Client clears the Cart (Context/Local Storage).
    - Client opens WhatsApp in new tab.

**WhatsApp Message Template (Best Practice):**
"Halo MOEMA, saya ingin konfirmasi pesanan:
Order ID: #ORD-1234
Nama: [Nama User]

Item Details:

1. Tas Canvas Cream (x1) - Rp 500.000
2. Leather Wallet Black (x1) - Rp 250.000

Total: Rp 750.000
Mohon info ketersediaan & pembayaran. Terima kasih."

---

## 5. FILE STORAGE & MEDIA

**Provider:** **Supabase Storage**.

**Strategy:**

1.  **Upload:**
    - **Client-Side Direct Upload:** Use Supabase standard upload flow (with RLS policies) to avoid server bottlenecks.
    - **Bucket:** `products` (Public), `avatars` (Public), `invoices` (Private).
2.  **Optimization:**
    - Use `next/image` to render.
    - Allow Supabase Image Transformations if enabled, or standard CDN.

---

## 6. ERROR HANDLING & LOGGING

**Standard:**

- **AppError:** Extend `Error` with `statusCode` and `code`.
- **Boundary:** Wrap Page Contents in `<ErrorBoundary>` (Global or Section-specific).
- **Logging:** Use structured logging (JSON) in production.

**UI Feedback:**

- **Flash Messages:** For redirect success/error (e.g., "Product Added").
- **Inline Errors:** For form validation (Zod errors).
- **Toast:** For async operation feedback.

---

## 7. EMAIL SERVICE

**Provider:** **Resend** (Recommended for Next.js) or **Nodemailer** (Generic).

**Implementation:**

- **Templates:** Use **React Email** (`@react-email/components`).
- **Location:** `emails/` folder.
- **Logic:** `services/email.service.ts` encapsulates the sending logic.
