import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || "/placeholder-bag.jpg";
  
  // Simulasi image kedua untuk hover effect (di real app ambil dari images[1])
  const hoverImageUrl = product.images?.[1] || imageUrl; 

  return (
    <Link href={`/product/${product.slug}`} className="group block h-full flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f5f5f5]">
        {/* Main Image */}
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
        />
        {/* Hover Image (Revealed on hover) - For now using same image but maybe zoomed or different if available */}
        <Image
          src={hoverImageUrl}
          alt={`${product.name} - view 2`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 scale-105"
        />
        
        {/* Quick Add Badge (Optional C&K style) */}
        <div className="absolute bottom-0 left-0 w-full translate-y-full bg-white/90 py-2 text-center text-[10px] font-semibold uppercase tracking-widest backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
          Quick Add
        </div>
      </div>
      
      <div className="mt-4 space-y-1 text-center">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
        {/* Color swatches simulation */}
        <div className="mt-2 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="h-2 w-2 rounded-full bg-black border border-gray-300"></span>
            <span className="h-2 w-2 rounded-full bg-[#d4c4b7] border border-gray-300"></span>
        </div>
      </div>
    </Link>
  );
}