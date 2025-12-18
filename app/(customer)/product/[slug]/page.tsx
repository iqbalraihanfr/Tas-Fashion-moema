import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import Link from "next/link";
import { Product } from "@/lib/types";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from('Product')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // Cast type properly
  const typedProduct = product as Product;

  return (
    <div className="container pt-8 pb-20">
      {/* Breadcrumb */}
      <div className="mb-8 text-xs text-muted-foreground uppercase tracking-widest">
        <Link href="/" className="hover:text-foreground">Home</Link> / <Link href="/catalog" className="hover:text-foreground">Bags</Link> / <span className="text-foreground">{typedProduct.name}</span>
      </div>

      <ProductDetailClient product={typedProduct} />
    </div>
  );
}