"use client";

import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter as FilterIcon } from "lucide-react";
import { useState } from "react";

const dummyProducts = [
  { id: "prod1", name: "Gabine Saddle Bag", slug: "gabine-saddle-bag", price: 1299000, images: ["/bag-1.jpg"] },
  { id: "prod2", name: "Cesile Boxy Shoulder", slug: "cesile-boxy-shoulder", price: 1099000, images: ["/bag-2.jpg"] },
  { id: "prod3", name: "Koa Square Push-Lock", slug: "koa-square-push-lock", price: 1199000, images: ["/bag-3.jpg"] },
  { id: "prod4", name: "Perline Beaded Handle", slug: "perline-beaded-handle", price: 999000, images: ["/bag-4.jpg"] },
  { id: "prod5", name: "Aubrielle Buckle Bag", slug: "aubrielle-buckle-bag", price: 1399000, images: ["/bag-5.jpg"] },
  { id: "prod6", name: "Daylla Tote Bag", slug: "daylla-tote-bag", price: 1599000, images: ["/bag-6.jpg"] },
  { id: "prod7", name: "Mini Gabine Saddle", slug: "mini-gabine-saddle", price: 899000, images: ["/bag-7.jpg"] },
  { id: "prod8", name: "Chain Strap Evening", slug: "chain-strap-evening", price: 1499000, images: ["/bag-8.jpg"] },
];

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const FilterContent = () => (
    <div className="space-y-6">
       <div>
          <h3 className="font-medium uppercase tracking-wide mb-4">Categories</h3>
          <div className="space-y-2 text-sm">
             {["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"].map(cat => (
                <button 
                  key={cat} 
                  className={`block w-full text-left py-1 hover:underline ${selectedCategory === cat ? 'font-bold' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                >
                  {cat}
                </button>
             ))}
          </div>
       </div>
       
       <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="material" className="border-b-0">
             <AccordionTrigger className="py-2">Material</AccordionTrigger>
             <AccordionContent>
                <div className="space-y-2">
                   {["Leather", "Vegan Leather", "Canvas", "Suede"].map(material => (
                      <label key={material} className="flex items-center gap-2 text-sm text-muted-foreground">
                         <input type="checkbox" className="rounded border-gray-300" /> {material}
                      </label>
                   ))}
                </div>
             </AccordionContent>
          </AccordionItem>
          <AccordionItem value="color" className="border-b-0">
             <AccordionTrigger className="py-2">Color</AccordionTrigger>
             <AccordionContent>
                <div className="flex gap-2 flex-wrap pt-2">
                   {['black', 'white', 'beige', 'brown', 'red'].map(color => (
                      <div key={color} className="w-6 h-6 rounded-full border border-gray-200 bg-gray-100" style={{backgroundColor: color === 'beige' ? '#f5f5dc' : color}} />
                   ))}
                </div>
             </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price" className="border-b-0">
             <AccordionTrigger className="py-2">Price</AccordionTrigger>
             <AccordionContent>
                <div className="space-y-2">
                   <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-gray-300" /> Under Rp 1.000.000
                   </label>
                   <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" className="rounded border-gray-300" /> Rp 1.000.000 - Rp 2.000.000
                   </label>
                </div>
             </AccordionContent>
          </AccordionItem>
       </Accordion>
    </div>
  );

  return (
    <div className="container py-10">
       <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
             <FilterContent />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-xl font-medium uppercase tracking-wide">All Products <span className="text-muted-foreground text-sm ml-2">({dummyProducts.length})</span></h1>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                   {/* Mobile Filter Trigger */}
                   <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="md:hidden uppercase tracking-wide text-xs gap-2">
                           <FilterIcon className="w-3 h-3" /> Filter
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px] overflow-y-auto">
                        <SheetHeader className="mb-6 text-left">
                           <SheetTitle className="uppercase tracking-widest text-lg">Filters</SheetTitle>
                        </SheetHeader>
                        <FilterContent />
                      </SheetContent>
                   </Sheet>

                   <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground hidden sm:inline">Sort:</span>
                      <select className="text-xs uppercase font-medium bg-transparent border-none focus:ring-0 cursor-pointer p-0">
                         <option>Newest</option>
                         <option>Price: Low to High</option>
                         <option>Price: High to Low</option>
                      </select>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                {dummyProducts.map(product => (
                   <ProductCard key={product.id} product={product} />
                ))}
             </div>
             
             <div className="mt-12 flex justify-center">
                <Button variant="outline" className="rounded-none px-8 uppercase tracking-widest text-xs border-gray-300">Load More</Button>
             </div>
          </div>
       </div>
    </div>
  );
}
