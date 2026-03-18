-- =====================================================
-- MOEMA Color Table Migration
-- Run this in Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS "Color" (
  id        UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name      TEXT          UNIQUE NOT NULL,
  hex       TEXT          NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_color_name ON "Color" (name);

ALTER TABLE "Color" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read colors"  ON "Color";
DROP POLICY IF EXISTS "Admin can manage colors" ON "Color";

-- Anyone can read colors (needed by storefront)
CREATE POLICY "Public can read colors"
  ON "Color" FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service_role (admin) can write
CREATE POLICY "Admin can manage colors"
  ON "Color" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
