// lib/product-utils.ts
import { Product, ProductGroup } from "@/lib/types";

/**
 * Groups a flat list of Product records by baseName.
 * Products without a baseName are skipped (data integrity guard).
 * Variant order within each group follows the sort of the input array.
 */
export function groupProductsByBaseName(products: Product[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();

  for (const product of products) {
    if (!product.baseName) continue;

    if (!map.has(product.baseName)) {
      map.set(product.baseName, {
        baseName: product.baseName,
        category: product.category,
        variants: [],
      });
    }

    map.get(product.baseName)!.variants.push({
      id: product.id,
      slug: product.slug,
      color: product.color,
      price: product.price,
      images: product.images,
      stock: product.stock,
    });
  }

  return Array.from(map.values());
}
