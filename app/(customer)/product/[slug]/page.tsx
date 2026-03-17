import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import Link from "next/link";
import { getProductBySlug, getRecommendedProducts } from "@/services/database/product.repository";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const baseUrl = "https://www.moemacollection.com";

  if (!product) return {};

  const description = product.description.slice(0, 160);
  const ogImage = product.images?.[0] || "/og-image.png";

  return {
    title: `${product.name} | MOEMA`,
    description,
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      url: `${baseUrl}/product/${product.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [ogImage],
    },
  };
}


export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, recommendedProducts] = await Promise.all([
    getProductBySlug(slug),
    getRecommendedProducts(slug, 8),
  ]);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "MOEMA"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "IDR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug}`
    }
  };

  return (
    <div className="container pt-12 pb-24">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb - Luxury Style */}
      <div className="mb-12 text-[10px] text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-4">
        <Link href="/" className="hover:text-foreground transition-colors">Atelier</Link> 
        <span className="text-muted-foreground/30">/</span>
        <Link href="/catalog" className="hover:text-foreground transition-colors">Collection</Link> 
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-bold">{product.name}</span>
      </div>

      <ProductDetailClient product={product} recommendedProducts={recommendedProducts} />
    </div>
  );
}
