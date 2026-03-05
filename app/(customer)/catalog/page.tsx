import { getAllProducts } from "@/services/database/product.repository";
import { loadSearchParams } from "./search-params";
import { CatalogContent } from "@/components/product/catalog-content";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, sort, search, minPrice, maxPrice } = await loadSearchParams.parse(searchParams);

  const products = await getAllProducts({
    search: search || undefined,
    category: category || undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    sort: (sort === 'price_asc' || sort === 'price_desc' || sort === 'newest') ? sort : undefined,
  });

  const title = search
    ? `Hasil untuk "${search}"`
    : category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Semua Koleksi";

  return <CatalogContent products={products} title={title} />;
}