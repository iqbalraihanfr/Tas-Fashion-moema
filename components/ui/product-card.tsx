"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { colorToHex } from "@/lib/color-map";
import { ProductGroup } from "@/lib/types";

interface ProductCardProps {
  group: ProductGroup;
  colorMap?: Record<string, string>;
}

export default function ProductCard({ group, colorMap }: ProductCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVariant = group.variants[activeIndex];

  const imageUrl = activeVariant.images?.[0] ?? "/placeholder-bag.jpg";
  const hoverImageUrl = activeVariant.images?.[1] ?? imageUrl;

  return (
    <div className="group flex flex-col h-full">
      <Link href={`/product/${activeVariant.slug}`} className="block">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-[#f5f5f5]">
          {/* Main Image */}
          <Image
            src={imageUrl}
            alt={group.baseName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
          />
          {/* Hover Image */}
          <Image
            src={hoverImageUrl}
            alt={`${group.baseName} - view 2`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 scale-105"
          />
          {/* Quick Add Badge — visible on mobile, hover-reveal on desktop */}
          <div className="absolute bottom-0 left-0 w-full translate-y-0 md:translate-y-full bg-white/90 py-2 text-center text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur transition-transform duration-300 md:group-hover:translate-y-0">
            Quick Add
          </div>
        </div>
      </Link>

      <div className="mt-3 space-y-0.5 text-center">
        <Link href={`/product/${activeVariant.slug}`} className="block">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground line-clamp-1">
            {group.baseName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Rp {activeVariant.price.toLocaleString("id-ID")}
          </p>
        </Link>

        {/* Color swatches — always visible, one per variant, WCAG touch targets */}
        {group.variants.length > 1 && (
          <div className="mt-2 flex justify-center gap-0.5">
            {group.variants.map((variant, i) => (
              <button
                key={variant.id}
                onClick={() => setActiveIndex(i)}
                title={variant.color}
                aria-label={`Select color: ${variant.color}`}
                className="p-1.5 flex items-center justify-center cursor-pointer"
              >
                <span
                  className={`block rounded-full border transition-all duration-200 ${
                    i === activeIndex
                      ? "h-4.5 w-4.5 border-foreground ring-1 ring-foreground ring-offset-1"
                      : "h-3.5 w-3.5 border-gray-300 hover:scale-110"
                  }`}
                  style={{ backgroundColor: colorMap ? (colorMap[variant.color] ?? '#d4c4b7') : colorToHex(variant.color) }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
