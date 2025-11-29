import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/product-card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] bg-[#f0ebe6] overflow-hidden">
        <div className="absolute inset-0 flex flex-col md:flex-row">
           {/* Left: Text Content */}
           <div className="flex-1 flex flex-col justify-center px-8 md:px-20 z-10">
              <span className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-muted-foreground">Spring Summer 2025</span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight uppercase mb-6 leading-[0.9]">
                Modern <br/><span className="font-serif italic lowercase text-6xl md:text-8xl">Sculpture</span>
              </h1>
              <p className="max-w-md text-sm text-muted-foreground mb-8 leading-relaxed">
                Explore the new collection defining the silhouette of the season. Minimalist forms meet maximalist function.
              </p>
              <div>
                <Button size="lg" className="rounded-none px-10 uppercase tracking-widest text-xs h-12" asChild>
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

      {/* CATEGORY GRID - BAGS ONLY */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-[600px] bg-muted group overflow-hidden">
            <Image src="/bag-1.jpg" alt="Work Bags" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-10 left-10 text-white">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">Work Bags</h2>
              <Link href="/catalog?category=totes" className="text-xs font-bold border-b border-white pb-1 uppercase tracking-wider hover:text-gray-200 hover:border-gray-200 transition-colors">Shop Now</Link>
            </div>
          </div>
          <div className="grid grid-rows-2 gap-4">
             <div className="relative bg-muted group overflow-hidden">
                <Image src="/bag-2.jpg" alt="Evening Clutches" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Evening Clutches</h2>
                  <Link href="/catalog?category=clutches" className="text-xs font-bold border-b border-white pb-1 uppercase tracking-wider">Shop Now</Link>
                </div>
             </div>
             <div className="relative bg-muted group overflow-hidden">
                <Image src="/bag-3.jpg" alt="Daily Essentials" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Daily Essentials</h2>
                  <Link href="/catalog?category=shoulder-bags" className="text-xs font-bold border-b border-white pb-1 uppercase tracking-wider">Shop Now</Link>
                </div>
             </div>
          </div>
        </div>
      </section>

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
          {dummyProducts.map((product) => (
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

const dummyProducts = [
  {
    id: "prod1",
    name: "Gabine Saddle Bag",
    slug: "gabine-saddle-bag",
    price: 1299000,
    images: ["/bag-1.jpg"],
  },
  {
    id: "prod2",
    name: "Cesile Boxy Shoulder",
    slug: "cesile-boxy-shoulder",
    price: 1099000,
    images: ["/bag-2.jpg"],
  },
  {
    id: "prod3",
    name: "Koa Square Push-Lock",
    slug: "koa-square-push-lock",
    price: 1199000,
    images: ["/bag-3.jpg"],
  },
  {
    id: "prod4",
    name: "Perline Beaded Handle",
    slug: "perline-beaded-handle",
    price: 999000,
    images: ["/bag-4.jpg"],
  },
  {
    id: "prod5",
    name: "Aubrielle Buckle Bag",
    slug: "aubrielle-buckle-bag",
    price: 1399000,
    images: ["/bag-5.jpg"],
  },
  {
    id: "prod6",
    name: "Daylla Tote Bag",
    slug: "daylla-tote-bag",
    price: 1599000,
    images: ["/bag-6.jpg"],
  },
  {
    id: "prod7",
    name: "Mini Gabine Saddle",
    slug: "mini-gabine-saddle",
    price: 899000,
    images: ["/bag-7.jpg"],
  },
  {
    id: "prod8",
    name: "Chain Strap Evening",
    slug: "chain-strap-evening",
    price: 1499000,
    images: ["/bag-8.jpg"],
  },
];
