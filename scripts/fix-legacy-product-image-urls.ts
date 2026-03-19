/**
 * Audit and optionally fix legacy product image URLs stored in the Product table.
 *
 * Current valid storage format:
 *   .../storage/v1/object/public/product-images/products/{baseName}/{baseName}-{color}-{n}.webp
 *
 * Legacy broken format seen in older rows:
 *   .../storage/v1/object/public/product-images/Products/{baseName}/{baseName}-{color}-{n}.webp
 *
 * This script:
 * 1. Finds product rows using legacy `Products/` paths
 * 2. Builds candidate lowercase `products/` paths from product data
 * 3. Verifies each candidate exists in Supabase Storage
 * 4. Updates the Product row only when all mapped images are confirmed to exist
 *
 * Usage:
 *   pnpm exec tsx scripts/fix-legacy-product-image-urls.ts
 *   pnpm exec tsx scripts/fix-legacy-product-image-urls.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`;

type ProductRow = {
  id: string;
  name: string;
  baseName: string;
  color: string;
  images: string[] | null;
};

function normalizeSegment(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function extractLegacyImageNumber(url: string) {
  const match = url.match(/-(\d+)\.webp$/i);
  return match ? Number(match[1]) : 1;
}

function buildExpectedImageUrl(product: ProductRow, originalUrl: string) {
  const folder = normalizeSegment(product.baseName);
  const color = normalizeSegment(product.color);
  const imageNumber = extractLegacyImageNumber(originalUrl);
  return `${STORAGE_BASE_URL}/products/${folder}/${folder}-${color}-${imageNumber}.webp`;
}

function extractStoragePath(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length));
}

async function storageObjectExists(publicUrl: string) {
  const storagePath = extractStoragePath(publicUrl);
  if (!storagePath) {
    return false;
  }

  const lastSlash = storagePath.lastIndexOf("/");
  const folder = lastSlash === -1 ? "" : storagePath.slice(0, lastSlash);
  const fileName = lastSlash === -1 ? storagePath : storagePath.slice(lastSlash + 1);

  const { data, error } = await supabase.storage
    .from("product-images")
    .list(folder, {
      limit: 100,
      search: fileName,
    });

  if (error) {
    return false;
  }

  return (data ?? []).some((file) => file.name === fileName);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("Fetching products with legacy image URLs...\n");

  const { data, error } = await supabase
    .from("Product")
    .select("id, name, baseName, color, images");

  if (error || !data) {
    console.error("Failed to fetch products:", error);
    process.exit(1);
  }

  const candidates = (data as ProductRow[]).filter((product) =>
    (product.images ?? []).some((url) => url.includes("/product-images/Products/"))
  );

  if (candidates.length === 0) {
    console.log("No legacy product image URLs found.");
    return;
  }

  console.log(`Found ${candidates.length} product(s) with legacy image URLs.\n`);

  const fixable: Array<{
    product: ProductRow;
    from: string[];
    to: string[];
  }> = [];
  const alreadyValidLegacy: Array<{
    product: ProductRow;
    current: string[];
  }> = [];

  const needsManualReview: Array<{
    product: ProductRow;
    brokenCurrent: string[];
    missingTargets: string[];
  }> = [];

  for (const product of candidates) {
    const currentImages = product.images ?? [];
    const currentExistenceChecks = await Promise.all(
      currentImages.map((url) => storageObjectExists(url))
    );
    const brokenCurrent = currentImages.filter((_, index) => !currentExistenceChecks[index]);

    if (brokenCurrent.length === 0) {
      alreadyValidLegacy.push({
        product,
        current: currentImages,
      });
      continue;
    }

    const mappedImages = currentImages.map((url) =>
      url.includes("/product-images/Products/")
        ? buildExpectedImageUrl(product, url)
        : url
    );

    const existenceChecks = await Promise.all(mappedImages.map((url) => storageObjectExists(url)));
    const missingTargets = mappedImages.filter((_, index) => !existenceChecks[index]);

    if (missingTargets.length > 0) {
      needsManualReview.push({ product, brokenCurrent, missingTargets });
      continue;
    }

    fixable.push({
      product,
      from: currentImages,
      to: mappedImages,
    });
  }

  console.log(`Legacy rows already valid: ${alreadyValidLegacy.length}`);
  console.log(`Auto-fixable rows: ${fixable.length}`);
  console.log(`Needs manual review: ${needsManualReview.length}\n`);

  if (alreadyValidLegacy.length > 0) {
    console.log("Legacy rows still serving correctly:");
    for (const item of alreadyValidLegacy) {
      console.log(`- ${item.product.name}`);
    }
    console.log("");
  }

  if (fixable.length > 0) {
    console.log("Auto-fix candidates:");
    for (const item of fixable) {
      console.log(`- ${item.product.name}`);
      item.from.forEach((fromUrl, index) => {
        if (fromUrl !== item.to[index]) {
          console.log(`    ${fromUrl}`);
          console.log(` -> ${item.to[index]}`);
        }
      });
    }
    console.log("");
  }

  if (needsManualReview.length > 0) {
    console.log("Manual review required:");
    for (const item of needsManualReview) {
      console.log(`- ${item.product.name}`);
      item.brokenCurrent.forEach((url) => console.log(`    broken current: ${url}`));
      item.missingTargets.forEach((url) => console.log(`    missing: ${url}`));
    }
    console.log("");
  }

  if (dryRun || fixable.length === 0) {
    console.log(dryRun ? "Dry run complete." : "Nothing to update.");
    return;
  }

  console.log("Applying fixes...\n");

  for (const item of fixable) {
    const { error: updateError } = await supabase
      .from("Product")
      .update({ images: item.to })
      .eq("id", item.product.id);

    if (updateError) {
      console.error(`✗ Failed ${item.product.name}: ${updateError.message}`);
    } else {
      console.log(`✓ Updated ${item.product.name}`);
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
