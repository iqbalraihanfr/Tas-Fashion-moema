"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Menu, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useProductNav } from "@/features/products/ProductNavProvider";

const SCROLL_THRESHOLD = 30;

const navItems = ["New Arrivals", "Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks", "Sale"];

export default function Navbar() {
  const { cartCount, setIsCartOpen, addItem } = useCart();
  const { productInfo, isInRecommendationSection } = useProductNav();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isCatalogPage = pathname === "/catalog" || pathname.startsWith("/catalog?");

  const debouncedSearch = useDebounce(searchQuery, 500);
  const hasSubmitted = useRef(false);

  const accumulatedDelta = useRef(0);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if ((accumulatedDelta.current > 0 && delta > 0) || (accumulatedDelta.current < 0 && delta < 0)) {
        accumulatedDelta.current += delta;
      } else {
        accumulatedDelta.current = delta;
      }

      if (currentScrollY <= 5) {
        setIsNavHidden(false);
        accumulatedDelta.current = 0;
      } else if (accumulatedDelta.current > SCROLL_THRESHOLD) {
        setIsNavHidden(true);
        accumulatedDelta.current = 0;
      } else if (accumulatedDelta.current < -SCROLL_THRESHOLD) {
        setIsNavHidden(false);
        accumulatedDelta.current = 0;
      }

      lastScrollY.current = currentScrollY;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  // Set CSS variable for catalog sticky offset
  useEffect(() => {
    if (isCatalogPage) {
      document.documentElement.style.setProperty(
        "--nav-offset",
        isNavHidden ? "0px" : "80px"
      );
    }
    return () => {
      document.documentElement.style.removeProperty("--nav-offset");
    };
  }, [isNavHidden, isCatalogPage]);

  useEffect(() => {
    if (debouncedSearch.trim() && isSearchOpen && !hasSubmitted.current) {
      router.push(`/catalog?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
    hasSubmitted.current = false;
  }, [debouncedSearch, isSearchOpen, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      hasSubmitted.current = true;
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const showProductBar = isInRecommendationSection && !!productInfo;
  const closeMobileSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen((prev) => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  // Category nav element
  const categoryNavElement = (
    <nav className="hidden md:flex justify-center border-t border-border py-3 bg-background">
      <div className="flex gap-8">
        {navItems.map((item) => (
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
  );

  return (
    <>
      {/* Product Reminder Bar — fixed at top, visible in recommendation section when nav is hidden */}
      <div
        className={`fixed top-0 left-0 right-0 z-[var(--z-sticky-cta)] border-b border-border bg-background/98 backdrop-blur transition-all duration-300 overflow-hidden ${
          showProductBar && isNavHidden ? "max-h-20 opacity-100" : "max-h-0 opacity-0 border-b-0"
        }`}
      >
        {productInfo && (
          <div className="container flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="relative h-10 w-8 shrink-0 overflow-hidden">
                <Image src={productInfo.image} alt={productInfo.name} fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                  {productInfo.name}
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wide">
                  Rp {productInfo.price.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 text-[10px] uppercase tracking-widest rounded-none px-4"
              onClick={() => {
                addItem({
                  id: productInfo.slug,
                  name: productInfo.name,
                  price: productInfo.price,
                  image: productInfo.image,
                  color: "",
                  slug: productInfo.slug,
                });
              }}
            >
              <ShoppingBag className="h-3 w-3 mr-1.5" />
              Masukkan Keranjang
            </Button>
          </div>
        )}
      </div>

      {/* Main Navbar — hides on scroll down */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-[var(--z-navbar)] w-full transition-transform duration-300 ease-in-out ${
          isNavHidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container grid grid-cols-3 h-20 items-center">
            {/* Mobile Menu & Search (Left) */}
            <div className="flex items-center gap-4 md:hidden">
              <Sheet
                open={isMobileMenuOpen}
                onOpenChange={(open) => {
                  setIsMobileMenuOpen(open);
                  if (open) {
                    closeMobileSearch();
                  }
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-2"
                    aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                    onClick={() => {
                      if (isSearchOpen) {
                        closeMobileSearch();
                      }
                    }}
                  >
                    <Menu className="h-5 w-5" strokeWidth={1.5} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                  <SheetHeader className="p-6 border-b border-border text-left">
                    <SheetTitle className="text-xl font-bold tracking-[0.15em] uppercase text-[#111111]">MOEMA</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col">
                    {/* Home link */}
                    <Link
                      href="/"
                      className="px-6 py-4 text-sm font-medium uppercase tracking-wide hover:bg-muted transition-colors border-b border-border/50"
                      onClick={closeMobileMenu}
                    >
                      Beranda
                    </Link>

                    {/* Collapsible Categories */}
                    <details className="group" open>
                      <summary className="px-6 py-4 text-sm font-medium uppercase tracking-wide cursor-pointer select-none hover:bg-muted transition-colors border-b border-border/50 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                        Kategori
                        <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="flex flex-col bg-muted/20">
                        {navItems.map((item) => (
                          <Link
                            key={item}
                            href={`/catalog?category=${item.toLowerCase().replace(" ", "-")}`}
                            className="px-8 py-3.5 text-sm font-medium uppercase tracking-wide hover:bg-muted transition-colors border-b border-border/30 last:border-0"
                            onClick={closeMobileMenu}
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    </details>

                    {/* All Products */}
                    <Link
                      href="/catalog"
                      className="px-6 py-4 text-sm font-medium uppercase tracking-wide hover:bg-muted transition-colors border-b border-border/50"
                      onClick={closeMobileMenu}
                    >
                      Semua Produk
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                aria-label={isSearchOpen ? "Close mobile search" : "Open mobile search"}
                onClick={toggleMobileSearch}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </div>

            {/* Desktop Search (Left) */}
            <div className="hidden md:flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <input
                    type="text"
                    placeholder="SEARCH..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-b border-primary text-xs uppercase tracking-widest focus:outline-none w-48 py-1"
                  />
                  <Button type="button" variant="ghost" size="icon" aria-label="Close desktop search" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="sm" className="text-xs font-medium uppercase tracking-widest gap-2 hover:bg-transparent px-0" onClick={() => setIsSearchOpen(true)}>
                    <Search className="h-4 w-4" strokeWidth={1.5} />
                    Search
                  </Button>
                  <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                    Beranda
                  </Link>
                </div>
              )}
            </div>

            {/* Logo (Center) */}
            <Link href="/" className="flex justify-center">
              <Image src="/MOEMA-Logo.png" alt="MOEMA" width={140} height={40} className="h-11 w-auto object-contain" priority />
            </Link>

            {/* User Actions (Right) */}
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="icon" className="relative" aria-label="Open shopping bag" onClick={openCart}>
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search Input */}
          {isMobileMenuOpen === false && isSearchOpen && (
            <div className="md:hidden border-t border-border bg-background p-4 animate-in slide-in-from-top duration-300 z-[var(--z-mobile-search)] relative">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="SEARCH..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs uppercase tracking-widest focus:outline-none"
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Close mobile search" onClick={closeMobileSearch}>
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </form>
            </div>
          )}

          {/* Category Nav — inside main navbar (NOT on catalog page) */}
          {!isCatalogPage && categoryNavElement}
        </div>

        {/* Product Reminder Bar — attached to navbar, visible when navbar & recommendation section */}
        <div
          className={`border-b border-border bg-background/98 backdrop-blur transition-all duration-300 overflow-hidden ${
            showProductBar && !isNavHidden ? "max-h-20 opacity-100" : "max-h-0 opacity-0 border-b-0"
          }`}
        >
          {productInfo && (
            <div className="container flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="relative h-10 w-8 shrink-0 overflow-hidden">
                  <Image src={productInfo.image} alt={productInfo.name} fill className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                    {productInfo.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground tracking-wide">
                    Rp {productInfo.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="h-8 text-[10px] uppercase tracking-widest rounded-none px-4"
                onClick={() => {
                  addItem({
                    id: productInfo.slug,
                    name: productInfo.name,
                    price: productInfo.price,
                    image: productInfo.image,
                    color: "",
                    slug: productInfo.slug,
                  });
                }}
              >
                <ShoppingBag className="h-3 w-3 mr-1.5" />
                Masukkan Keranjang
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
