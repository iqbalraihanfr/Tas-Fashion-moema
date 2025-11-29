**tas-branded-ecommerce-brief.md**

```
# TAS BRANDED E-COMMERCE – FULL TECHNICAL BRIEF (FOR GEMINI CLI)


## 1. PROJECT GOAL
Membangun website e-commerce katalog tas branded dengan vibe premium seperti:
- https://www.pedroshoes.co.id/id/women/bags
- https://www.charleskeith.co.id/id
- https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/

Website harus:
- Clean, minimal, luxury vibe.
- Fokus pada visual produk.
- Checkout flow simple → payment → auto-generate shipping (API TBD).

---

## 2. TECH STACK

### Core Stack
- **Framework (Fullstack)**: Next.js 16+ (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Payment**: Xendit API
- **Shipping**: TBD (Shipper / J&T API / custom API)
- **Styling**: Tailwind CSS + Shadcn/UI (premium clean)
- **Validation**: Zod
- **Auth (Admin Dashboard)**: NextAuth.js (Email/Password)
- **Hosting**: Vercel
- **Image Storage**: Supabase Storage (product photos)

---

## 3. SYSTEM FEATURES

### Public (Customer Side)
- Landing page (luxury aesthetic)
- Catalog (grid, big photos, responsive)
- Product detail:
  - Multiple images
  - Price
  - Variation (if any)
  - Description
- Checkout:
  - Customer info
  - Address
  - Shipping options (auto calculate later when shipping API is chosen)
- Payment via Xendit (redirect or invoice)
- After payment success → call backend webhook
- Auto-generate shipping order (once shipping API chosen)
- Show tracking number (resi)

### Admin Dashboard
- Secure login (NextAuth)
- Product CRUD:
  - Add/edit/delete product
  - Upload multi-images
- Order list:
  - Status: pending → paid → shipped
  - Tracking number field autopopulated via shipping API
- Light analytics (optional)

---

## 4. SYSTEM FLOW

### CUSTOMER FLOW
1. Customer → Catalog Page  
2. Click product → Product Detail  
3. Checkout → Send order to DB with status `pending`  
4. Customer redirected to Xendit payment  
5. Xendit webhook → `/api/webhook/xendit`  
6. Update order → `paid`  
7. Backend call shipping API → create shipment → get tracking number  
8. Save tracking number → notify customer (email/WA optional)

---

## 5. API ROUTES (Next.js)
```

app/api/

├── products/

│ **  **├── GET (list)

│ **  **├── POST (create)

│ **  **└── [id]/PUT (update)

│

├── orders/

│ **  **├── POST (create order)

│ **  **└── [id]/PATCH (update after payment)

│

├── payment/

│ **  **├── create (Xendit invoice)

│ **  **└── webhook (Xendit callback)

│

└── shipping/

└── create (call shipping API, TBD)

```
---

## 6. DATABASE SCHEMA (Prisma)

### `Product`
- id (string UUID)
- name (string)
- slug (string)
- description (text)
- price (int)
- stock (int)
- images (string[]) — Supabase Storage URLs
- createdAt
- updatedAt

### `Order`
- id (string UUID)
- customerName (string)
- customerEmail (string)
- customerPhone (string)
- address (text)
- subtotal (int)
- shippingFee (int)
- total (int)
- paymentStatus: pending | paid | failed
- shippingStatus: idle | processing | shipped
- trackingNumber (string?)
- createdAt

### `OrderItem`
- id
- orderId
- productId
- quantity (int)
- price (int)

### `AdminUser`
- id
- email
- passwordHash

---

## 7. FOLDER STRUCTURE
```

app/

├── (customer)/

│ **  **├── page.tsx

│ **  **├── catalog/

│ **  **└── product/[slug]/

│

├── (admin)/

│ **  **├── login/

│ **  **├── dashboard/

│ **  **├── products/

│ **  **└── orders/

│

├── api/

│ **  **├── products/

│ **  **├── orders/

│ **  **├── payment/

│ **  **└── shipping/

│

components/

lib/

prisma/

styles/

```
---

## 8. DESIGN DIRECTION (REFERENSI)
Ambil inspirasi dari:
- **Pedro** → clean, spacious grid, luxury typography.
- **Charles & Keith** → minimal, elegant UI, strong shadows.
- **Hermès** → high-end feel, premium whitespace, bold imagery.

### Design Notes:
- Typography: Serif optional for premium feel, but clean sans-serif also okay (think Futura / Neue Montreal vibes).
- Large product photos.
- Tailwind classes minimal dan rapi.
- Avoid playful colors → gunakan:
  - Black / White
  - Warm beige
  - Light gray
- Micro-animations: fade, scale, smooth hover.

---

## 9. WHAT GEMINI SHOULD GENERATE
- Full folder structure for Next.js 16 App Router
- Prisma schema + migrations
- Supabase config
- Product CRUD API
- Order + Payment flow
- Xendit integration endpoints
- Shipping API placeholder file
- Full UI components:
  - Navbar, Footer
  - Product Card
  - Product Detail
  - Checkout Form
  - Admin dashboard pages
- Components using shadcn/ui with Tailwind v4
- TypeScript types
- Zod validation schema
- Environment variable template

---

## 10. ENV TEMPLATE
```
