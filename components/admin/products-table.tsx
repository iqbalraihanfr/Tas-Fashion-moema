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
import { Search, X, Package, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query to avoid excessive re-computation
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Extract unique colors for filter dropdown
  const uniqueColors = useMemo(() => {
    const colors = new Set(products.map((p) => p.color).filter(Boolean));
    return Array.from(colors).sort();
  }, [products]);

  // Extract unique base names for stats
  const uniqueModels = useMemo(() => {
    const models = new Set(products.map((p) => p.baseName).filter(Boolean));
    return models.size;
  }, [products]);

  // Filter products based on debounced search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, debouncedSearch, filterColor]);

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
            Total Products
          </p>
          <p className="text-2xl font-bold mt-1">{products.length}</p>
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
              of {products.length} products
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
                    <Package className="h-8 w-8 opacity-40" />
                    <p className="text-[10px] uppercase tracking-widest font-bold">
                      No products found
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="group">
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
                      <DeleteProductButton productId={product.id} />
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
