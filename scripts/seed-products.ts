import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import slugify from 'slugify';

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Storage base URL for images
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/product-images/products`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ========================================
// HELPERS
// ========================================
function parsePrice(priceStr: string): number {
  // "659,900.00" -> 659900
  // "Barang rusak" -> 0 (skip this product)
  if (!priceStr || priceStr.toLowerCase().includes('rusak')) {
    return 0;
  }
  return parseInt(priceStr.replace(/[,.]/g, '').replace(/00$/, ''), 10);
}

function parseStock(stockStr: string): number {
  // "3 Pcs" -> 3
  const match = stockStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function extractBaseName(fullName: string): string {
  // "Joanna Gray" -> "Joanna"
  // "Althea Mustard green" -> "Althea"
  const words = fullName.trim().split(' ');
  return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
}

function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

function normalizeColor(color: string): string {
  // Normalize color names for consistency
  return color.trim().toLowerCase().replace(/\s+/g, '-');
}

function generateImageUrl(baseName: string, color: string): string[] {
  // Generate expected image URL based on naming convention
  const folderName = baseName.toLowerCase();
  const fileName = `${folderName}-${normalizeColor(color)}-1.webp`;
  return [`${STORAGE_BASE_URL}/${folderName}/${fileName}`];
}

// ========================================
// MAIN SEEDER
// ========================================
async function seedProducts() {
  console.log('🌱 Starting product seeder...\n');

  // 1. Read CSV
  const csvPath = join(process.cwd(), 'csv', 'Data-MOEMA.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  
  // 2. Parse CSV (semicolon separated)
  const lines = csvContent.split('\n').slice(1); // Skip header
  const products: Array<{
    name: string;
    baseName: string;
    slug: string;
    sku: string;
    color: string;
    dimensions: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
  }> = [];

  for (const line of lines) {
    const [no, namaTas, harga, kode, warna, ukuran, jumlah] = line.split(';');
    
    // Skip empty lines or header rows
    if (!namaTas || !namaTas.trim() || !harga) continue;
    
    const price = parsePrice(harga);
    
    // Skip products with invalid price (e.g., "Barang rusak")
    if (price === 0) {
      console.log(`⚠️  Skipping "${namaTas}" - Invalid price`);
      continue;
    }

    const baseName = extractBaseName(namaTas);
    const color = warna?.trim() || 'Default';
    
    products.push({
      name: namaTas.trim(),
      baseName,
      slug: generateSlug(namaTas),
      sku: kode?.trim() || '',
      color,
      dimensions: ukuran?.trim() || '',
      description: `Premium ${baseName} bag in ${color} color. Crafted with high-quality materials for the modern minimalist.`,
      price,
      stock: parseStock(jumlah || '0'),
      images: generateImageUrl(baseName, color),
    });
  }

  console.log(`📦 Found ${products.length} valid products to insert.\n`);

  // 3. Clear ALL existing products (fresh start)
  console.log('🗑️  Clearing ALL existing products...');
  const { error: deleteError } = await supabase
    .from('Product')
    .delete()
    .neq('id', ''); // This deletes all rows
  
  if (deleteError) {
    console.error('Error deleting products:', deleteError);
  } else {
    console.log('✅ All existing products deleted.\n');
  }

  // 4. Insert products
  console.log('📝 Inserting products...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    const { error } = await supabase
      .from('Product')
      .insert({
        name: product.name,
        baseName: product.baseName,
        slug: product.slug,
        sku: product.sku,
        color: product.color,
        dimensions: product.dimensions,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: product.images,
      });

    if (error) {
      console.error(`❌ Failed to insert "${product.name}":`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Inserted: ${product.name} (${product.color}) - Rp ${product.price.toLocaleString('id-ID')}`);
      successCount++;
    }
  }

  console.log('\n========================================');
  console.log(`🎉 Seeding complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('========================================\n');
}

// Run seeder
seedProducts().catch(console.error);
