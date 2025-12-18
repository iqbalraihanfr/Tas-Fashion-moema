import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter as FilterIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { category, sort } = searchParams;

  let query = supabase.from('Product').select('*');

  // Simple category filtering (simulate by searching description/name)
  // In a real app, you'd have a category_id or category column
  if (category && typeof category === 'string') {
    query = query.or(`name.ilike.%${category}%,description.ilike.%${category}%`);
  }

  // Sorting
  if (sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('createdAt', { ascending: false }); // Default new
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching catalog:", error);
  }

  const productList = products || [];

  return (
    <div className="container py-10">
       <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
             <div className="space-y-6">
               <div>
                  <h3 className="font-medium uppercase tracking-wide mb-4">Categories</h3>
                  <div className="space-y-2 text-sm flex flex-col">
                     {["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"].map(cat => (
                        <Link 
                          key={cat} 
                          href={`/catalog?category=${cat.toLowerCase()}`}
                          className={`block w-full text-left py-1 hover:underline ${category === cat.toLowerCase() ? 'font-bold' : 'text-muted-foreground'}`}
                        >
                          {cat}
                        </Link>
                     ))}
                     <Link href="/catalog" className="text-muted-foreground hover:underline py-1">View All</Link>
                  </div>
               </div>
               
               {/* Static Filters for now - can be made functional later */}
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="material" className="border-b-0">
                     <AccordionTrigger className="py-2">Material</AccordionTrigger>
                     <AccordionContent>
                        <div className="space-y-2">
                           {["Leather", "Vegan Leather", "Canvas", "Suede"].map(material => (
                              <label key={material} className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <input type="checkbox" className="rounded border-gray-300" disabled /> {material}
                              </label>
                           ))}
                        </div>
                     </AccordionContent>
                  </AccordionItem>
               </Accordion>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-xl font-medium uppercase tracking-wide">All Products <span className="text-muted-foreground text-sm ml-2">({productList.length})</span></h1>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                   {/* Mobile Filter Trigger - Simplified for Server Component (Link based) */}
                   <div className="md:hidden">
                        <Link href="#categories" className="flex items-center gap-2 uppercase tracking-wide text-xs border border-gray-300 px-3 py-2 rounded-sm">
                           <FilterIcon className="w-3 h-3" /> Categories
                        </Link>
                   </div>

                   <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground hidden sm:inline">Sort:</span>
                      <div className="text-xs uppercase font-medium">
                        <Link href={`/catalog?sort=newest`} className={`mx-1 ${!sort ? 'font-bold' : 'text-muted-foreground'}`}>New</Link>
                        /
                        <Link href={`/catalog?sort=price_asc`} className={`mx-1 ${sort === 'price_asc' ? 'font-bold' : 'text-muted-foreground'}`}>Low</Link>
                        /
                        <Link href={`/catalog?sort=price_desc`} className={`mx-1 ${sort === 'price_desc' ? 'font-bold' : 'text-muted-foreground'}`}>High</Link>
                      </div>
                   </div>
                </div>
             </div>

             {productList.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No products found.</div>
             ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                    {productList.map(product => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
             )}
             
             {/* Pagination Placeholder */}
             <div className="mt-12 flex justify-center">
                {/* <Button variant="outline" className="rounded-none px-8 uppercase tracking-widest text-xs border-gray-300">Load More</Button> */}
             </div>
             
             {/* Mobile Categories Anchor Target */}
             <div id="categories" className="md:hidden mt-10 pt-10 border-t">
                <h3 className="font-medium uppercase tracking-wide mb-4">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                    {["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"].map(cat => (
                        <Link 
                          key={cat} 
                          href={`/catalog?category=${cat.toLowerCase()}`}
                          className="bg-muted p-2 text-center text-xs uppercase"
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
