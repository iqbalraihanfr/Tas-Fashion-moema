"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  // Mock Cart Data
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      name: "Gabine Saddle Bag",
      color: "Black",
      price: 1299000,
      quantity: 1,
      image: "/bag-1.jpg"
    },
    {
      id: "2",
      name: "Perline Beaded Handle",
      color: "Cream",
      price: 999000,
      quantity: 1,
      image: "/bag-4.jpg"
    }
  ]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-medium uppercase tracking-wide mb-4">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't made your choice yet.</p>
        <Button asChild className="uppercase tracking-widest rounded-none">
          <Link href="/catalog">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container pt-10 pb-20">
      <h1 className="text-3xl font-medium uppercase tracking-wide mb-10">Shopping Bag</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1 space-y-8">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-6 py-6 border-b border-border last:border-0">
              {/* Image */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium uppercase tracking-wide text-sm sm:text-base">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Color: {item.color}</p>
                  </div>
                  <p className="font-medium text-sm sm:text-base">Rp {item.price.toLocaleString("id-ID")}</p>
                </div>

                <div className="flex justify-between items-end mt-4">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-border">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                  >
                    Remove
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
    </div>
  );
}
