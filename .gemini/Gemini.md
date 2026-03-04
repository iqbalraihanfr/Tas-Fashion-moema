# MoeMa Admin Dashboard — Redesign Prompt

## Role
Act as a World-Class Senior UI Engineer and Design Systems Architect.
Redesign the admin dashboard for **MoeMa** — a premium Indonesian leather bag brand.
The admin is used internally by the brand owner to manage products, stock, and orders.
Every element must feel considered. No generic admin template energy.
Stack: **Next.js (App Router), Tailwind CSS, lucide-react, shadcn/ui.**

---

## Brand Context

**Brand:** MoeMa — Modern Leather Atelier
**Product:** Women's leather bags — totes, crossbody, clutches, mini bags
**Positioning:** Premium local brand, minimalist-modern aesthetic, Indonesian market
**Admin user:** Single internal user (brand owner / admin)
**Admin scope:** Product management, stock tracking, order monitoring

---

## Aesthetic Direction — "Warm Editorial Control Room"

```
Identity:
  High-fashion editorial magazine fused with a quiet, controlled inventory room.
  Not cold SaaS. Not startup dashboard. Think Kinfolk magazine running a warehouse.
  Warm, deliberate, spacious — but with real information hierarchy.

Palette:
  --ivory:     #F5F2EB   /* Primary background — warm off-white */
  --stone:     #E8E4DB   /* Secondary surface — card, sidebar bg */
  --ink:       #1C1B19   /* Primary text */
  --ink-muted: #6B6860   /* Secondary text, labels */
  --gold:      #8A7A52   /* Brand accent — from MoeMa logo olive/gold */
  --gold-light:#C4B483   /* Accent hover, badge fill */
  --danger:    #C0392B   /* Low stock, destructive action */
  --warn:      #C87941   /* Medium stock warning */
  --success:   #4A7C59   /* In stock, published */

Typography:
  Page titles / section headings : "Cormorant Garamond" Italic — elegant, editorial weight
  UI labels / nav / table headers : "Plus Jakarta Sans" — weight 500–600, tight tracking
  Data / SKU / numbers / meta    : "IBM Plex Mono" — weight 400, small size
  Body / descriptions            : "Plus Jakarta Sans" — weight 400

Texture:
  Subtle CSS noise overlay at 0.025 opacity — kills flat digital feel
  No harsh borders — use box-shadow: 0 1px 3px rgba(0,0,0,0.06) on cards
  Dividers: 1px solid rgba(28,27,25,0.08) — near-invisible, just structural
```

---

## Layout Architecture

### Sidebar
```
Width        : 240px fixed, bg: var(--stone)
Top          : MoeMa logo mark (SVG) + "admin." label in IBM Plex Mono
Nav items    : icon (lucide, 16px) + label, padding 10px 16px, rounded-lg
Active state : bg-[var(--gold)]/10, left border 3px solid var(--gold), text var(--gold)
Hover state  : bg-[var(--ink)]/04, transition 150ms
Sections     : "MANAGE" label (IBM Plex Mono, 10px, letter-spacing 0.12em, muted)
               → Overview, Products, Orders
               "ACCOUNT" label
               → Sign Out
Bottom       : small avatar circle + email in mono, muted
```

### Main Content Area
```
Background   : var(--ivory)
Padding      : 32px 40px
Max-width    : unconstrained — full remaining width
Header zone  : breadcrumb (mono, muted) above page title
Page title   : Cormorant Garamond Italic, ~36px, ink color
Subtitle     : Plus Jakarta Sans, 13px, muted
```

---

## Component Specs

### Stat Cards (4 cards: Total Products, Models, Colors, Total Stock)
```
Layout       : 4-column grid, gap 16px
Card style   : bg white, border-radius 12px, padding 24px
               box-shadow: 0 1px 4px rgba(0,0,0,0.06)
               left border: 3px solid var(--gold)
Icon         : lucide icon top-right, 20px, color var(--gold-light)
Number       : IBM Plex Mono, 32px, weight 600, color var(--ink)
Label        : Plus Jakarta Sans, 12px, weight 500, var(--ink-muted), uppercase, tracking wide
```

### Product Table
```
Container    : bg white, border-radius 16px, overflow hidden
               box-shadow: 0 1px 6px rgba(0,0,0,0.05)

Header row   : bg var(--stone), Plus Jakarta Sans 11px weight 600
               uppercase, tracking 0.08em, color var(--ink-muted)
               padding 12px 20px

Data row     : padding 16px 20px, border-bottom 1px solid rgba(28,27,25,0.06)
               hover: bg-[var(--gold)]/04, transition 120ms

IMAGE col    : 56x56px thumbnail, border-radius 8px, object-cover
               border: 1px solid rgba(0,0,0,0.06)

PRODUCT col  : product name in Plus Jakarta Sans weight 600 (ink)
               model · dimensions in IBM Plex Mono 11px (muted) below

SKU col      : IBM Plex Mono 12px, color var(--ink-muted)

COLOR col    : pill badge — bg var(--gold)/12, color var(--gold),
               font IBM Plex Mono 11px, padding 2px 10px, border-radius 999px

PRICE col    : IBM Plex Mono 13px, weight 500

STOCK col    : pill badge with semantic color:
               stock > 5  → bg #4A7C59/12, color #4A7C59
               stock 3–5  → bg #C87941/12, color #C87941
               stock ≤ 2  → bg #C0392B/12, color #C0392B, subtle pulse animation

ACTIONS col  : icon-only buttons, gap 8px
               PencilLine icon → hover color var(--gold)
               Trash2 icon     → hover color var(--danger)
               each: 32x32px, border-radius 8px, hover bg respective-color/08
```

### Search Bar
```
Shape        : pill, border-radius 999px
Border       : 1px solid rgba(28,27,25,0.12)
Focus        : border-color var(--gold), box-shadow 0 0 0 3px var(--gold)/12
Icon         : Search (lucide) 15px, left inside, color muted
Font         : Plus Jakarta Sans 13px
Background   : white
```

### Add Product Button
```
Style        : solid fill, bg var(--ink), color var(--ivory)
               border-radius 10px, padding 10px 20px
Icon         : Plus (lucide) 15px, left
Font         : Plus Jakarta Sans 13px weight 600
Hover        : bg var(--gold), transition 200ms
```

---

## Micro-interactions

```
Row hover          : bg transition 120ms ease-out — no jump, barely perceptible warmth
Badge pulse        : low-stock badge (≤2) gets subtle CSS animation:
                     @keyframes pulse-danger { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
                     animation: pulse-danger 2s ease-in-out infinite

Action icon hover  : icon color + bg-fill transition 150ms
Sidebar active     : left-border slides in with transition: border-width 150ms ease
Button hover       : bg-color shift, no scale — this is an admin tool, not a marketing page
Stat card          : no hover animation needed — these are KPI displays, not interactive
```

---

## DO NOT

- **Jangan gunakan warna biru apapun** — tidak ada `blue-500`, `indigo`, `sky` — ini bukan SaaS startup
- **Jangan gunakan Inter atau Roboto** — ini bukan Material dashboard
- **Jangan tombol "EDIT" dan "DELETE" teks** — icon-only, lebih editorial
- **Jangan zebra stripe agresif** — subtle row hover sudah cukup
- **Jangan shadow tebal** — `box-shadow` harus subtle, bukan `drop-shadow-xl`
- **Jangan border radius kecil** (kurang dari 8px) di card utama
- **Jangan stat card flat tanpa depth** — minimal left-border accent + shadow tipis
- **Jangan hardcode hex di JSX** — semua via CSS custom properties atau Tailwind token
- **Jangan sidebar tanpa section label** — grouping "MANAGE" dan "ACCOUNT" wajib ada
- **Jangan font size seragam** — harus ada hierarki jelas antara judul, label, data, meta
- **Jangan generic purple gradient** — tidak relevan sama sekali dengan brand MoeMa
- **Jangan table tanpa breathing room** — row padding minimum `py-4`
