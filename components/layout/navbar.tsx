"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Menu, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useProductNav } from "@/features/products/ProductNavProvider";

const SCROLL_THRESHOLD = 30; // Minimum scroll delta to prevent flickering

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

  // Debounce search for auto-navigation (500ms)
  const debouncedSearch = useDebounce(searchQuery, 500);
  const hasSubmitted = useRef(false);

  const navItems = ["New Arrivals", "Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks", "Sale"];

  // Scroll direction detection with accumulated delta for stability
  const accumulatedDelta = useRef(0);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      // Accumulate delta in the same direction, reset on direction change
      if ((accumulatedDelta.current > 0 && delta > 0) || (accumulatedDelta.current < 0 && delta < 0)) {
        accumulatedDelta.current += delta;
      } else {
        accumulatedDelta.current = delta;
      }

      if (currentScrollY <= 5) {
        // At top — always show
        setIsNavHidden(false);
        accumulatedDelta.current = 0;
      } else if (accumulatedDelta.current > SCROLL_THRESHOLD) {
        // Scrolling DOWN enough → hide
        setIsNavHidden(true);
        accumulatedDelta.current = 0;
      } else if (accumulatedDelta.current < -SCROLL_THRESHOLD) {
        // Scrolling UP enough → show
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

  // Auto-navigate on debounced search
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

  return (
    <>
    {/* Product Reminder Bar — fixed at top, visible whenever in recommendation section */}
    <div
      className={`fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/98 backdrop-blur transition-all duration-300 overflow-hidden ${
        showProductBar && isNavHidden ? "max-h-20 opacity-100" : "max-h-0 opacity-0 border-b-0"
      }`}
    >
      {productInfo && (
        <div className="container flex items-center justify-between py-2.5">
          <div className="flex items-center gap-3">
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="relative h-10 w-8 shrink-0 overflow-hidden">
              <Image
                src={productInfo.image}
                alt={productInfo.name}
                fill
                className="object-contain"
              />
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

    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out ${
        isNavHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Main Navbar */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">

        <div className="container grid grid-cols-3 h-20 items-center">
          {/* Mobile Menu & Search (Left) */}
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className="p-6 border-b border-border text-left">
                  <SheetTitle className="text-xl font-bold tracking-[0.15em] uppercase text-[#111111]">MOEMA</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item}
                      href={`/catalog?category=${item.toLowerCase().replace(" ", "-")}`}
                      className="px-6 py-4 text-sm font-medium uppercase tracking-wide hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
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
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="sm" className="text-xs font-medium uppercase tracking-widest gap-2 hover:bg-transparent" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-4 w-4" strokeWidth={1.5} />
                Search
              </Button>
            )}
          </div>

          {/* Logo (Center) — always truly centered in the grid middle col */}
          <Link href="/" className="flex justify-center">
            <Image 
              src="/MOEMA-Logo.png" 
              alt="MOEMA" 
              width={140} 
              height={40} 
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* User Actions (Right) */}
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
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
          <div className="md:hidden border-t border-border bg-background p-4 animate-in slide-in-from-top duration-300">
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
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </Button>
             </form>
          </div>
        )}

        {/* Desktop Category Navigation (Bottom) */}
        <nav className="hidden md:flex justify-center border-t border-border py-3">
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
      </div>

      {/* Product Reminder Bar — attached to navbar, visible when navbar AND recommendation section */}
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
                <Image
                  src={productInfo.image}
                  alt={productInfo.name}
                  fill
                  className="object-contain"
                />
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