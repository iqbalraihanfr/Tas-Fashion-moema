# 07 · CONTENT CONTEXT
> Baca saat: menulis copy UI, error messages, notifikasi, empty states, atau memutuskan tone komunikasi.
> Kata-kata adalah UI juga — UX writing yang buruk merusak produk yang bagus secara teknis.

---

## Brand Voice & Tone

### Kepribadian Brand
```
[Sesuaikan dengan brand kamu — ini adalah template]

ADALAH      : Membantu, jelas, ramah, profesional
BUKAN       : Formal kaku, teknis berlebihan, sok akrab
SEPERTI     : Teman yang kompeten — bicara seperti manusia, bukan manual buku
```

### Tone per Konteks

| Situasi | Tone | Contoh |
|---------|------|--------|
| Onboarding | Hangat, encouraging | "Hei! Yuk mulai setup akunmu 🎉" |
| Error | Empati, action-oriented | "Ups, ada yang salah. Coba lagi atau hubungi kami." |
| Success | Positif, ringkas | "Tersimpan! Perubahanmu sudah aktif." |
| Warning | Jelas, tidak menakutkan | "File ini akan dihapus permanen." |
| Empty state | Helpful, motivating | "Belum ada produk. Yuk tambahkan yang pertama!" |
| Loading | Informatif | "Memuat data..." (bukan "Loading...") |

---

## UX Writing Principles

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

## Error Messages

### Format Standard
```
[Apa yang salah] + [Kenapa / Apa yang diharapkan] + [Apa yang harus dilakukan]
```

### Validation Errors (Field-level)
```typescript
// features/[domain]/schemas.ts — pesan error di Zod schema
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

  phone: z.string()
    .regex(/^(\+62|0)[0-9]{9,12}$/, 'Nomor HP tidak valid (contoh: 08123456789)'),
})
```

### Server/System Errors
```typescript
// Kumpulkan semua error message di satu tempat
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

## UI Text Patterns

### Button Labels
```
✅ Action yang jelas:
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
Konfirm: Ya, Hapus [Nama Item]     ← spesifik, merah
Batal  : Batal                     ← putih/ghost, di sebelah kiri
```

### Empty States
```
Komponen yang setiap empty state harus punya:
1. Ilustrasi atau icon yang relevan
2. Judul yang menjelaskan situasi
3. Deskripsi singkat apa yang bisa dilakukan
4. CTA action (tombol)

Contoh:
  Belum ada produk                          ← judul
  Tambahkan produk pertama toko kamu        ← deskripsi
  [+ Tambah Produk]                         ← CTA
```

### Toast / Notification Messages
```typescript
// Standarisasi toast messages
export const TOAST_MESSAGES = {
  // Success
  SAVED: 'Perubahan berhasil disimpan',
  CREATED: '[Item] berhasil ditambahkan',
  DELETED: '[Item] berhasil dihapus',
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

## Bahasa & Lokalisasi

### Default Language
```
Primary   : Bahasa Indonesia
Secondary : English (untuk technical terms yang tidak ada padanannya)
```

### Aturan Bahasa Indonesia di UI
```
✅ Gunakan kata baku:
  unduh (bukan download)
  unggah (bukan upload)
  masuk (bukan login)
  daftar (bukan register)
  dasbor (atau pertahankan "dashboard" jika lebih familiar)

❌ Hindari campur bahasa berlebihan:
  "Klik tombol submit untuk save data kamu"
  → "Klik Simpan untuk menyimpan datamu"
```

### Format Regional (Indonesia)
```typescript
// lib/formatters.ts
export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
// → "Rp 150.000"

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
// → "15 Januari 2025"

export const formatRelativeTime = (date: Date) => {
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
  const diff = (date.getTime() - Date.now()) / 1000

  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second')
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}
// → "3 jam yang lalu"

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('id-ID').format(n)
// → "1.234.567"
```

---

## Accessibility (A11y) dalam Konten

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

// Status messages
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

---

## Checklist Content

Sebelum launch halaman baru:

- [ ] Semua label button menggunakan kata kerja aktif dan spesifik
- [ ] Semua error message mengikuti format: apa salah + apa harapannya + apa tindakannya
- [ ] Empty state ada di setiap list/tabel
- [ ] Loading state ada di setiap aksi async
- [ ] Confirmation dialog ada untuk aksi destruktif
- [ ] Format angka, mata uang, dan tanggal menggunakan locale `id-ID`
- [ ] Semua gambar punya alt text yang tepat
- [ ] Tidak ada Lorem ipsum atau placeholder text di production
- [ ] Tone konsisten dengan panduan brand voice
