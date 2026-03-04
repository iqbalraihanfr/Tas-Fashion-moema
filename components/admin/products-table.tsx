"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ArchiveProductButton } from "@/components/admin/archive-product-button";
import { Search, X, Package, SlidersHorizontal, Archive } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductsTableProps {
  products: Product[];
}

type TabView = "active" | "archived";

export function ProductsTable({ products }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>("active");

  // Debounce search query to avoid excessive re-computation
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Split products by archive status
  const activeProducts = useMemo(() => products.filter((p) => !p.is_archived), [products]);
  const archivedProducts = useMemo(() => products.filter((p) => p.is_archived), [products]);

  // Current tab products
  const currentProducts = activeTab === "active" ? activeProducts : archivedProducts;

  // Extract unique colors for filter dropdown (from current tab)
  const uniqueColors = useMemo(() => {
    const colors = new Set(currentProducts.map((p) => p.color).filter(Boolean));
    return Array.from(colors).sort();
  }, [currentProducts]);

  // Extract unique base names for stats
  const uniqueModels = useMemo(() => {
    const models = new Set(currentProducts.map((p) => p.baseName).filter(Boolean));
    return models.size;
  }, [currentProducts]);

  // Filter products based on debounced search and filters
  const filteredProducts = useMemo(() => {
    return currentProducts.filter((product) => {
      const query = debouncedSearch.toLowerCase().trim();

      // Search across multiple fields
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.baseName?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.color?.toLowerCase().includes(query) ||
        product.price.toString().includes(query);

      // Color filter
      const matchesColor = !filterColor || product.color === filterColor;

      return matchesSearch && matchesColor;
    });
  }, [currentProducts, debouncedSearch, filterColor]);

  const totalStock = filteredProducts.reduce((sum, p) => sum + p.stock, 0);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterColor("");
  };

  const hasActiveFilters = searchQuery || filterColor;

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background border border-border p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            {activeTab === "active" ? "Active Products" : "Archived Products"}
          </p>
          <p className="text-2xl font-bold mt-1">{currentProducts.length}</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Models
          </p>
          <p className="text-2xl font-bold mt-1">{uniqueModels}</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Colors
          </p>
          <p className="text-2xl font-bold mt-1">{uniqueColors.length}</p>
        </div>
        <div className="bg-background border border-border p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
            Total Stock
          </p>
          <p className="text-2xl font-bold mt-1">{totalStock}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab("active"); clearFilters(); }}
          className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors relative ${
            activeTab === "active"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active
          <span className="ml-1.5 text-[9px] font-medium px-1.5 py-0.5 bg-muted rounded-sm">
            {activeProducts.length}
          </span>
          {activeTab === "active" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab("archived"); clearFilters(); }}
          className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors relative flex items-center gap-1.5 ${
            activeTab === "archived"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="h-3 w-3" />
          Archived
          <span className="ml-1 text-[9px] font-medium px-1.5 py-0.5 bg-muted rounded-sm">
            {archivedProducts.length}
          </span>
          {activeTab === "archived" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
          )}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="product-search"
              placeholder="Search by name, model, SKU, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-none border-border bg-background text-sm placeholder:text-muted-foreground/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 rounded-none shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 items-center p-3 border border-border bg-muted/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold mr-1">
              Color:
            </span>
            <button
              onClick={() => setFilterColor("")}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                !filterColor
                  ? "bg-black text-white border-black"
                  : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() =>
                  setFilterColor(filterColor === color ? "" : color)
                }
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                  filterColor === color
                    ? "bg-black text-white border-black"
                    : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters & Results Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {filteredProducts.length}
              </span>{" "}
              of {currentProducts.length} {activeTab === "active" ? "products" : "archived"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[70px] text-[9px] uppercase tracking-[0.2em] font-bold">
                Image
              </TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold">
                Product
              </TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold hidden md:table-cell">
                SKU
              </TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold hidden sm:table-cell">
                Color
              </TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold">
                Price
              </TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold text-center">
                Stock
              </TableHead>
              <TableHead className="text-[9px] uppercase tracking-[0.2em] font-bold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {activeTab === "archived" ? (
                      <Archive className="h-8 w-8 opacity-40" />
                    ) : (
                      <Package className="h-8 w-8 opacity-40" />
                    )}
                    <p className="text-[10px] uppercase tracking-widest font-bold">
                      {activeTab === "archived"
                        ? "No archived products"
                        : "No products found"}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {activeTab === "archived"
                        ? "Archived products will appear here"
                        : "Try adjusting your search or filters"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className={`group ${product.is_archived ? "opacity-60" : ""}`}
                >
                  <TableCell className="py-2">
                    <div className="relative w-[50px] h-[50px] bg-muted overflow-hidden">
                      <Image
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : "/placeholder-bag.jpg"
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="50px"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {product.baseName}
                        {product.dimensions && ` · ${product.dimensions}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {product.sku || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border bg-muted/50">
                      {product.color || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 text-xs font-bold ${
                        product.stock === 0
                          ? "bg-red-100 text-red-700"
                          : product.stock <= 2
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {activeTab === "active" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="rounded-none h-8 text-[10px] uppercase tracking-widest"
                          >
                            <Link
                              href={`/admin/dashboard/products/${product.id}/edit`}
                            >
                              Edit
                            </Link>
                          </Button>
                          <ArchiveProductButton
                            productId={product.id}
                            isArchived={false}
                          />
                          <DeleteProductButton productId={product.id} />
                        </>
                      ) : (
                        <>
                          <ArchiveProductButton
                            productId={product.id}
                            isArchived={true}
                          />
                          <DeleteProductButton productId={product.id} />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
