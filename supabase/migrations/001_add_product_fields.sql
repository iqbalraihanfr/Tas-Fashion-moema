-- =====================================================
-- MOEMA Product Table Migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add new columns to existing Product table
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "baseName" TEXT,
ADD COLUMN IF NOT EXISTS "sku" TEXT,
ADD COLUMN IF NOT EXISTS "color" TEXT,
ADD COLUMN IF NOT EXISTS "dimensions" TEXT;

-- 2. Add index for common queries (performance)
CREATE INDEX IF NOT EXISTS idx_product_base_name ON "Product" ("baseName");
CREATE INDEX IF NOT EXISTS idx_product_sku ON "Product" ("sku");
CREATE INDEX IF NOT EXISTS idx_product_color ON "Product" ("color");

-- 3. Enable RLS
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (if any) then recreate
DROP POLICY IF EXISTS "Public can read products" ON "Product";
DROP POLICY IF EXISTS "Admin can manage products" ON "Product";

-- 5. Create RLS Policies
-- Public can read all products
CREATE POLICY "Public can read products"
  ON "Product"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role (admin) can insert/update/delete
CREATE POLICY "Admin can manage products"
  ON "Product"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
