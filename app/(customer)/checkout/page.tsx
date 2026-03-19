"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { createOrder } from "@/lib/actions";
import { useState } from "react";

export default function CheckoutPage() {
  const { items: cartItems, subtotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createOrder(formData, cartItems);

    if (result.success && result.url) {
      clearCart();
      window.location.href = result.url;
    } else {
      alert(result.error || "Failed to place order.");
      setIsSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-medium uppercase tracking-wide mb-4">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-8">Please add items to your bag before checking out.</p>
        <Button asChild className="uppercase tracking-widest rounded-none">
          <Link href="/catalog">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  // Reusable order summary items
  const renderOrderSummaryItems = () => (
    <>
      <div className="space-y-6 mb-8">
        {cartItems.map((item) => (
          <div key={item.id + item.color} className="flex gap-4">
            <div className="relative w-16 h-16 bg-white border border-border shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{item.quantity}</span>
            </div>
            <div className="flex-1 text-sm min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-muted-foreground text-xs mt-1">{item.color}</p>
            </div>
            <p className="text-sm font-medium shrink-0">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>Free</span>
        </div>
      </div>
      <div className="border-t border-border mt-6 pt-6 flex justify-between items-center">
        <span className="font-medium uppercase tracking-wide">Total</span>
        <span className="text-xl font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-white">
        {/* Minimal Header for Checkout */}
        <div className="border-b border-border py-4 flex justify-center items-center">
            <Link href="/">
                <Image
                  src="/MOEMA-Logo.png"
                  alt="MOEMA"
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
                />
            </Link>
        </div>

        <div className="container max-w-6xl grid lg:grid-cols-2 gap-0 lg:min-h-[calc(100vh-60px)]">
            {/* LEFT: Form Section */}
            <div className="py-10 pb-36 lg:pb-10 lg:pr-16 lg:border-r border-border">
                {/* Mobile Order Summary — collapsible, semantic HTML */}
                <details className="lg:hidden mb-10 border border-border" id="mobile-order-summary">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none bg-muted/20">
                    <span className="text-sm font-medium uppercase tracking-widest">Order Summary ({cartItems.length})</span>
                    <span className="text-sm font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </summary>
                  <div className="px-5 py-6">
                    {renderOrderSummaryItems()}
                  </div>
                </details>

                <form id="checkout-form" className="max-w-lg mx-auto lg:mx-0 space-y-10" onSubmit={handleSubmit}>
                    
                    {/* Contact */}
                    <section>
                        <h2 className="text-sm font-medium uppercase tracking-widest mb-6">
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" inputMode="email" enterKeyHint="next" autoCapitalize="none" autoCorrect="off" />
                            </div>
                        </div>
                    </section>

                    {/* Shipping Address */}
                    <section>
                         <h2 className="text-sm font-medium uppercase tracking-widest mb-6">Shipping Address</h2>
                         <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" name="firstName" required autoComplete="given-name" enterKeyHint="next" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" name="lastName" required autoComplete="family-name" enterKeyHint="next" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" placeholder="Street, House No." required autoComplete="street-address" enterKeyHint="next" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" required autoComplete="address-level2" enterKeyHint="next" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input id="postalCode" name="postalCode" required autoComplete="postal-code" inputMode="numeric" enterKeyHint="next" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" type="tel" placeholder="+628123..." required autoComplete="tel" inputMode="tel" enterKeyHint="send" />
                                </div>
                            </div>
                         </div>
                    </section>

                    {/* Shipping Method (Static for now) */}
                    <section>
                         <h2 className="text-sm font-medium uppercase tracking-widest mb-4">Shipping Method</h2>
                         <div className="border border-input p-4 flex justify-between items-center text-sm">
                             <span>Standard Shipping (3-5 Days)</span>
                             <span className="font-medium">Free</span>
                         </div>
                    </section>

                    <Button
                      size="lg"
                      className="hidden lg:inline-flex w-full h-14 uppercase tracking-widest text-xs rounded-none"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Order via WhatsApp"}
                    </Button>
                </form>
            </div>

            {/* RIGHT: Desktop Order Summary */}
            <div className="hidden lg:block bg-muted/20 py-10 pl-16">
                 <div className="max-w-md">
                    <h2 className="text-sm font-medium uppercase tracking-widest mb-8">Order Summary</h2>
                    {renderOrderSummaryItems()}
                 </div>
            </div>
        </div>

        <div
          data-mobile-checkout-footer
          className="fixed inset-x-0 bottom-[var(--mobile-consent-offset,0px)] z-[var(--z-sticky-cta)] border-t border-border bg-background/98 px-4 py-3 backdrop-blur lg:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="container flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="text-sm font-medium">Rp {subtotal.toLocaleString("id-ID")}</p>
            </div>
            <Button
              size="lg"
              className="h-12 min-w-[12rem] uppercase tracking-widest text-xs rounded-none"
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Order via WhatsApp"}
            </Button>
          </div>
        </div>
    </div>
  );
}
