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
    const baseName = product.baseName?.trim();
    const slug = product.slug?.trim();

    if (!baseName || !slug) continue;

    if (!map.has(baseName)) {
      map.set(baseName, {
        baseName,
        category: product.category,
        variants: [],
      });
    }

    map.get(baseName)!.variants.push({
      id: product.id,
      slug,
      color: product.color,
      price: product.price,
      images: product.images,
      stock: product.stock,
    });
  }

  return Array.from(map.values()).filter((group) => group.variants.length > 0);
}
