# 01-product-context.md

## 1. PRODUCT VISION

**Project Name:** MOEMA Fashion Bags (Tasfashione Commerce)
**Tagline:** "Curated Luxury for the Modern Minimalist."
**Business Value:** To provide a premium, seamless digital shopping experience that mirrors the sophistication of high-end physical boutiques like Charles & Keith or PEDRO. The platform serves as both a catalog of curated fashion bags and a direct-to-consumer sales channel, emphasizing visual storytelling and brand prestige.

**Target Audience:**

1.  **The Modern Minimalist:** Values clean lines, neutral tones, and functional elegance.
2.  **Fashion-Forward Professionals:** Seeks high-quality accessories that elevate their daily office or event attire.
3.  **Luxury Aspirants:** Looks for premium aesthetics at an accessible luxury price point.

---

## 2. AESTHETIC DIRECTION (THE "PREMIUM" STANDARD)

**VISUAL MODE:**
You are a **Creative Director for a High-End Fashion Brand**. You do not build "websites"; you build **digital boutiques**.
**Style:** "Luxury Essentialism" (High contrast, massive whitespace, sharp typography).
**Inspiration:** **Charles & Keith** (Layout/structure), **Hermès** (Product presentation), **PEDRO** (Typography/Vibe).

**THE "ANTI-SLOP" RULES (Strictly Enforced):**

- **NO** Small images. Products are the heroes—use full-width banners and large grids.
- **NO** cluttered navigation. Keep headers clean, collapsible, and elegant.
- **NO** generic "Buy Now" buttons. Use sleek lines, subtle hovers, and uppercase text (`ADD TO BAG`).
- **NO** jarring colors. Stick strictly to the **MOEMA Luxury Palette**.
- **NO** default shadows. If depth is needed, use ultra-soft, diffused shadows or simple borders.
- **NO** messy alignment. Grid discipline is paramount. Everything must align perfectly.

**The Vibe We Want:**

- **Structure:** Editorial, asymmetric image grids, sticky scrolling details.
- **Visuals:** High-fidelity textured product shots, lifestyle photography, slow video backgrounds.
- **Feeling:** Expensive, Calm, Confident.

---

## 3. DESIGN SYSTEM SPECS

### Typography (Brand Identity)

- **Headings (Serif / Luxury):** `Cormorant Garamond` (via `font-pedro-serif`).
  - _Rule:_ Use for Editorial headers, "Our Story", and premium collection titles. ITALIC styles are encouraged for emphasis.
- **Headings (Modern / Clean):** `Futura PT` (via `font-ck-bold`).
  - _Rule:_ Use for Product Names, Categories, and Navigation.
- **Body:** `Proxima Nova` or `Inter` (via `font-pedro-sans` / `font-ck-sans`).
  - _Rule:_ High readability, generous tracking (letter-spacing) for uppercase text.

### Color Palette (MOEMA Luxury)

_Derived from `app/globals.css`_

- **Primary (Ink Black):** `#111111`
  - _Usage:_ Text, Primary Buttons, Borders (High Contrast).
- **Background (Canvas White):** `#FFFFFF`
  - _Usage:_ Main page backgrounds, Product cards.
- **Accent (MOEMA Light Olive):** `#CFCCA7`
  - _Usage:_ Secondary backgrounds, Subtle borders, Hover states.
- **Accent Deep (MOEMA Dark Olive):** `#89801D`
  - _Usage:_ Active states, Price tags, Sale indicators.

### Animation Strategy (`framer-motion`)

- **Philosophy:** "Slow and Smooth". Luxury doesn't rush.
- **Page Transitions:** Soft fade (opacity 0 -> 1) with slight Y-axis movement.
- **Image Reveal:** "Curtain" reveal or simple scaling (1.05x) on hover.
- **Micro-interactions:**
  - Buttons: Fill color from left-to-right on hover.
  - Links: Underline grows from center.

---

## 4. UI COMPONENT GENERATION PROTOCOL

**When building UI:**

1.  **Whitespace is King:** If you think there's enough space, add more padding. Luxury requires room to breathe.
2.  **Sharp Corners:** Avoid overly rounded corners (`rounded-lg` or `rounded-xl`). Prefer `rounded-none` or `rounded-sm` for a crisper, more serious look.
3.  **Borders:** Use thin, 1px borders in `#CFCCA7` (Muted) to define structure without overwhelming.
4.  **Images:** Always enforce aspect ratios (`aspect-[3/4]` or `aspect-[4/5]`) typical of fashion photography.

---

## 5. APP FLOW & SITEMAP

**Core User Journey:**

1.  **Discovery:** Hero Slider (Video) -> "New Arrivals" Horizontal Scroll -> Category Grid.
2.  **Consideration:** Product Listing (Filter by Color/Material) -> Quick View Modal.
3.  **Purchase:** Product Detail (Sticky info, large gallery) -> Drawer Cart -> Guest Checkout.

**Sitemap:**

- `/` (Home: Hero Campaign, Trending, Editorial)
- `/shop/[category]` (PLP: Bags, Wallets, Accessories)
- `/product/[slug]` (PDP: Gallery, Details, Related Items)
- `/collections/[name]` (Curated Lookbooks)
- `/cart` (Minimalist Table)
- `/checkout` (Distraction-free, Trust badges)

---

## 6. UX FALLBACKS

- **Empty Cart:** "Your bag is empty. Explore our latest collection [Link]." (Show recommended items).
- **Image Loading:** Use a solid color placeholder (`bg-moema-light`) or blur-up effect. Never show broken icons.
- **404:** "Piece Not Found." Clean typography with a "Back to Home" button.

---

## 7. CONTENT TONE

- **Voice:** Sophisticated, Descriptive, Minimal.
- **Product Descriptions:** Focus on material (leather type, hardware finish) and usage context ("Perfect for evening galas").
- **CTAs:** Direct and elegant (`SHOP NOW`, `DISCOVER`, `ADD TO BAG`).
