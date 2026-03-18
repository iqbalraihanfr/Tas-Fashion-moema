import { getAllProducts } from "@/services/database/product.repository";
import { getAllColors, colorsToMap } from "@/services/database/color.repository";
import { groupProductsByBaseName } from "@/lib/product-utils";
import { loadSearchParams } from "./search-params";
import { CatalogContent } from "@/components/product/catalog-content";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, sort, search, minPrice, maxPrice } = await loadSearchParams.parse(searchParams);

  const [products, colors] = await Promise.all([
    getAllProducts({
      search: search || undefined,
      category: category || undefined,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      sort: (sort === 'price_asc' || sort === 'price_desc' || sort === 'newest') ? sort : undefined,
    }),
    getAllColors(),
  ]);

  const productGroups = groupProductsByBaseName(products);
  const colorMap = colorsToMap(colors);

  const title = search
    ? `Hasil untuk "${search}"`
    : category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : "Semua Koleksi";

  return <CatalogContent productGroups={productGroups} title={title} colorMap={colorMap} />;
}
