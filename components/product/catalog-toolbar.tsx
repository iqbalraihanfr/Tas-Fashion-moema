"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useState, useEffect, useRef } from "react";
import { Filter, ChevronDown, X } from "lucide-react";

const filterOptions = { shallow: false } as const;

interface CatalogToolbarProps {
  totalProducts: number;
  columns: number;
  onColumnsChange: (cols: number) => void;
  isFilterOpen: boolean;
  onFilterToggle: () => void;
}

const SORT_OPTIONS = [
  { label: "Fitur", value: "newest" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
];

export function CatalogToolbar({
  totalProducts,
  columns,
  onColumnsChange,
  isFilterOpen,
  onFilterToggle,
}: CatalogToolbarProps) {
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("newest").withOptions(filterOptions)
  );

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Fitur";

  return (
    <div className="bg-background border-b border-border">
      <div className="flex items-center justify-between h-12 px-4 md:px-8">
        {/* Left: Filter toggle + Sort */}
        <div className="flex items-center gap-6">
          <button
            onClick={onFilterToggle}
            className={`flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold transition-colors ${
              isFilterOpen
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isFilterOpen ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Filter className="h-3.5 w-3.5" />
            )}
            Filter
          </button>

          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden sm:inline font-semibold">Urutkan Berdasarkan</span>
              <span className="font-bold text-foreground">{currentSortLabel}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-1 bg-background border border-border shadow-lg z-50 min-w-[180px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setIsSortOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 text-[11px] uppercase tracking-widest transition-colors ${
                      sort === opt.value
                        ? "font-bold text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Item count */}
        <span className="hidden md:block text-[11px] text-muted-foreground tracking-wide">
          Menampilkan 1 - {totalProducts} dari {totalProducts} Item
        </span>

        {/* Right: Column selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground mr-2 hidden sm:inline">
            Lihat Berdasarkan:
          </span>
          {[3, 4, 6].map((col) => (
            <button
              key={col}
              onClick={() => onColumnsChange(col)}
              className={`w-9 h-9 flex items-center justify-center text-[11px] font-bold transition-colors ${
                columns === col
                  ? "text-foreground border border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
