-- =====================================================
-- Add is_archived column to Product table
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add is_archived column (default false = active product)
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT false;

-- 2. Add index for filtering archived products (performance)
CREATE INDEX IF NOT EXISTS idx_product_is_archived ON "Product" ("is_archived");

-- 3. Update RLS policies to exclude archived products from public view
-- Drop old public policy first
DROP POLICY IF EXISTS "Public can read products" ON "Product";

-- Recreate: Public can only read NON-archived products
CREATE POLICY "Public can read products"
  ON "Product"
  FOR SELECT
  TO anon, authenticated
  USING ("is_archived" = false);

-- Admin policy stays the same (can see everything via service_role)
