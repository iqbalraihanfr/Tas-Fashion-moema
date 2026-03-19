"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/product-card";
import { CatalogToolbar } from "@/components/product/catalog-toolbar";
import { CatalogFiltersSidebar } from "@/components/product/catalog-filters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProductGroup } from "@/lib/types";

const NAV_ITEMS = ["New Arrivals", "Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks", "Sale"];

interface CatalogContentProps {
  productGroups: ProductGroup[];
  title: string;
  colorMap?: Record<string, string>;
}

export function CatalogContent({ productGroups, title, colorMap }: CatalogContentProps) {
  const [columns, setColumns] = useState(4);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const gridClass =
    columns === 3
      ? "grid-cols-2 lg:grid-cols-3"
      : columns === 6
        ? "grid-cols-3 lg:grid-cols-6"
        : "grid-cols-2 lg:grid-cols-4";

  return (
    <div>
      {/* Sticky Category Nav + Toolbar — uses --nav-offset CSS var from navbar */}
      <div
        className="sticky z-40 bg-background transition-[top] duration-300"
        style={{ top: "var(--nav-offset, 0px)" }}
      >
        {/* Category Links */}
        <nav className="hidden md:flex justify-center border-b border-border py-3">
          <div className="flex gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item}
                href={`/catalog?category=${item.toLowerCase().replace(" ", "-")}`}
                className="text-xs font-semibold uppercase tracking-widest hover:text-muted-foreground transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </nav>

        {/* Toolbar: Filter toggle, Sort, Count, Column selector */}
        <CatalogToolbar
          totalProducts={productGroups.length}
          columns={columns}
          onColumnsChange={setColumns}
          isFilterOpen={isFilterOpen}
          onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      </div>

      <div className="flex">
        {/* Mobile: Filter Sheet (bottom slide-up) */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent side="bottom" className="md:hidden max-h-[85vh] overflow-y-auto">
            <SheetHeader className="pb-4 border-b border-border mb-4">
              <SheetTitle className="text-[11px] uppercase tracking-[0.2em] font-bold">Filter</SheetTitle>
            </SheetHeader>
            <CatalogFiltersSidebar onClose={() => setIsFilterOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Desktop: Inline Filter Sidebar */}
        <aside
          className={`hidden md:block shrink-0 overflow-y-auto overflow-x-hidden border-r border-border bg-background transition-all duration-300 ease-in-out sticky top-[calc(var(--nav-offset,0px)+120px)] h-[calc(100vh-var(--nav-offset,0px)-120px)] ${
            isFilterOpen ? "w-72 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-72 p-6">
            <CatalogFiltersSidebar onClose={() => setIsFilterOpen(false)} />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 p-4 md:p-8">
          {productGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 border border-dashed border-muted text-center">
              <p className="text-muted-foreground uppercase tracking-widest text-xs mb-8">
                No pieces found matching your criteria.
              </p>
              <Button
                variant="outline"
                asChild
                className="uppercase tracking-[0.3em] text-[10px] rounded-none px-10 h-12"
              >
                <Link href="/catalog">Discover All Pieces</Link>
              </Button>
            </div>
          ) : (
            <div className={`grid ${gridClass} gap-x-4 gap-y-10`}>
              {productGroups.map((group) => (
                <ProductCard key={group.baseName} group={group} colorMap={colorMap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
