/**
 * Seed the Color table with all colors currently in COLOR_MAP.
 * Safe to run multiple times — uses upsert.
 *
 * Run AFTER executing 003_create_color_table.sql in Supabase SQL Editor.
 * Command: pnpm exec tsx scripts/seed-colors.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const COLORS: { name: string; hex: string }[] = [
  // Neutrals
  { name: 'Black',       hex: '#1a1a1a' },
  { name: 'White',       hex: '#f5f5f5' },
  { name: 'Gray',        hex: '#9ca3af' },
  { name: 'Grey',        hex: '#9ca3af' },
  { name: 'Light Grey',  hex: '#d1d5db' },
  { name: 'Silver Grey', hex: '#c0c0c0' },
  { name: 'Cream',       hex: '#f5f0e8' },
  { name: 'Ivory',       hex: '#fffff0' },
  // Browns & earth tones
  { name: 'Camel',       hex: '#c19a6b' },
  { name: 'Tan',         hex: '#d2b48c' },
  { name: 'Brown',       hex: '#8b5e3c' },
  { name: 'Pine Brown',  hex: '#6b4c3b' },
  { name: 'Chocolate',   hex: '#3d1c02' },
  { name: 'Cocoa',       hex: '#5c3d2e' },
  { name: 'Coffee',      hex: '#6f4e37' },
  { name: 'Coffe',       hex: '#6f4e37' },
  { name: 'Cappuccino',  hex: '#a07850' },
  { name: 'Caramel',     hex: '#c68642' },
  { name: 'Tawny',       hex: '#cd5700' },
  { name: 'Wheat',       hex: '#f5deb3' },
  { name: 'Oak',         hex: '#9c6b3c' },
  { name: 'Mocca',       hex: '#7b4f3a' },
  { name: 'Ebony',       hex: '#2c2416' },
  // Greens
  { name: 'Olive',               hex: '#6b7c45' },
  { name: 'Olive Green',         hex: '#6b7c45' },
  { name: 'Old Green',           hex: '#556b2f' },
  { name: 'Mustard Green',       hex: '#9a8c2c' },
  { name: 'Sage',                hex: '#b2bfad' },
  { name: 'Mung Beans (Kacang Hijau)', hex: '#5a7a3a' },
  // Blues
  { name: 'Navy',        hex: '#1e3a5f' },
  { name: 'Baby Blue',   hex: '#89cff0' },
  { name: 'Pearl Blue',  hex: '#b0c4d8' },
  // Pinks & reds
  { name: 'Dusty Pink',    hex: '#d4a5a5' },
  { name: 'Wine',          hex: '#722f37' },
  { name: 'Wine Red',      hex: '#722f37' },
  { name: 'Burgundy',      hex: '#800020' },
  { name: 'Purplish Red',  hex: '#9b2335' },
  { name: 'Red Angola',    hex: '#a0212e' },
  // Yellows & golds
  { name: 'Lemon Yellow', hex: '#fff44f' },
  { name: 'Gold',          hex: '#d4af37' },
  // Others
  { name: 'Apricot',      hex: '#fbceb1' },
  { name: 'Khaki',        hex: '#c3b091' },
];

async function main() {
  console.log(`Seeding ${COLORS.length} colors...\n`);

  const { error } = await supabase
    .from('Color')
    .upsert(COLORS, { onConflict: 'name' });

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log('Done.');
}

main();
