"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const CATEGORIES = ["Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks"];

const PRICE_RANGES = [
  { label: "Under Rp 1.000.000", min: 0, max: 1000000 },
  { label: "Rp 1.000.000 - Rp 2.500.000", min: 1000000, max: 2500000 },
  { label: "Above Rp 2.500.000", min: 2500000, max: 99999999 },
];

const filterOptions = { shallow: false } as const;

interface CatalogFiltersSidebarProps {
  onClose: () => void;
}

export function CatalogFiltersSidebar({ onClose }: CatalogFiltersSidebarProps) {
  const [category, setCategory] = useQueryState("category", parseAsString.withOptions(filterOptions));
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsString.withOptions(filterOptions));
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsString.withOptions(filterOptions));
  const [search, setSearch] = useQueryState("search", parseAsString.withOptions(filterOptions));

  const [searchInput, setSearchInput] = useState(search ?? "");
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== (search ?? "")) {
      setSearch(trimmed || null);
    }
  }, [debouncedSearch, search, setSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(search ?? "");
  }, [search]);

  const clearFilters = () => {
    setCategory(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSearch(null);
    setSearchInput("");
  };

  const hasFilters = category || minPrice || search;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Filter</span>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Cari</h3>
        <div className="relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-6 pr-6 py-2 bg-transparent border-b border-muted text-xs focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/50"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(null); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Filters Accordion */}
      <Accordion type="multiple" defaultValue={["categories", "price"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[0.2em] hover:no-underline py-3">Kategori</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-3 pt-2">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(isActive ? null : cat.toLowerCase())}
                    className={`text-left text-sm transition-all ${
                      isActive
                        ? "font-semibold text-foreground pl-3 border-l-2 border-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[0.2em] hover:no-underline py-3 mt-4 border-t border-border pt-4">Harga</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-3 pt-2">
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
                    className={`text-left text-sm transition-all ${
                      isActive
                        ? "font-semibold text-foreground pl-3 border-l-2 border-foreground"
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
    </div>
  );
}

// Keep old exports for backward compat (SortOptions no longer needed separately)
export function SortOptions() {
  return null;
}

export function CatalogFilters() {
  return <CatalogFiltersSidebar onClose={() => {}} />;
}
