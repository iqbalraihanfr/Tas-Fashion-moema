import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/product-card";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import * as showcaseService from "@/services/showcase.service";
import { getAllColors, colorsToMap } from "@/services/database/color.repository";
import { groupProductsByBaseName } from "@/lib/product-utils";
import type { Product } from "@/lib/types";

export default async function Home() {
  const [{ data: newArrivals, error }, showcases, colors] = await Promise.all([
    supabase
      .from('Product')
      .select('*')
      .eq('is_archived', false)
      .order('createdAt', { ascending: false })
      .limit(8),
    showcaseService.getActiveShowcases(),
    getAllColors(),
  ]);

  const colorMap = colorsToMap(colors);

  if (error) {
    console.error("Error fetching new arrivals:", error);
  }

  // Cast is safe: no generated Supabase schema types in this project, so newArrivals is any[].
  const productGroups = groupProductsByBaseName((newArrivals ?? []) as Product[]);

  // Separate hero (position 0) from category banners (position 1+)
  const hero = showcases.find((s) => s.position === 0);
  const categoryShowcases = showcases.filter((s) => s.position !== 0);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MOEMA",
    "url": "https://www.moemacollection.com",
    "logo": "https://www.moemacollection.com/MOEMA-Logo.png",
    "sameAs": [
      "https://www.instagram.com/moemacollection",
      "https://www.facebook.com/moemacollection",
      "https://twitter.com/moemacollection"
    ],
    "description": "Discover luxury branded bags and modern sculpture with MOEMA."
  };

  return (
    <div className="space-y-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* HERO JUMBOTRON — fills viewport minus navbar */}

      {hero && (
        <section
          className="relative w-full overflow-hidden"
          style={{ height: "calc(100dvh - 80px)" }}
        >
          <Image
            src={hero.image_url}
            alt={hero.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          <div className="relative h-full flex items-end">
            <div className="px-8 md:px-16 pb-16 md:pb-20">
              {hero.subtitle && (
                <span className="text-xs font-bold tracking-[0.3em] uppercase mb-4 block text-white/70">
                  {hero.subtitle}
                </span>
              )}
              <h1 className="text-5xl md:text-7xl font-light tracking-tight uppercase mb-6 leading-[0.9] text-white">
                {hero.title}
              </h1>
              <Button size="lg" className="rounded-none px-10 uppercase tracking-widest text-xs h-12 bg-white text-black hover:bg-white/90" asChild>
                <Link href={hero.link_url}>Shop Collection</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Fallback hero if no showcase hero is set */}
      {!hero && (
        <section
          className="relative w-full overflow-hidden"
          style={{ height: "calc(100dvh - 80px)" }}
        >
          <Image
            src="/hero-banner.jpg"
            alt="MOEMA Modern Sculpture Collection"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          <div className="relative h-full flex items-end">
            <div className="px-8 md:px-16 pb-16 md:pb-20">
              <span className="text-xs font-bold tracking-[0.3em] uppercase mb-4 block text-white/70">Spring Summer 2025</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight uppercase mb-6 leading-[0.9] text-white">
                Modern <br/><span className="font-serif italic lowercase text-6xl md:text-8xl">Sculpture</span>
              </h1>
              <Button size="lg" className="rounded-none px-10 uppercase tracking-widest text-xs h-12 bg-white text-black hover:bg-white/90" asChild>
                <Link href="/catalog">Shop Collection</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY GRID - DYNAMIC SHOWCASES */}
      {categoryShowcases.length > 0 && (
        <section className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First category = large left panel */}
            {categoryShowcases[0] && (
              <div className="relative aspect-4/3 md:aspect-auto md:h-[600px] bg-muted group overflow-hidden">
                <Image src={categoryShowcases[0].image_url} alt={categoryShowcases[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-10 left-10 text-white">
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">{categoryShowcases[0].title}</h2>
                  {categoryShowcases[0].subtitle && <p className="text-xs text-white/80 mb-2">{categoryShowcases[0].subtitle}</p>}
                  <Link href={categoryShowcases[0].link_url} className="text-xs font-bold border-b border-white pb-1 uppercase tracking-wider hover:text-gray-200 hover:border-gray-200 transition-colors">Shop Now</Link>
                </div>
              </div>
            )}
            {/* Remaining = stacked right panels */}
            {categoryShowcases.length > 1 && (
              <div className="grid grid-rows-2 gap-4">
                {categoryShowcases.slice(1, 3).map((item) => (
                  <div key={item.id} className="relative bg-muted group overflow-hidden">
                    <Image src={item.image_url} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-8 left-8 text-white">
                      <h2 className="text-xl font-bold uppercase tracking-widest mb-1">{item.title}</h2>
                      {item.subtitle && <p className="text-xs text-white/80 mb-2">{item.subtitle}</p>}
                      <Link href={item.link_url} className="text-xs font-bold border-b border-white pb-1 uppercase tracking-wider">Shop Now</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      <section className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] mb-2">New In</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Fresh drops from the atelier</p>
          </div>
          <Link href="/catalog" className="hidden md:block text-xs font-bold uppercase tracking-widest border-b border-foreground pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-colors">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {productGroups.map((group) => (
            <ProductCard key={group.baseName} group={group} colorMap={colorMap} />
          ))}
        </div>
        
        <div className="mt-10 mb-10 text-center md:hidden">
           <Button variant="outline" className="uppercase tracking-widest text-xs rounded-none border-foreground text-foreground w-full" asChild>
              <Link href="/catalog">View All</Link>
           </Button>
        </div>
      </section>

    </div>
  );
}
