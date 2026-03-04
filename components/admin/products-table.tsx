"use client";

import { useState, useMemo, useRef } from "react";
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
import { Search, X, Package, SlidersHorizontal, Archive, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const activeProducts = useMemo(() => products.filter((p) => !p.is_archived), [products]);
  const archivedProducts = useMemo(() => products.filter((p) => p.is_archived), [products]);

  const currentProducts = activeTab === "active" ? activeProducts : archivedProducts;

  const uniqueColors = useMemo(() => {
    const colors = new Set(currentProducts.map((p) => p.color).filter(Boolean));
    return Array.from(colors).sort();
  }, [currentProducts]);

  const uniqueModels = useMemo(() => {
    const models = new Set(currentProducts.map((p) => p.baseName).filter(Boolean));
    return models.size;
  }, [currentProducts]);

  const filteredProducts = useMemo(() => {
    return currentProducts.filter((product) => {
      const query = debouncedSearch.toLowerCase().trim();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.baseName?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.color?.toLowerCase().includes(query) ||
        product.price.toString().includes(query);

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

  const handleTabChange = (newTab: TabView) => {
    if (newTab === activeTab || isAnimating) return;
    
    const direction = newTab === "archived" ? "left" : "right";
    setSlideDirection(direction);
    setIsAnimating(true);
    
    // After slide-out animation, switch content
    setTimeout(() => {
      setActiveTab(newTab);
      clearFilters();
      setSlideDirection(direction === "left" ? "right" : "left");
      
      // After content switch, slide in from opposite side
      requestAnimationFrame(() => {
        setSlideDirection(null);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      });
    }, 200);
  };

  // Animation styles for the table content
  const getSlideStyles = (): React.CSSProperties => {
    if (slideDirection === null) {
      return {
        transform: "translateX(0)",
        opacity: 1,
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      };
    }
    
    const offset = slideDirection === "left" ? "-20px" : "20px";
    return {
      transform: `translateX(${offset})`,
      opacity: 0,
      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            {activeTab === "active" ? "Active Products" : "Archived Products"}
          </p>
          <p className="text-3xl font-bold mt-2 text-neutral-900">{currentProducts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Models
          </p>
          <p className="text-3xl font-bold mt-2 text-neutral-900">{uniqueModels}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Colors
          </p>
          <p className="text-3xl font-bold mt-2 text-neutral-900">{uniqueColors.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Total Stock
          </p>
          <p className="text-3xl font-bold mt-2 text-neutral-900">{totalStock}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Tab Switcher */}
          <div className="flex bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => handleTabChange("active")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "active"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Active
              <span className={`ml-2 text-xs ${
                activeTab === "active" ? "text-neutral-500" : "text-neutral-400"
              }`}>
                {activeProducts.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("archived")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === "archived"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              Archived
              <span className={`text-xs ${
                activeTab === "archived" ? "text-neutral-500" : "text-neutral-400"
              }`}>
                {archivedProducts.length}
              </span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                id="product-search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-md bg-white text-sm border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={showFilters || hasActiveFilters ? "secondary" : "outline"}
              size="icon"
              className="h-9 w-9 rounded-md shrink-0 border-neutral-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-4 border-b border-neutral-200 bg-neutral-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-neutral-500 mr-2">
                Color Filter:
              </span>
              <Badge
                variant={!filterColor ? "default" : "outline"}
                className="cursor-pointer hover:bg-neutral-800 rounded-md font-normal px-3 py-1 text-sm"
                onClick={() => setFilterColor("")}
              >
                All Colors
              </Badge>
              {uniqueColors.map((color) => (
                <Badge
                  key={color}
                  variant={filterColor === color ? "default" : "outline"}
                  className={`cursor-pointer rounded-md font-normal px-3 py-1 text-sm ${
                    filterColor === color
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  }`}
                  onClick={() =>
                    setFilterColor(filterColor === color ? "" : color)
                  }
                >
                  {color}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Products Table with Slide Animation */}
        <div ref={tableContainerRef} className="overflow-hidden">
          <div style={getSlideStyles()}>
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow className="hover:bg-transparent border-b border-neutral-200">
                  <TableHead className="w-[70px] font-medium pl-4 text-neutral-500 text-xs uppercase tracking-wider">
                    Image
                  </TableHead>
                  <TableHead className="font-medium text-neutral-500 text-xs uppercase tracking-wider">
                    Product
                  </TableHead>
                  <TableHead className="font-medium hidden md:table-cell text-neutral-500 text-xs uppercase tracking-wider">
                    SKU
                  </TableHead>
                  <TableHead className="font-medium hidden sm:table-cell text-neutral-500 text-xs uppercase tracking-wider">
                    Color
                  </TableHead>
                  <TableHead className="font-medium text-neutral-500 text-xs uppercase tracking-wider">
                    Price
                  </TableHead>
                  <TableHead className="font-medium text-center text-neutral-500 text-xs uppercase tracking-wider">
                    Stock
                  </TableHead>
                  <TableHead className="font-medium text-right pr-4 text-neutral-500 text-xs uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        {activeTab === "archived" ? (
                          <Archive className="h-10 w-10 opacity-30 mb-2" />
                        ) : (
                          <Package className="h-10 w-10 opacity-30 mb-2" />
                        )}
                        <p className="text-sm font-medium text-neutral-600">
                          {activeTab === "archived"
                            ? "No archived products"
                            : "No products found"}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {activeTab === "archived"
                            ? "Archived products will appear here."
                            : "Try adjusting your search or filters."}
                        </p>
                        {hasActiveFilters && (
                           <Button variant="link" onClick={clearFilters} className="text-neutral-900 mt-2">
                             Clear all filters
                           </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className={`group hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${product.is_archived ? "opacity-70" : ""}`}
                    >
                      <TableCell className="py-3 pl-4">
                        <div className="relative w-10 h-10 rounded-md bg-neutral-100 overflow-hidden border border-neutral-200">
                          <Image
                            src={
                              product.images && product.images.length > 0
                                ? product.images[0]
                                : "/placeholder-bag.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-neutral-900">{product.name}</span>
                          <span className="text-xs text-neutral-400">
                            {product.baseName}
                            {product.dimensions && ` · ${product.dimensions}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md font-mono">
                          {product.sku || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-neutral-600">
                          {product.color || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-neutral-900">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={`font-medium rounded-md text-xs ${
                            product.stock === 0
                              ? "bg-red-50 text-red-700 hover:bg-red-50 border border-red-200"
                              : product.stock <= 2
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                          }`}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeTab === "active" ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
                                  >
                                    <Link
                                      href={`/admin/dashboard/products/${product.id}/edit`}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                  Edit product
                                </TooltipContent>
                              </Tooltip>
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
        
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 text-xs text-neutral-500 flex justify-between items-center">
          <span>
            Showing <span className="font-medium text-neutral-700">{filteredProducts.length}</span> of {currentProducts.length} products
          </span>
        </div>
      </div>
    </div>
  );
}
