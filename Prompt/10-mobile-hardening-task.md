# 10 · MOBILE HARDENING TASK

> Dokumen ini adalah brief eksekusi untuk AI lain.
> Fokusnya bukan redesign besar, tetapi hardening mobile storefront berdasarkan hasil QA yang sudah ada.

---

## 1. Current Status

Baseline storefront mobile saat ini sudah lebih stabil:

- mobile header state sudah dirapikan
- overlay dan z-index utama sudah lebih terkontrol
- sticky add-to-bag mobile sudah diuji
- smoke E2E sudah lolos di:
  - desktop Chrome
  - mobile Chrome
  - mobile Safari (Playwright WebKit)

Hasil verifikasi terakhir:

```bash
pnpm test
pnpm test:e2e:smoke
pnpm exec playwright test tests/e2e/mobile-navigation.spec.ts --project='Mobile Chrome' --project='Mobile Safari'
```

Namun masih ada beberapa prioritas lanjutan yang perlu dikerjakan agar pengalaman mobile lebih kuat di penggunaan nyata.

---

## 2. Goal

Tujuan task ini:

1. Menguatkan UX dan robustness storefront mobile pada device nyata
2. Menutup gap yang belum tercakup oleh emulation/browser automation
3. Menjaga implementasi tetap scalable dan maintainable

---

## 3. Architecture Rule

Gunakan aturan ini saat mengerjakan:

1. Jangan menjadikan `hooks/use-mobile.ts` sebagai pola utama layout logic
2. Utamakan:
   - CSS responsive
   - breakpoint Tailwind/CSS
   - state UI tunggal yang eksplisit
3. Hook viewport seperti `useIsMobile()` hanya boleh dipakai jika memang ada behavior JavaScript yang tidak bisa ditentukan dengan CSS saja
4. Jangan membuat branching `if (isMobile)` di banyak tempat untuk kasus yang bisa diselesaikan oleh CSS

Alasan:

- lebih maintainable
- lebih kecil risiko hydration mismatch
- tidak mudah drift antara state JS dan tampilan CSS

---

## 4. Priority Tasks

### P1. Real Device Validation

Validasi pada device fisik, terutama iPhone Safari.

Fokus cek:

1. keyboard overlay saat search / form input
2. address bar collapse/expand
3. safe-area bottom pada CTA tetap
4. inertial scrolling
5. sticky CTA saat scroll panjang
6. cart drawer / sheet behavior

Output yang diharapkan:

- daftar issue nyata di device fisik
- perbedaan antara emulation vs device nyata
- fix yang diperlukan jika ditemukan bug

### P2. Mobile Form And Keyboard Robustness

Audit semua area input penting pada mobile:

1. search pada navbar
2. cart page / bag interactions
3. checkout form / checkout shell

Yang harus dicek:

1. input tidak tertutup keyboard
2. tombol submit / CTA tetap bisa dijangkau
3. viewport tidak “meloncat” berlebihan
4. focus state tidak hilang saat overlay buka/tutup
5. layout tidak rusak pada viewport pendek

### P3. Short Viewport Hardening

Tambahkan coverage untuk layar mobile pendek.

Contoh target:

1. iPhone SE-like height
2. Android viewport pendek

Yang harus diverifikasi:

1. sticky CTA tidak menutupi konten penting
2. cookie consent tidak bentrok dengan bottom CTA
3. search/menu/cart overlay tetap usable
4. checkout CTA tetap reachable

### P4. Data Quality Discipline For Public Product Links

Hardening sebelumnya sudah menambah guard untuk slug kosong, tetapi kualitas data tetap perlu dijaga dari source.

Yang perlu dilakukan:

1. audit product data publik yang masih berpotensi menghasilkan link invalid
2. pastikan slug publik selalu valid
3. pastikan archived product tidak muncul di storefront
4. tambahkan validasi atau admin-side feedback bila ada data produk yang tidak layak tampil

---

## 5. Suggested Files To Inspect

- `components/layout/navbar.tsx`
- `components/layout/cookie-consent.tsx`
- `components/product/product-detail-client.tsx`
- `components/ui/sheet.tsx`
- `app/globals.css`
- `app/(customer)/checkout/*`
- `app/(customer)/cart/*`
- `components/product/*`
- `components/ui/product-card.tsx`
- `lib/product-utils.ts`
- `services/database/product.repository.ts`
- `tests/e2e/mobile-navigation.spec.ts`
- `tests/e2e/storefront-smoke.spec.ts`
- `tests/e2e/cart-regression.spec.ts`
- `playwright.config.ts`

---

## 6. Testing Requirements

Minimal setelah perubahan:

```bash
pnpm test
pnpm test:e2e:mobile
pnpm test:e2e:smoke
```

Jika menambah coverage baru, prioritaskan:

1. mobile search + keyboard-sensitive flows
2. short viewport scenarios
3. sticky CTA / bottom-fixed UI
4. cart and checkout mobile usability

---

## 7. Definition Of Done

Task ini dianggap selesai jika:

1. tidak ada bug UX mobile yang jelas pada flow utama storefront
2. header/search/cart/sticky CTA aman pada viewport mobile normal dan pendek
3. hasil test mobile tetap hijau
4. tidak ada regresi pada smoke suite yang sudah ada
5. jika memakai logic viewport tambahan, penggunaannya sangat terbatas dan punya alasan teknis yang jelas
6. dokumentasi QA/context diperbarui bila scope atau baseline test berubah

---

## 8. Non-Goals

Jangan melakukan ini kecuali memang diperlukan:

1. refactor besar arsitektur frontend
2. redesign total UI mobile
3. menjadikan admin mobile sebagai prioritas utama
4. menambahkan `use-mobile` ke banyak komponen hanya untuk memisahkan mobile/desktop rendering

Admin mobile bukan fokus task ini.
Prioritas tetap buyer/storefront mobile.

---

## 9. Expected Deliverable From The Next AI

AI berikutnya diharapkan mengembalikan:

1. ringkasan temuan mobile nyata
2. list perubahan yang dilakukan
3. hasil verifikasi test
4. sisa gap atau residual risk
5. file context yang ikut diperbarui jika baseline QA berubah
