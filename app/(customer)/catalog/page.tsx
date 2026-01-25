import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { Filter as FilterIcon } from "lucide-react";
import { getAllProducts, ProductFilter } from "@/services/database/product.repository";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const { category, sort, search, minPrice, maxPrice } = resolvedParams;

  const filter: ProductFilter = {
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    minPrice: minPrice ? parseInt(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
    sort: (sort === 'price_asc' || sort === 'price_desc' || sort === 'newest') ? sort : undefined,
  };

  const products = await getAllProducts(filter);

  const priceRanges = [
    { label: "Under Rp 1.000.000", min: 0, max: 1000000 },
    { label: "Rp 1.000.000 - Rp 2.500.000", min: 1000000, max: 2500000 },
    { label: "Above Rp 2.500.000", min: 2500000, max: 99999999 },
  ];

  return (
    <div className="container py-10">
       <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
             <div className="space-y-6">
               {/* Active Filters Summary (Optional but Luxury) */}
               {(category || search || minPrice) && (
                 <div className="mb-4">
                    <Button variant="link" asChild className="p-0 h-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                        <Link href="/catalog">Clear All Filters</Link>
                    </Button>
                 </div>
               )}

               <div>
                  <h3 className="font-medium uppercase tracking-wide mb-4">Categories</h3>
                  <div className="space-y-2 text-sm flex flex-col">
                     {["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"].map(cat => (
                        <Link 
                          key={cat} 
                          href={`/catalog?category=${cat.toLowerCase()}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}`}
                          className={`block w-full text-left py-1 hover:underline ${category === cat.toLowerCase() ? 'font-bold' : 'text-muted-foreground'}`}
                        >
                          {cat}
                        </Link>
                     ))}
                  </div>
               </div>
               
               <Accordion type="single" collapsible className="w-full" defaultValue="price">
                  <AccordionItem value="price" className="border-b-0">
                     <AccordionTrigger className="py-2">Price Range</AccordionTrigger>
                     <AccordionContent>
                        <div className="space-y-2 flex flex-col">
                           {priceRanges.map((range, i) => {
                             const isActive = minPrice === range.min.toString() && maxPrice === range.max.toString();
                             return (
                                <Link 
                                    key={i}
                                    href={`/catalog?minPrice=${range.min}&maxPrice=${range.max}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}`}
                                    className={`text-sm py-1 hover:underline ${isActive ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                                >
                                    {range.label}
                                </Link>
                             )
                           })}
                        </div>
                     </AccordionContent>
                  </AccordionItem>
               </Accordion>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-xl font-medium uppercase tracking-wide">
                        {search ? `Search results for: "${search}"` : category ? `${category} Collections` : 'All Products'}
                        <span className="text-muted-foreground text-sm ml-2">({products.length})</span>
                    </h1>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                   <div className="md:hidden">
                        <Link href="#categories" className="flex items-center gap-2 uppercase tracking-wide text-xs border border-gray-300 px-3 py-2 rounded-sm">
                           <FilterIcon className="w-3 h-3" strokeWidth={1.5} /> Filters
                        </Link>
                   </div>

                   <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground hidden sm:inline">Sort:</span>
                      <div className="text-xs uppercase font-medium">
                        <Link href={`/catalog?sort=newest${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${minPrice ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : ''}`} className={`mx-1 ${!sort || sort === 'newest' ? 'font-bold' : 'text-muted-foreground'}`}>New</Link>
                        /
                        <Link href={`/catalog?sort=price_asc${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${minPrice ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : ''}`} className={`mx-1 ${sort === 'price_asc' ? 'font-bold' : 'text-muted-foreground'}`}>Low</Link>
                        /
                        <Link href={`/catalog?sort=price_desc${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${minPrice ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : ''}`} className={`mx-1 ${sort === 'price_desc' ? 'font-bold' : 'text-muted-foreground'}`}>High</Link>
                      </div>
                   </div>
                </div>
             </div>

             {products.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-md">
                    <p className="text-muted-foreground mb-4">No products found for the selected criteria.</p>
                    <Button variant="outline" asChild className="uppercase tracking-widest text-[10px] rounded-none">
                        <Link href="/catalog">View All Products</Link>
                    </Button>
                </div>
             ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10">
                    {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
             )}
             
             <div id="categories" className="md:hidden mt-10 pt-10 border-t">
                <h3 className="font-medium uppercase tracking-wide mb-4 text-sm">Shop by Category</h3>
                <div className="grid grid-cols-2 gap-2">
                    {["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"].map(cat => (
                        <Link 
                          key={cat} 
                          href={`/catalog?category=${cat.toLowerCase()}`}
                          className="bg-muted py-3 px-2 text-center text-[10px] uppercase font-bold tracking-widest"
                        >
                          {cat}
                        </Link>
                     ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

