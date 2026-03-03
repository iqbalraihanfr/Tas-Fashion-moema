import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllProducts } from "@/services/database/product.repository";
import { loadSearchParams } from "./search-params";
import { CatalogFilters, SortOptions } from "@/components/product/catalog-filters";

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

  return (
    <div className="container py-16">
       <div className="flex flex-col md:flex-row gap-20">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-72 shrink-0">
             <CatalogFilters />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
             {/* Header & Sort */}
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-8 pb-8 border-b border-muted/30">
                <div>
                    <h1 className="text-2xl font-light uppercase tracking-[0.2em]">
                        {search ? `Results for "${search}"` : category ? `${category}` : 'The Collection'}
                    </h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-2 font-bold">
                        {products.length} Exquisite Pieces
                    </p>
                </div>
                
                <SortOptions />
             </div>

             {/* Main Grid */}
             {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 border border-dashed border-muted text-center">
                    <p className="text-muted-foreground uppercase tracking-widest text-xs mb-8">No pieces found matching your criteria.</p>
                    <Button variant="outline" asChild className="uppercase tracking-[0.3em] text-[10px] rounded-none px-10 h-12">
                        <Link href="/catalog">Discover All Pieces</Link>
                    </Button>
                </div>
             ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
}