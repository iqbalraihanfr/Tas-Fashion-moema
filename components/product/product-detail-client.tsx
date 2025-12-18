"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Product } from "@/lib/types";

// Mock colors for now as DB schema doesn't have colors
const MOCK_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "Cream", hex: "#f5f5dc" },
    { name: "Taupe", hex: "#483C32" }
];

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(MOCK_COLORS[0]);
  const { addItem } = useCart();

  const handleAddToBag = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder-bag.jpg",
      color: selectedColor.name,
      slug: product.slug
    });
  };

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder-bag.jpg"];

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left: Image Gallery */}
        <div className="flex-1 lg:w-[60%]">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {images.map((img, idx) => (
               <div key={idx} className={`relative aspect-square bg-muted ${idx === 0 ? 'md:col-span-2 md:aspect-[4/3]' : ''}`}>
                 <Image 
                   src={img} 
                   alt={`${product.name} view ${idx + 1}`} 
                   fill 
                   className="object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in" 
                 />
               </div>
             ))}
           </div>
        </div>

        {/* Right: Product Info (Sticky) */}
        <div className="lg:w-[35%] lg:sticky lg:top-24 h-fit space-y-8">
          <div>
            <h1 className="text-3xl font-medium uppercase tracking-wide mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground">Rp {product.price.toLocaleString("id-ID")}</p>
          </div>

          {/* Color Selection */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest block mb-3">Color: {selectedColor.name}</span>
            <div className="flex gap-3">
              {MOCK_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center transition-all ${selectedColor.name === color.name ? 'ring-2 ring-offset-2 ring-foreground' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                   {selectedColor.name === color.name && <Check className={`w-4 h-4 ${color.name === 'Black' || color.name === 'Taupe' ? 'text-white' : 'text-black'}`} />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button size="lg" className="w-full h-12 uppercase tracking-widest text-xs rounded-none" onClick={handleAddToBag}>
                Add to Bag
            </Button>
            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" size="lg" className="w-full h-12 uppercase tracking-widest text-xs rounded-none border-gray-300">
                 <Heart className="mr-2 h-4 w-4" /> Wishlist
               </Button>
               <Button variant="outline" size="lg" className="w-full h-12 uppercase tracking-widest text-xs rounded-none border-gray-300">
                 <Share2 className="mr-2 h-4 w-4" /> Share
               </Button>
            </div>
          </div>

          {/* Product Details Accordion */}
          <div className="pt-6 border-t border-gray-200">
            <Accordion type="single" collapsible className="w-full" defaultValue="description">
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  {product.description}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Free standard shipping on orders over Rp 2.000.000.</p>
                  <p>Returns accepted within 30 days of purchase. Items must be in original condition with tags attached.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Material & Care</AccordionTrigger>
                <AccordionContent>
                  Wipe clean with a damp cloth. Do not wash. Store in provided dust bag when not in use.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
  );
}
