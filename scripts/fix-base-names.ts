/**
 * One-time migration: fix baseName values using the product's own `color`
 * field to reliably strip the color suffix from the name.
 *
 * Logic: correctBaseName = name.replace(/ {color}$/i, '').trim()
 * Only updates rows where baseName !== that computed value.
 *
 * Run with: pnpm exec tsx scripts/fix-base-names.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function computeCorrectBaseName(name: string, color: string): string | null {
  if (!color) return null;
  const regex = new RegExp(`\\s+${escapeRegex(color)}$`, 'i');
  const stripped = name.replace(regex, '').trim();
  // Only valid if we actually removed something
  return stripped !== name ? stripped : null;
}

async function main() {
  console.log('Fetching all products...\n');
  const { data: products, error } = await supabase
    .from('Product')
    .select('id, name, baseName, color');

  if (error || !products) {
    console.error('Failed to fetch products:', error);
    process.exit(1);
  }

  const toFix: Array<{ id: string; name: string; oldBase: string; newBase: string }> = [];

  for (const p of products as { id: string; name: string; baseName: string; color: string }[]) {
    const correct = computeCorrectBaseName(p.name, p.color);
    if (correct !== null && p.baseName !== correct) {
      toFix.push({ id: p.id, name: p.name, oldBase: p.baseName, newBase: correct });
    }
  }

  if (toFix.length === 0) {
    console.log('All products look correct — nothing to fix.');
    return;
  }

  console.log(`Found ${toFix.length} product(s) to fix:\n`);
  for (const p of toFix) {
    console.log(`  "${p.name}"  baseName: "${p.oldBase}" → "${p.newBase}"`);
  }

  console.log('\nApplying fixes...');

  for (const p of toFix) {
    const { error: updateError } = await supabase
      .from('Product')
      .update({ baseName: p.newBase })
      .eq('id', p.id);

    if (updateError) {
      console.error(`  ✗ Failed "${p.name}":`, updateError.message);
    } else {
      console.log(`  ✓ "${p.name}"`);
    }
  }

  console.log('\nDone.');
}

main();
