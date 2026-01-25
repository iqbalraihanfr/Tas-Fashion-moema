import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import Link from "next/link";
import { getProductBySlug } from "@/services/database/product.repository";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container pt-8 pb-20">
      {/* Breadcrumb */}
      <div className="mb-8 text-xs text-muted-foreground uppercase tracking-widest">
        <Link href="/" className="hover:text-foreground">Home</Link> / <Link href="/catalog" className="hover:text-foreground">Bags</Link> / <span className="text-foreground">{product.name}</span>
      </div>

      <ProductDetailClient product={product} />
    </div>
  );
}