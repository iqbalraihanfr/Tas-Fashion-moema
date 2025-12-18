"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const navItems = ["New Arrivals", "Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks", "Sale"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar (Promo/Info) */}
      <div className="bg-primary text-primary-foreground text-[10px] py-1.5 text-center tracking-widest uppercase">
        Free Standard Shipping on All Orders
      </div>

      <div className="container flex h-20 items-center justify-between">
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

        {/* Logo (Center) */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
        <div className="flex items-center gap-2">
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
    </header>
  );
}