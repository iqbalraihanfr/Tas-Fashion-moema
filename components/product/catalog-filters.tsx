"use client";

import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X, Filter as FilterIcon } from "lucide-react";

const CATEGORIES = ["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"];

const PRICE_RANGES = [
  { label: "Under Rp 1.000.000", min: 0, max: 1000000 },
  { label: "Rp 1.000.000 - Rp 2.500.000", min: 1000000, max: 2500000 },
  { label: "Above Rp 2.500.000", min: 2500000, max: 99999999 },
];

export function CatalogFilters() {
  const [category, setCategory] = useQueryState("category", { defaultValue: "" });
  const [minPrice, setMinPrice] = useQueryState("minPrice", { defaultValue: "" });
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", { defaultValue: "" });
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });

  const clearFilters = () => {
    setCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSearch(null);
  };

  const hasFilters = category || minPrice || search;

  return (
    <div className="space-y-10">
      {hasFilters && (
        <div className="flex items-center justify-between pb-4 border-b border-muted">
           <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Active Filters</span>
           <button 
             onClick={clearFilters}
             className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
           >
             <X className="w-3 h-3" /> Clear All
           </button>
        </div>
      )}

      {/* CATEGORIES */}
      <section>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Categories</h3>
        <div className="flex flex-col space-y-3">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setCategory(isActive ? null : cat.toLowerCase())}
                className={`text-left text-sm transition-all hover:pl-2 ${
                  isActive 
                  ? "font-bold text-foreground border-l-2 border-primary pl-3" 
                  : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* PRICE RANGE */}
      <Accordion type="single" collapsible className="w-full border-t border-muted pt-4" defaultValue="price">
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Price Range</span>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="flex flex-col space-y-3">
              {PRICE_RANGES.map((range, i) => {
                const isActive = minPrice === range.min.toString() && maxPrice === range.max.toString();
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isActive) {
                        setMinPrice(null);
                        setMaxPrice(null);
                      } else {
                        setMinPrice(range.min.toString());
                        setMaxPrice(range.max.toString());
                      }
                    }}
                    className={`text-left text-sm transition-all hover:pl-2 ${
                      isActive 
                      ? "font-bold text-foreground border-l-2 border-primary pl-3" 
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* MOBILE TRIGGER (Placeholder logic, usually handled by a Sheet) */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
         <Button className="rounded-none h-12 px-8 bg-black text-white shadow-2xl uppercase tracking-[0.2em] text-[10px]">
            <FilterIcon className="w-4 h-4 mr-2" /> Filter & Sort
         </Button>
      </div>
    </div>
  );
}

export function SortOptions() {
    const [sort, setSort] = useQueryState("sort", { defaultValue: "newest" });

    const options = [
        { label: "Newest", value: "newest" },
        { label: "Price Low", value: "price_asc" },
        { label: "Price High", value: "price_desc" },
    ];

    return (
        <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Sort By</span>
            <div className="flex gap-4">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={`text-[10px] uppercase tracking-widest transition-colors ${
                            sort === opt.value ? "font-bold border-b border-primary pb-0.5" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
