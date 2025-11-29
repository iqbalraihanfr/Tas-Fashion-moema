"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
        {/* Minimal Header for Checkout */}
        <div className="border-b border-border py-4 flex justify-center items-center">
            <Link href="/" className="font-bold text-xl tracking-[0.15em] uppercase">TASFASHIONE</Link>
        </div>

        <div className="container max-w-6xl grid lg:grid-cols-2 gap-0 lg:min-h-[calc(100vh-60px)]">
            {/* LEFT: Form Section */}
            <div className="py-10 lg:pr-16 lg:border-r border-border">
                <div className="max-w-lg mx-auto lg:mx-0 space-y-10">
                    
                    {/* Contact */}
                    <section>
                        <h2 className="text-sm font-medium uppercase tracking-widest mb-6 flex items-center justify-between">
                            Contact Information
                            <Link href="/login" className="text-[10px] underline normal-case text-muted-foreground">Already have an account?</Link>
                        </h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@example.com" />
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
                                    <Input id="firstName" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" placeholder="Street, House No." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input id="postalCode" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" type="tel" />
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

                    {/* Payment (Static for now) */}
                    <section>
                         <h2 className="text-sm font-medium uppercase tracking-widest mb-4">Payment</h2>
                         <div className="text-sm text-muted-foreground bg-muted/30 p-4 border border-border">
                            Payment gateway (Xendit) will be integrated here. Redirects to secure payment after order placement.
                         </div>
                    </section>

                    <Button size="lg" className="w-full h-14 uppercase tracking-widest text-xs rounded-none">
                        Place Order
                    </Button>
                </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="hidden lg:block bg-muted/20 py-10 pl-16">
                 <div className="max-w-md">
                    <h2 className="text-sm font-medium uppercase tracking-widest mb-8">Order Summary</h2>
                    
                    {/* Items */}
                    <div className="space-y-6 mb-8">
                        <div className="flex gap-4">
                            <div className="relative w-16 h-16 bg-white border border-border">
                                <Image src="/bag-1.jpg" alt="Bag" fill className="object-cover" />
                                <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">1</span>
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="font-medium">Gabine Saddle Bag</p>
                                <p className="text-muted-foreground text-xs mt-1">Black</p>
                            </div>
                            <p className="text-sm font-medium">Rp 1.299.000</p>
                        </div>
                         <div className="flex gap-4">
                            <div className="relative w-16 h-16 bg-white border border-border">
                                <Image src="/bag-4.jpg" alt="Bag" fill className="object-cover" />
                                <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">1</span>
                            </div>
                            <div className="flex-1 text-sm">
                                <p className="font-medium">Perline Beaded Handle</p>
                                <p className="text-muted-foreground text-xs mt-1">Cream</p>
                            </div>
                            <p className="text-sm font-medium">Rp 999.000</p>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-border pt-6 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>Rp 2.298.000</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>Free</span>
                        </div>
                    </div>
                    
                    <div className="border-t border-border mt-6 pt-6 flex justify-between items-center">
                        <span className="font-medium uppercase tracking-wide">Total</span>
                        <span className="text-xl font-medium">Rp 2.298.000</span>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
}
