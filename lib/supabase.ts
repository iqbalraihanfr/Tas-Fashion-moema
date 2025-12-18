import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 1. Client for Public Read (Respects RLS)
// Use this in Server Components for fetching products
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Admin Client (Bypasses RLS)
// Use this ONLY in Server Actions for Admin mutations or secure Order creation
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
