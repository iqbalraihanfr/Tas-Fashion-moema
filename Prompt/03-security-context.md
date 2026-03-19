# 03 · SECURITY CONTEXT

> Gunakan file ini saat mengubah auth, server action, validasi, env, atau akses data sensitif.
> Ini adalah aturan security aktual untuk repo ini.

---

## 1. Security Principles

1. Jangan percaya validasi client.
2. Middleware membantu route protection, tetapi bukan satu-satunya guard.
3. Semua mutation admin harus diverifikasi lagi di server action.
4. Secret server tidak boleh bocor ke client bundle.
5. Error ke user harus ringkas dan tidak membocorkan detail internal.

---

## 2. Authentication Aktual

- Auth stack: NextAuth.js v5 beta + Credentials provider.
- User admin diambil dari tabel `AdminUser`.
- Password dicek dengan `bcryptjs.compare`.
- Wrapper auth resmi proyek ada di [auth.ts](/Users/iqbalrei/ZERTOV/tasfashione-commerce/auth.ts).

### Route Protection

- Middleware/proxy melindungi `/admin/dashboard/*`.
- `/admin/login` harus redirect ke dashboard jika session aktif.
- Proteksi route saja tidak cukup untuk mutation.

---

## 3. Rule Wajib untuk Admin Mutations

Semua action mutasi admin di `lib/admin-actions.ts` wajib:

1. Memanggil `auth()` di awal action.
2. Mengembalikan `{ success: false, error: string }` jika session hilang atau invalid.
3. Menangkap error internal dan mengembalikan pesan ringkas ke UI.
4. Tidak mengembalikan stack trace, SQL error, atau detail storage error ke client.

### Pattern

```ts
const session = await auth();

if (!session?.user?.id) {
  return { success: false, error: "Your session has expired. Please sign in again." };
}
```

---

## 4. Validation Rules

- Gunakan Zod untuk semua input form dan params yang berasal dari user.
- Gunakan `.safeParse()`, bukan `.parse()`.
- Untuk angka dari `FormData`, gunakan `.preprocess(...)`.
- File upload harus dicek keberadaan dan ukuran wajarnya sebelum diproses lebih lanjut.

---

## 5. Supabase & Secret Handling

### Public

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server Only

- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`

### Rules

- `supabaseAdmin` hanya boleh dipakai di server code.
- Jangan pernah import helper yang memakai service role ke client component.
- `.env.example` harus selalu sinkron dengan env yang benar-benar dipakai.

---

## 6. Storage Security

- Product image final upload dilakukan dari server melalui `services/storage.service.ts`.
- Bucket produk saat ini: `product-images`.
- Path produk: `products/{baseName}/{baseName}-{color}-{number}.webp`.
- Client boleh melakukan preprocess/crop untuk UX, tetapi output final tetap dinormalisasi di server.

---

## 7. Error Handling Policy

### User-facing

- Gunakan pesan ringkas, jelas, dan aman.
- Contoh:
  - `"Your session has expired. Please sign in again."`
  - `"Failed to update order status."`
  - `"Product ID is missing."`

### Server-side logging

- `console.error(...)` di server masih boleh untuk debugging internal.
- Jangan log secret.
- Jangan kirim detail raw error itu ke UI.

---

## 8. Checklist Sebelum Merge

- Semua admin mutations punya guard `auth()`.
- Semua input form divalidasi dengan Zod.
- Tidak ada `SUPABASE_SERVICE_ROLE_KEY` di browser code.
- UI mutation penting menampilkan feedback error yang terlihat.
- `.env.example` sinkron dengan env aktual.
