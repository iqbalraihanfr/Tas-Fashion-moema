# 03 · SECURITY CONTEXT

> **Baca saat:** membuat API route, Server Action, form input, auth flow, atau fitur yang melibatkan data sensitif.
> Security bukan fitur tambahan — ini built-in dari awal.

---

## 1. PRINSIP KEAMANAN

1. **Never trust the client** — selalu validasi ulang di server, tidak peduli validasi di frontend
2. **Least privilege** — setiap user hanya punya akses ke apa yang mereka butuhkan
3. **Defense in depth** — jangan andalkan satu layer keamanan saja
4. **Fail secure** — saat ragu, tolak akses
5. **Audit everything** — setiap aksi sensitif harus tercatat

---

## 2. AUTHENTICATION

> **AI RULE:** Auth pattern di bawah ini adalah referensi implementasi.
> Project ini menggunakan **NextAuth.js v5 Beta** dan Supabase (bukan Prisma).
> Pattern implementasi middleware: lihat `02-architecture-context.md` Section Auth & Role Pattern.

### Pattern Wajib (berlaku di semua auth library)

1. **Session check di server** — jangan pernah trust client-side auth state saja
2. **Helper functions** — panggil auth logic melalui library wrapper resmi (`auth()`)
3. **Fail secure** — kalau session check gagal, default ke "tidak punya akses"
4. **Session expiry** — selalu set expiration (default NextAuth), jangan biarkan session hidup selamanya
5. **Rate limit auth endpoints** — login dan manipulasi data wajib dibatasi.

### Referensi Implementasi: NextAuth.js + Credentials

```typescript
// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

async function getUser(email: string) {
  const { data, error } = await supabaseAdmin
    .from("AdminUser")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data;
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await compare(password, user.passwordHash);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
});
```

### Helper: Get Session di Server

```typescript
// Di mana saja di Server Component atau Server Action
import { auth } from "@/auth";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  return session;
}
```

---

## 3. AUTHORIZATION — ROLE-BASED ACCESS CONTROL (RBAC)

> Daftar roles dan permissions: Saat ini hanya ada 1 level otorisasi, yaitu **Admin**.

### Middleware (Route Protection)

```typescript
// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
```

```typescript
// auth.config.ts — NextAuth Middleware Logic
export const authConfig = {
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin/dashboard");
      const isAuthRoute = nextUrl.pathname.startsWith("/admin/login");

      if (isAdminRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect ke /admin/login
      } else if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
    // ... Session / JWT callback
  },
  providers: [],
};
```

### Permission Check di Server Action

```typescript
// lib/admin-actions.ts
// Selalu check permission di Server Action, bukan hanya di middleware
export async function deleteProductAction(id: string) {
  // 1. Cek auth wajib di awal
  const session = await requireAuth();

  // 2. Filter input/ownership
  if (!id) return { error: "Product ID is missing." };

  // 3. Baru eksekusi
  await productService.delete(id);
  revalidatePath("/admin/dashboard/products");
  return { success: true };
}
```

---

## 4. INPUT VALIDATION — ZOD

> Schema patterns dan layer rules: lihat `02-architecture-context.md` Section Pola Per Layer (Layer 1: Schema).

### Aturan Validasi

```typescript
// Selalu gunakan .safeParse(), bukan .parse()
// .parse() throw error; .safeParse() return { success, data, error }

// ✅ Benar
const parsed = productSchema.safeParse(formDataObj);
if (!parsed.success) return { error: parsed.error.issues[0].message };
const safeData = parsed.data;

// ❌ Salah — error tidak tertangkap dengan baik
const data = productSchema.parse(formDataObj); // bisa throw unhandled exception
```

### Schema Patterns Penting

```typescript
import { z } from "zod";

// String sanitization
const nameSchema = z
  .string()
  .min(1, "Tidak boleh kosong")
  .max(100, "Maksimal 100 karakter")
  .trim();

// ID validation (Supabase standard ID)
const idSchema = z.string().uuid(); // Bila pakai UUID, else sesuaikan.

// File upload validation (Multipart FormData / Images)
const fileSchema = z
  .array(z.instanceof(File))
  .refine(
    (files) => files.every((file) => file.size < 5 * 1024 * 1024),
    "File must be under 5MB",
  );

// Form data number preprocess pattern
const stockSchema = z.preprocess(
  (a) => parseInt(z.string().parse(a), 10),
  z.number().int().nonnegative("Stock cannot be negative"),
);
```

---

## 5. ERROR MESSAGE SECURITY

> **AI RULE:** Error messages yang dikirim ke client TIDAK BOLEH mengekspos detail internal (Supabase details, PG errors).

### Aturan

| Situasi            | ❌ Jangan                                            | ✅ Gunakan                                  |
| ------------------ | ---------------------------------------------------- | ------------------------------------------- |
| Login gagal        | "Email tidak ditemukan" / "Password salah"           | "Email atau password salah"                 |
| Register duplicate | "Email sudah terdaftar"                              | "Tidak dapat membuat akun. Coba email lain" |
| Resource not found | "Product with ID abc123 not found in table products" | "Data tidak ditemukan"                      |
| Server error       | Stack trace / SQL error                              | "Terjadi kesalahan. Coba lagi nanti"        |
| Permission denied  | "User role 'user' cannot access admin panel"         | "Tidak punya akses"                         |

### Pattern di Action Layer

```typescript
try {
  const result = await productService.createProduct(parsed.data);
  return { data: result };
} catch (err) {
  // Log detail lengkap untuk debugging (server-side only)
  console.error("[CreateProductAction]", err);

  // Return pesan generik ke client
  return {
    error: "Terjadi kesalahan saat menambahkan produk. Coba lagi nanti.",
  };
}
```

---

## 6. OWASP TOP 10 — MITIGASI

### 1. Broken Access Control

**Aturan:** Middleware membatasi visual route. Server Action membatasi API mutasi. Keduanya wajib dipakai bersamaan. Jangan pernah berasumsi aksi mutasi aman hanya karena letak UI-nya ada di `/admin`.

### 2. Injection (SQL, XSS)

**Aturan:** Supabase SDK sudah menggunakan Parameterized Query dalam method `select()`, `insert()`, dll.

- ❌ Jangan pernah merajut command lewat RPC function raw dengan string literal.
- ❌ Jangan pakai `dangerouslySetInnerHTML` di front-end Next.js dengan output String yang dibuat / dikirim admin jika tidak disanitize (contohnya form Rich Text editor produk). Pakai sanitize library!

### 3. Sensitive Data Exposure

**Aturan:** Jangan pernah return seluruh row auth/password ke client.

```typescript
// ❌ Salah
const { data } = await supabaseAdmin.from("AdminUser").select("*"); // Exposes passwordHash!

// ✅ Benar
const { data } = await supabaseAdmin
  .from("AdminUser")
  .select("id, email, created_at");
```

### 4. CSRF

```
Server Actions Next.js sudah include CSRF protection built-in menggunakan Origin Headers check.
NextAuth versi terbaru (Auth.js) juga otomatis menangani cookie csrf.
```

### 5. Security Headers

```typescript
// next.config.ts
// Tambahkan header berikut untuk pengamanan frame (mencegah Clickjacking dan sniffing tipe konten)

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
];

export default {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

---

## 7. ENVIRONMENT VARIABLES — SECRETS MANAGEMENT

> Daftar env vars aktual project: lihat `00-master-context.md` Section Environment & Deployment.

**Aturan secrets:**

- ❌ Tidak pernah commit `.env` (ada di `.gitignore`)
- ❌ Tidak pernah log secrets ke console (e.g., Supabase Service Role Key)
- ❌ `NEXT_PUBLIC_` prefix hanya untuk yang benar-benar public. Contoh: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- ✅ Secrets utama seperti `AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` haram dideklarasi pakai prefix client-side.
- ✅ Pastikan koneksi Supabase di Admin / Mutator (`lib/supabase.ts`) tidak bocor ke komponen browser.

---

## 8. SECURITY RULES PER LAYER

> **AI RULE:** Terapkan rules ini SETIAP KALI menulis kode di layer yang bersangkutan.
> Ini bukan opsional — ini wajib.

### Schema Layer (`schemas.ts` / Zod Form)

- ✅ Semua input dari user WAJIB punya Zod schema
- ✅ String: selalu `.trim()`, selalu `.max()` — tidak ada string tanpa batas panjang
- ✅ Validasi Number dari input Form via `.preprocess` (casting String->Number) dengan batas negatifnya.
- ❌ Jangan pernah pakai `.parse()` — selalu `.safeParse()`

### Database Layer (`supabase.ts`, Backend Queries)

- ✅ Jangan membocorkan Service Role Key ke Public Client (`createClientComponentClient`). Supabase Admin Client **KHUSUS** dilinting dan dipanggil hanya di API / Server Actions.
- ✅ Jangan Select colum passwordHash apalagi return object raw hasil `auth.user()` mentah.

### Action Layer (`actions.ts` / `admin-actions.ts`)

- ✅ SETIAP action mutasi admin: Lakukan RequireAuth NextAuth.
- ✅ Tangkap segala error internal dengan try/catch dan bungkus dengan `{error: 'Pesan Ringkas'}`
- ❌ DILARANG Return error stack trace Postgres Supabase ke UI Form Response.

---

## 9. CHECKLIST SECURITY REVIEW

> Gunakan checklist ini sebelum merge PR/commit yang menyentuh auth/data sensitif MOEMA.

- [ ] Semua input (Produk, Image, Auth) divalidasi dengan Zod di server (`.safeParse()`)
- [ ] Auth session check ada di setiap Server Action mutasi produk.
- [ ] Field sensitif (`passwordHash`) tidak dikirim ke client (gunakan spesifik argument string `select`).
- [ ] `NEXT_PUBLIC_` hanya di sematkan pada Anonymous DB key, bukan Master token.
- [ ] Error message tidak mengekspos internal DB Error Detail ke User saat terjadi fail update product.
- [ ] Gambar dikonversi ke WebP dan dibatasi maksimal sizenya.
