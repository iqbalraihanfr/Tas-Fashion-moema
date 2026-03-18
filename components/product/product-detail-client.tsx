"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Heart, Share2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useProductNav } from "@/features/products/ProductNavProvider";
import { Product, ProductVariant } from "@/lib/types";
import { colorToHex } from "@/lib/color-map";

interface ProductDetailClientProps {
  product: Product;
  recommendedProducts: Product[];
  colorVariants: ProductVariant[];
}

export function ProductDetailClient({ product, recommendedProducts, colorVariants }: ProductDetailClientProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { addItem } = useCart();
  const { setProductInfo, setIsInRecommendationSection } = useProductNav();
  const recommendationRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Register product info in nav context
  useEffect(() => {
    setProductInfo({
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder-bag.jpg",
      slug: product.slug,
    });
    return () => setProductInfo(null);
  }, [product, setProductInfo]);

  // IntersectionObserver for recommendation section
  useEffect(() => {
    const el = recommendationRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInRecommendationSection(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      setIsInRecommendationSection(false);
    };
  }, [setIsInRecommendationSection]);

  const handleAddToBag = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder-bag.jpg",
      color: product.color,
      slug: product.slug
    });
  };

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder-bag.jpg"];

  // Carousel scroll helpers
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.7;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setIsFullscreen(false)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsFullscreen(false)}
            aria-label="Close fullscreen"
          >
            <X className="w-8 h-8 md:w-10 md:h-10" />
          </button>
          <div className="relative w-full h-full max-w-6xl mx-auto">
            <Image 
              src={images[selectedImageIdx]} 
              alt={`${product.name} fullscreen view`} 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}

      {/* Product Detail Section */}
      <div data-product-section className="flex flex-col lg:flex-row gap-12 lg:gap-20">
         {/* Left: Image Gallery */}
        <div className="flex-1 lg:w-[60%] flex flex-col md:flex-row gap-4 h-fit">
           {/* Thumbnails */}
           <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[80vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0 md:w-24 pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative shrink-0 w-20 md:w-full border-2 transition-colors overflow-hidden ${selectedImageIdx === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                >
                  <Image 
                    src={img} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    width={100}
                    height={125}
                    className="w-full h-auto block" 
                  />
                </button>
              ))}
            </div>
           
           {/* Main Image */}
           <button 
              className="order-1 md:order-2 flex-1 cursor-zoom-in group overflow-hidden"
              onClick={() => setIsFullscreen(true)}
              title="Click to view full screen"
            >
              <Image 
                src={images[selectedImageIdx]} 
                alt={`${product.name} main view`} 
                width={800}
                height={1000}
                priority
                className="w-full h-auto block transition-transform duration-500" 
              />
            </button>
         </div>

        {/* Right: Product Info (Sticky) */}
        <div className="lg:w-[35%] lg:sticky lg:top-24 h-fit space-y-8">
          <div>
            <h1 className="text-3xl font-medium uppercase tracking-wide mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground">Rp {product.price.toLocaleString("id-ID")}</p>
          </div>

          {/* Color Selection — dynamic variants from DB */}
          {colorVariants.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-widest block mb-3">
                Color: {product.color}
              </span>
              <div className="flex gap-3">
                {colorVariants.map((variant) => {
                  const isActive = variant.slug === product.slug;
                  const hex = colorToHex(variant.color);
                  const isDark = hex < "#888888";
                  return (
                    <Link
                      key={variant.id}
                      href={`/product/${variant.slug}`}
                      title={variant.color}
                      aria-label={variant.color}
                      className={`h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center transition-all shrink-0 ${
                        isActive ? 'ring-2 ring-offset-2 ring-foreground' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {isActive && (
                        <Check className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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

      {/* Recommendation Section */}
      {recommendedProducts.length > 0 && (
        <div ref={recommendationRef} data-recommendation-section className="mt-24 pt-16 border-t border-gray-200">
          <h2 className="text-center text-xs font-bold uppercase tracking-[0.35em] mb-12">
            Anda Mungkin Juga Menyukai
          </h2>

          <div className="relative group/carousel">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCarousel("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white -translate-x-1/2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Carousel */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth pb-4"
            >
              {recommendedProducts.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/product/${rec.slug}`}
                  className="shrink-0 w-[220px] md:w-[260px] snap-start group"
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-gray-50 mb-4">
                    <Image
                      src={rec.images && rec.images.length > 0 ? rec.images[0] : "/placeholder-bag.jpg"}
                      alt={rec.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-1 truncate group-hover:text-muted-foreground transition-colors">
                    {rec.name}
                  </h3>
                  <p className="text-xs text-muted-foreground tracking-wide">
                    Rp {rec.price.toLocaleString("id-ID")}
                  </p>
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCarousel("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white translate-x-1/2"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
