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
import { Search, X, Package, SlidersHorizontal, Archive, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

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

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, safeCurrentPage, itemsPerPage]);

  const totalStock = filteredProducts.reduce((sum, p) => sum + p.stock, 0);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterColor("");
    setCurrentPage(1);
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
      setCurrentPage(1);
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
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 h-9 rounded-md bg-white text-sm border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
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
                onClick={() => { setFilterColor(""); setCurrentPage(1); }}
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
                  onClick={() => {
                    setFilterColor(filterColor === color ? "" : color);
                    setCurrentPage(1);
                  }}
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
                  <TableHead className="font-medium hidden md:table-cell text-neutral-500 text-xs uppercase tracking-wider">
                    Category
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
                    <TableCell colSpan={8} className="h-48 text-center">
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
                  paginatedProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className={`group hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${product.is_archived ? "opacity-70" : ""}`}
                    >
                      <TableCell className="py-3 pl-4">
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredImageId(product.id)}
                          onMouseLeave={() => setHoveredImageId(null)}
                        >
                          <div className="relative w-10 h-10 rounded-md bg-neutral-100 overflow-hidden border border-neutral-200 cursor-pointer">
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
                          {/* Hover Preview Popup */}
                          <div
                            className={`absolute left-12 top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-all duration-200 ease-out ${
                              hoveredImageId === product.id
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-95"
                            }`}
                          >
                            <div className="relative w-60 h-60 rounded-xl overflow-hidden shadow-2xl border border-neutral-200 bg-white ring-1 ring-black/5">
                              <Image
                                src={
                                  product.images && product.images.length > 0
                                    ? product.images[0]
                                    : "/placeholder-bag.jpg"
                                }
                                alt={`${product.name} preview`}
                                fill
                                className="object-cover"
                                sizes="240px"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3">
                                <p className="text-white text-xs font-medium truncate">{product.name}</p>
                                <p className="text-white/70 text-[10px]">{product.color}</p>
                              </div>
                            </div>
                          </div>
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
                      <TableCell className="hidden md:table-cell">
                        {product.category ? (
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
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
                        <div className="flex items-center justify-end gap-1">
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
                                      aria-label={`Edit product: ${product.name}`}
                                      title={`Edit product: ${product.name}`}
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
                                productName={product.name}
                              />
                              <DeleteProductButton productId={product.id} productName={product.name} />
                            </>
                          ) : (
                            <>
                              <ArchiveProductButton
                                productId={product.id}
                                isArchived={true}
                                productName={product.name}
                              />
                              <DeleteProductButton productId={product.id} productName={product.name} />
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
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="font-medium text-neutral-700">{filteredProducts.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1}</span>–<span className="font-medium text-neutral-700">{Math.min(safeCurrentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium text-neutral-700">{filteredProducts.length}</span> products
            </span>
            <span className="text-neutral-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Rows per page</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                className="h-7 rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-700 font-medium cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
                <option value={filteredProducts.length}>All</option>
              </select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md border-neutral-200"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and neighbors
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - safeCurrentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-neutral-400">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={safeCurrentPage === item ? "default" : "outline"}
                      size="icon"
                      className={`h-7 w-7 rounded-md text-xs font-medium ${
                        safeCurrentPage === item
                          ? "bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      }`}
                      onClick={() => setCurrentPage(item as number)}
                    >
                      {item}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md border-neutral-200"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
