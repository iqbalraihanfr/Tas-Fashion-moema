"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { useState } from "react";

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = ["New Arrivals", "Totes", "Shoulder Bags", "Crossbody", "Mini Bags", "Clutches", "Backpacks", "Sale"];

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
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <SheetHeader className="p-6 border-b border-border text-left">
                <SheetTitle className="text-xl font-bold tracking-[0.15em] uppercase">MOEMA</SheetTitle>
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
                <div className="mt-4 px-6">
                   <Button variant="outline" className="w-full justify-start gap-3 uppercase tracking-wide text-xs h-12" asChild>
                      <Link href="/login">
                        <User className="h-4 w-4" /> Sign In
                      </Link>
                   </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Search (Left) */}
        <div className="hidden md:flex items-center">
          <Button variant="ghost" size="sm" className="text-xs font-medium uppercase tracking-wide gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
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
          <Button variant="ghost" size="sm" className="hidden md:flex text-xs font-medium uppercase tracking-wide gap-2">
             <User className="h-4 w-4" />
             Sign In
          </Button>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

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