import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/product-card";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import * as showcaseService from "@/services/showcase.service";

export default async function Home() {
  const [{ data: newArrivals, error }, showcases] = await Promise.all([
    supabase
      .from('Product')
      .select('id, name, slug, price, images')
      .eq('is_archived', false)
      .order('createdAt', { ascending: false })
      .limit(8),
    showcaseService.getActiveShowcases(),
  ]);

  if (error) {
    console.error("Error fetching new arrivals:", error);
  }

  const products = newArrivals || [];

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] bg-[#CFCCA7] overflow-hidden">
        <div className="absolute inset-0 flex flex-col md:flex-row">
           {/* Left: Text Content */}
           <div className="flex-1 flex flex-col justify-center px-8 md:px-20 z-10">
              <span className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-white/80 mix-blend-difference">Spring Summer 2025</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight uppercase mb-6 leading-[0.9] text-black">
                Modern <br/><span className="font-serif italic lowercase text-6xl md:text-8xl">Sculpture</span>
              </h1>
              <p className="max-w-md text-sm text-black/80 mb-8 leading-relaxed font-medium">
                Explore the new collection defining the silhouette of the season. Minimalist forms meet maximalist function.
              </p>
              <div>
                <Button size="lg" className="rounded-none px-10 uppercase tracking-widest text-xs h-12 bg-black text-white hover:bg-black/80" asChild>
                  <Link href="/catalog">Shop Collection</Link>
                </Button>
              </div>
           </div>
           
           {/* Right: Image */}
           <div className="flex-1 relative h-full min-h-[50vh] md:min-h-0">
             <Image 
               src="/hero-banner.jpg" 
               alt="Hero Campaign" 
               fill 
               className="object-cover"
               priority
             />
           </div>
        </div>
      </section>

      {/* CATEGORY GRID - DYNAMIC SHOWCASES */}
      {showcases.length > 0 && (
        <section className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First showcase = large left panel */}
            {showcases[0] && (
              <div className="relative aspect-[4/3] md:aspect-auto md:h-[600px] bg-muted group overflow-hidden">
                <Image src={showcases[0].image_url} alt={showcases[0].title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-10 left-10 text-white">
                  <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">{showcases[0].title}</h2>
                  {showcases[0].subtitle && <p className="text-xs text-white/80 mb-2">{showcases[0].subtitle}</p>}
                  <Link href={showcases[0].link_url} className="text-xs font-bold border-b border-white pb-1 uppercase tracking-wider hover:text-gray-200 hover:border-gray-200 transition-colors">Shop Now</Link>
                </div>
              </div>
            )}
            {/* Remaining showcases = stacked right panels */}
            {showcases.length > 1 && (
              <div className="grid grid-rows-2 gap-4">
                {showcases.slice(1, 3).map((item) => (
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
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
           <Button variant="outline" className="uppercase tracking-widest text-xs rounded-none border-foreground text-foreground w-full" asChild>
              <Link href="/catalog">View All</Link>
           </Button>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-[#1a1a1a] text-white py-20">
        <div className="container max-w-2xl text-center">
           <h3 className="text-2xl font-light uppercase tracking-[0.2em] mb-4">Join the List</h3>
           <p className="text-sm text-gray-400 mb-8 leading-relaxed">
             Sign up to receive updates on new arrivals, exclusive access to sales, and style inspiration.
           </p>
           <form className="flex flex-col sm:flex-row gap-4">
             <input 
               type="email" 
               placeholder="EMAIL ADDRESS" 
               className="flex-1 bg-transparent border-b border-gray-600 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-white transition-colors uppercase tracking-wide text-center sm:text-left"
             />
             <button type="submit" className="text-xs font-bold uppercase tracking-[0.2em] py-3 border-b border-white hover:text-gray-300 hover:border-gray-300 transition-colors">
               Subscribe
             </button>
           </form>
        </div>
      </section>
    </div>
  );
}
