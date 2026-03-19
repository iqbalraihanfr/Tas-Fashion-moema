import { supabaseAdmin, supabase } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { AppError } from "@/lib/errors";

export interface ProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

function filterPublicProducts(products: Product[] | null): Product[] {
  return (products ?? []).filter((product) => product.slug?.trim() && product.baseName?.trim());
}

export async function getAllProducts(filter: ProductFilter = {}): Promise<Product[]> {
  let query = supabase.from('Product').select('*').eq('is_archived', false);

  if (filter.search) {
    const s = filter.search.replace(/'/g, "''"); // escape single quotes
    query = query.or(`name.ilike.%${s}%,baseName.ilike.%${s}%,sku.ilike.%${s}%,color.ilike.%${s}%`);
  }

  if (filter.category) {
    if (filter.category === 'new-arrivals') {
      // Special case: "New Arrivals" = most recent products (already sorted by createdAt desc)
      query = query.order('createdAt', { ascending: false });
    } else {
      // Normalize slug format to Title Case for exact match
      // e.g., "shoulder-bags" → "Shoulder Bags"
      const categoryName = filter.category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      query = query.eq('category', categoryName);
    }
  }

  if (filter.minPrice != null) {
    query = query.gte('price', filter.minPrice);
  }

  if (filter.maxPrice != null) {
    query = query.lte('price', filter.maxPrice);
  }

  if (filter.sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (filter.sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('createdAt', { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Repository Error [getAllProducts]:", error);
    throw new AppError("Failed to fetch products", 500, "DATABASE_ERROR");
  }

  return filterPublicProducts(products as Product[]);
}

export async function getUniqueBaseNames(): Promise<string[]> {
  const { data, error } = await supabase
    .from('Product')
    .select('baseName')
    .eq('is_archived', false)
    .order('baseName', { ascending: true });

  if (error) {
    console.error("Repository Error [getUniqueBaseNames]:", error);
    return [];
  }

  const seen = new Set<string>();
  return (data as { baseName: string }[])
    .map((r) => r.baseName)
    .filter((n) => n && !seen.has(n) && seen.add(n));
}

export async function getVariantsByBaseName(baseName: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .eq('baseName', baseName)
    .eq('is_archived', false)
    .order('createdAt', { ascending: true });

  if (error) {
    console.error("Repository Error [getVariantsByBaseName]:", error);
    return [];
  }

  return filterPublicProducts(data as Product[]);
}

export async function getRecommendedProducts(excludeSlug: string, limit = 8): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('Product')
    .select('*')
    .eq('is_archived', false)
    .neq('slug', excludeSlug)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Repository Error [getRecommendedProducts]:", error);
    return []; // Graceful fallback — recommendations are non-critical
  }

  return filterPublicProducts(products as Product[]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data: product, error } = await supabase
    .from('Product')
    .select('*')
    .eq('slug', slug)
    .eq('is_archived', false)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Repository Error [getProductBySlug]:", error);
    throw new AppError("Failed to fetch product by slug", 500, "DATABASE_ERROR");
  }

  return product as Product | null;
}

export async function getAdminProducts(): Promise<Product[]> {
  const { data: products, error } = await supabaseAdmin
    .from('Product')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error("Repository Error [getAdminProducts]:", error);
    throw new AppError("Failed to fetch admin products", 500, "DATABASE_ERROR");
  }

  return products as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data: product, error } = await supabaseAdmin
    .from('Product')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Repository Error [getProductById]:", error);
    throw new AppError("Failed to fetch product", 500, "DATABASE_ERROR");
  }

  return product as Product | null;
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const { data: product, error } = await supabaseAdmin
    .from('Product')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Repository Error [createProduct]:", error);
    throw new AppError("Failed to create product", 500, "DATABASE_ERROR");
  }

  return product as Product;
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
  const { data: product, error } = await supabaseAdmin
    .from('Product')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Repository Error [updateProduct]:", error);
    throw new AppError("Failed to update product", 500, "DATABASE_ERROR");
  }

  return product as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('Product')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Repository Error [deleteProduct]:", error);
    throw new AppError("Failed to delete product", 500, "DATABASE_ERROR");
  }
}

export async function updateProductStock(id: string, newStock: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('Product')
    .update({ stock: newStock })
    .eq('id', id);

  if (error) {
    console.error("Repository Error [updateProductStock]:", error);
    throw new AppError("Failed to update product stock", 500, "DATABASE_ERROR");
  }
}

export async function archiveProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('Product')
    .update({ is_archived: true })
    .eq('id', id);

  if (error) {
    console.error("Repository Error [archiveProduct]:", error);
    throw new AppError("Failed to archive product", 500, "DATABASE_ERROR");
  }
}

export async function unarchiveProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('Product')
    .update({ is_archived: false })
    .eq('id', id);

  if (error) {
    console.error("Repository Error [unarchiveProduct]:", error);
    throw new AppError("Failed to unarchive product", 500, "DATABASE_ERROR");
  }
}
