# 07 · CONTENT CONTEXT

> ⚠️ **INI ADALAH TEMPLATE** — bukan context file project aktual.
> Isi semua bagian yang ditandai `[CUSTOMIZE]`. Hapus blok ini setelah selesai.

> **Baca saat:** menulis copy UI, error messages, notifikasi, empty states, atau memutuskan tone komunikasi.
> Kata-kata adalah UI juga — UX writing yang buruk merusak produk yang bagus secara teknis.

---

## 1. BRAND VOICE & TONE

### Kepribadian Brand

```
[CUSTOMIZE — sesuaikan dengan brand project]

ADALAH      : [CUSTOMIZE] — contoh: Membantu, jelas, ramah, profesional
BUKAN       : [CUSTOMIZE] — contoh: Formal kaku, teknis berlebihan, sok akrab
SEPERTI     : [CUSTOMIZE] — contoh: Teman yang kompeten — bicara seperti manusia, bukan manual buku
```

### Tone per Konteks

| Situasi | Tone | Contoh |
|---------|------|--------|
| Onboarding | Hangat, encouraging | `[CUSTOMIZE]` |
| Error | Empati, action-oriented | `[CUSTOMIZE]` |
| Success | Positif, ringkas | `[CUSTOMIZE]` |
| Warning | Jelas, tidak menakutkan | `[CUSTOMIZE]` |
| Empty state | Helpful, motivating | `[CUSTOMIZE]` |
| Loading | Informatif | `[CUSTOMIZE]` |

---

## 2. UX WRITING PRINCIPLES

### 1. Action-first, bukan status-first

```
❌ "Form submission was successful"
✅ "Perubahan tersimpan"

❌ "Error has occurred"
✅ "Gagal menyimpan. Cek koneksi internetmu."
```

### 2. User-centric, bukan system-centric

```
❌ "Invalid input detected"
✅ "Email yang kamu masukkan tidak valid"

❌ "Authentication failed"
✅ "Email atau password salah"
```

### 3. Positif, bukan negatif

```
❌ "Kamu tidak boleh mengosongkan field ini"
✅ "Nama wajib diisi"

❌ "Password kamu lemah"
✅ "Gunakan minimal 8 karakter, termasuk angka"
```

### 4. Spesifik, bukan generik

```
❌ "Terjadi kesalahan. Coba lagi."
✅ "Gagal mengunggah gambar. Pastikan ukuran di bawah 5MB."

❌ "Data tidak valid"
✅ "Nomor telepon harus diawali +62 atau 0"
```

---

## 3. ERROR MESSAGES

> Untuk error message security (jangan expose detail internal): lihat `03-security-context.md` Section Error Message Security.

### Format Standard

```
[Apa yang salah] + [Kenapa / Apa yang diharapkan] + [Apa yang harus dilakukan]
```

### Validation Errors (Field-level)

```typescript
// features/[domain]/schemas.ts — pesan error di Zod schema
// [CUSTOMIZE — sesuaikan fields dan pesan dengan domain project]
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama terlalu panjang (maks. 100 karakter)'),

  email: z.string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid (contoh: nama@email.com)'),

  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital'),
})
```

### Centralized Error Messages

> **AI RULE:** Taruh file ini di `lib/messages.ts` — bukan di dalam komponen atau action.
> Import dari sini untuk konsistensi di seluruh app.
> Untuk architecture placement: lihat `02-architecture-context.md` Section Directory Structure (`lib/`).

```typescript
// lib/messages.ts
// [CUSTOMIZE — sesuaikan pesan dengan tone brand dan bahasa project]

export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'Kamu perlu login untuk melakukan ini.',
  FORBIDDEN: 'Kamu tidak punya izin untuk melakukan ini.',
  SESSION_EXPIRED: 'Sesimu sudah berakhir. Silakan login kembali.',

  // Resource
  NOT_FOUND: 'Data yang kamu cari tidak ditemukan.',
  ALREADY_EXISTS: 'Data ini sudah ada sebelumnya.',
  CONFLICT: 'Terjadi konflik data. Refresh halaman dan coba lagi.',

  // Upload
  FILE_TOO_LARGE: 'Ukuran file terlalu besar. Maks. 5MB.',
  FILE_TYPE_INVALID: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.',

  // Network
  NETWORK_ERROR: 'Gagal terhubung ke server. Periksa koneksi internetmu.',

  // Generic fallback
  UNEXPECTED: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi support.',
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGES
```

---

## 4. UI TEXT PATTERNS

### Button Labels

```
✅ Action yang jelas dan spesifik:
  Simpan Perubahan     (bukan "Save" atau "Submit")
  Tambah Produk        (bukan "Add" atau "Create")
  Hapus Akun           (bukan "Delete")
  Kirim Undangan       (bukan "Send")
  Ya, Hapus            (konfirmasi destruktif)
  Batal                (dismiss action)

❌ Hindari:
  OK, Yes, No, Submit, Click here, More
```

### Confirmation Dialog (Destructive Actions)

```
Judul  : Hapus [Nama Item]?
Body   : [Nama Item] akan dihapus permanen dan tidak bisa dikembalikan.
Konfirm: Ya, Hapus [Nama Item]     ← spesifik, merah/destructive
Batal  : Batal                     ← ghost/secondary, di sebelah kiri
```

### Empty States

```
Setiap empty state WAJIB punya:
1. Ilustrasi atau icon yang relevan
2. Judul yang menjelaskan situasi
3. Deskripsi singkat apa yang bisa dilakukan
4. CTA action (tombol)

Contoh:
  [Icon/Ilustrasi]
  Belum ada produk                          ← judul
  Tambahkan produk pertama toko kamu        ← deskripsi
  [+ Tambah Produk]                         ← CTA
```

### Toast / Notification Messages

> Taruh di `lib/messages.ts` bersama ERROR_MESSAGES.

```typescript
// lib/messages.ts (tambahan)
// [CUSTOMIZE — sesuaikan dengan bahasa dan tone project]

export const TOAST_MESSAGES = {
  // Success
  SAVED: 'Perubahan berhasil disimpan',
  CREATED: (item: string) => `${item} berhasil ditambahkan`,
  DELETED: (item: string) => `${item} berhasil dihapus`,
  SENT: 'Pesan berhasil dikirim',
  UPLOADED: 'File berhasil diunggah',

  // Error
  SAVE_FAILED: 'Gagal menyimpan. Coba lagi.',
  DELETE_FAILED: 'Gagal menghapus. Coba lagi.',

  // Info
  COPIED: 'Disalin ke clipboard',
  LINK_COPIED: 'Link berhasil disalin',
}
```

---

## 5. MICROCOPY PATTERNS

### Placeholder Text

```
✅ Contoh format yang diharapkan:
  placeholder="nama@email.com"
  placeholder="Cari produk..."
  placeholder="08123456789"

❌ Jangan repeat label sebagai placeholder:
  <label>Email</label>
  <input placeholder="Email" />     ← redundan

❌ Jangan gunakan sebagai pengganti label:
  <input placeholder="Masukkan email" />   ← tanpa <label> = accessibility issue
```

### Helper Text

```
Taruh di bawah input, sebelum error muncul.
Gunakan untuk format yang diharapkan atau batasan.

Contoh:
  [Input Password]
  Minimal 8 karakter, termasuk angka dan huruf kapital    ← helper
  Password minimal 8 karakter                              ← error (muncul ganti helper)
```

### Tooltip

```
Gunakan untuk:
  - Menjelaskan icon button tanpa label (kebab menu, settings gear)
  - Memberikan konteks tambahan untuk field yang ambigu
  - Menjelaskan status atau badge

Jangan gunakan untuk:
  - Informasi kritis yang wajib dibaca (user bisa miss tooltip)
  - Konten panjang (lebih dari 1-2 kalimat)
```

---

## 6. LOADING & SKELETON PATTERNS

### Kapan Pakai Spinner vs Skeleton

| Situasi | Pattern | Alasan |
|---------|---------|--------|
| Button setelah klik | Spinner di dalam button + disable | User tahu aksi sedang diproses |
| Halaman pertama kali load | Skeleton | Mengurangi perceived loading time |
| Tabel/list data | Skeleton rows | User lihat bentuk konten yang akan muncul |
| Modal/dialog load data | Spinner center | Area kecil, skeleton overkill |
| Navigasi antar halaman | Skeleton atau loading.tsx | Next.js App Router handle otomatis |
| Submit form | Spinner di button | `isLoading` state di button |

### Rules

```
✅ Skeleton harus match layout konten yang akan muncul (bukan kotak random)
✅ Gunakan animasi pulse/shimmer — bukan diam
✅ Sertakan accessible label: aria-label="Memuat data" atau role="status"
❌ Jangan tampilkan spinner lebih dari 10 detik tanpa feedback tambahan
❌ Jangan tampilkan "Loading..." sebagai satu-satunya teks — tambahkan konteks
```

```typescript
// Next.js loading.tsx — otomatis jadi loading state per route segment
// app/(dashboard)/products/loading.tsx
export default function Loading() {
  return <ProductListSkeleton />    // Skeleton yang match layout ProductList
}
```

---

## 7. BAHASA & LOKALISASI

### Language Configuration

```
[CUSTOMIZE — sesuaikan bahasa project]

Primary   : [CUSTOMIZE] — contoh: Bahasa Indonesia / English
Secondary : [CUSTOMIZE] — contoh: English (untuk technical terms)
Locale    : [CUSTOMIZE] — contoh: id-ID / en-US
```

### Aturan Bahasa di UI

> `[CUSTOMIZE]` — sesuaikan aturan di bawah dengan bahasa yang dipilih.
> Contoh di bawah untuk Bahasa Indonesia:

```
✅ Gunakan istilah yang familiar bagi target user:
  masuk / login          ← pilih satu, konsisten
  daftar / register      ← pilih satu, konsisten
  dasbor / dashboard     ← "dashboard" sering lebih familiar
  unggah / upload        ← pertimbangkan audience

❌ Hindari campur bahasa berlebihan:
  "Klik tombol submit untuk save data kamu"
  → "Klik Simpan untuk menyimpan datamu"
```

### Pluralization Rules

> `[CUSTOMIZE]` — sesuaikan dengan bahasa project.

```typescript
// lib/formatters.ts

// Bahasa Indonesia: umumnya tidak berubah bentuk
// Tapi untuk UX yang baik, tetap bedakan 0 vs 1 vs banyak
export function pluralize(count: number, singular: string): string {
  if (count === 0) return `Belum ada ${singular}`
  if (count === 1) return `1 ${singular}`
  return `${count} ${singular}`
}
// pluralize(0, 'produk') → "Belum ada produk"
// pluralize(1, 'produk') → "1 produk"
// pluralize(5, 'produk') → "5 produk"

// English (jika project bilingual):
// export function pluralizeEn(count: number, singular: string, plural?: string): string {
//   if (count === 0) return `No ${plural ?? singular + 's'}`
//   if (count === 1) return `1 ${singular}`
//   return `${count} ${plural ?? singular + 's'}`
// }
```

### Format Regional

> `[CUSTOMIZE]` — sesuaikan locale, currency, dan timezone.

```typescript
// lib/formatters.ts
// [CUSTOMIZE — ganti locale dan currency sesuai project]

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {           // [CUSTOMIZE — locale]
    style: 'currency',
    currency: 'IDR',                         // [CUSTOMIZE — currency]
    minimumFractionDigits: 0,
  }).format(amount)
// → "Rp 150.000"

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {         // [CUSTOMIZE — locale]
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
// → "15 Januari 2025"

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('id-ID').format(n)   // [CUSTOMIZE — locale]
// → "1.234.567"
```

### Relative Time Format

```typescript
// lib/formatters.ts

export function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  // [CUSTOMIZE — sesuaikan label dengan bahasa project]
  if (diffSec < 60) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari yang lalu`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu yang lalu`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} bulan yang lalu`
  return `${Math.floor(diffDay / 365)} tahun yang lalu`
}
// → "Baru saja", "5 menit yang lalu", "Kemarin", "2 minggu yang lalu"
```

---

## 8. ACCESSIBILITY (A11Y) DALAM KONTEN

> Detail accessibility untuk SEO: lihat `06-seo-tech-context.md` Section Accessibility.
> Detail komponen UI: lihat `02-architecture-context.md` Section Atomic Design.

### Alt Text untuk Gambar

```tsx
// Gambar informatif → deskripsikan konten
<Image src="/product.jpg" alt="Laptop ASUS ROG Strix G15, warna Abu Electro" />

// Gambar dekoratif → alt kosong (screen reader skip)
<Image src="/decoration.svg" alt="" />

// Icon dengan aksi → describe aksi
<button aria-label="Hapus produk Laptop Gaming">
  <TrashIcon />
</button>
```

### ARIA Labels

```tsx
// Form fields
<input
  id="email"
  type="email"
  aria-describedby="email-hint"
  aria-invalid={!!errors.email}
/>
<p id="email-hint" className="text-xs text-zinc-500">
  Contoh: nama@email.com
</p>

// Status messages — toast/alert
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

---

## 9. CHECKLIST CONTENT

> Gunakan sebelum launch halaman baru.
> Lihat juga: `01-product-context.md` Section Definition of Done.

### Copy & Tone
- [ ] Semua label button menggunakan kata kerja aktif dan spesifik
- [ ] Tone konsisten dengan panduan brand voice
- [ ] Tidak ada Lorem ipsum atau placeholder text di production
- [ ] Bahasa konsisten (tidak campur aduk tanpa alasan)

### Error & Feedback
- [ ] Semua error message mengikuti format: apa salah + apa harapannya + apa tindakannya
- [ ] Error messages ada di `lib/messages.ts` (centralized, bukan inline)
- [ ] Toast messages ada untuk setiap aksi success dan error

### States
- [ ] Empty state ada di setiap list/tabel (icon + judul + deskripsi + CTA)
- [ ] Loading state ada di setiap aksi async (skeleton atau spinner sesuai konteks)
- [ ] Confirmation dialog ada untuk aksi destruktif

### Accessibility
- [ ] Semua gambar punya alt text yang tepat (informatif atau kosong untuk dekoratif)
- [ ] Form inputs punya `<label>` yang terhubung
- [ ] Status messages punya `role="alert"` atau `aria-live`

### Format
- [ ] Format angka, mata uang, dan tanggal menggunakan locale yang benar
- [ ] Relative time format berfungsi (baru saja, kemarin, dst.)
- [ ] Pluralization di-handle untuk 0, 1, dan banyak
