"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const { items: cartItems, subtotal, updateQuantity, removeItem } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-medium uppercase tracking-wide mb-4">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven&apos;t made your choice yet.</p>
        <Button asChild className="uppercase tracking-widest rounded-none">
          <Link href="/catalog">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container pt-10 pb-36 lg:pb-20">
      <h1 className="text-3xl font-medium uppercase tracking-wide mb-10">Shopping Bag</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1 space-y-8">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.color}`} className="flex gap-4 sm:gap-6 py-6 border-b border-border last:border-0">
              {/* Image */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium uppercase tracking-wide text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Color: {item.color}</p>
                  </div>
                  <p className="font-medium text-sm sm:text-base shrink-0">Rp {item.price.toLocaleString("id-ID")}</p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  {/* Quantity Control — enlarged touch targets for mobile */}
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="min-w-10 h-10 hover:bg-muted transition-colors flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="min-w-10 h-10 hover:bg-muted transition-colors flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-2"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Sticky */}
        <div className="lg:w-1/3 h-fit bg-muted/30 p-6 lg:sticky lg:top-24">
          <h2 className="font-medium uppercase tracking-wide mb-6">Order Summary</h2>
          
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground text-xs">Calculated at checkout</span>
            </div>
          </div>

          <div className="flex justify-between font-medium text-base border-t border-border pt-4 mb-8">
            <span>Total</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>

          <Button size="lg" className="w-full h-12 uppercase tracking-widest text-xs rounded-none flex justify-between group" asChild>
            <Link href="/checkout">
               <span>Checkout</span>
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          
          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Taxes and shipping calculated at checkout.
          </p>
        </div>
      </div>

      <div
        data-mobile-cart-footer
        className="fixed inset-x-0 bottom-[var(--mobile-consent-offset,0px)] z-[var(--z-sticky-cta)] border-t border-border bg-background/98 px-4 py-3 backdrop-blur lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="container flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="text-sm font-medium">Rp {subtotal.toLocaleString("id-ID")}</p>
          </div>
          <Button size="lg" className="h-12 min-w-[10rem] uppercase tracking-widest text-xs rounded-none" asChild>
            <Link href="/checkout">
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
