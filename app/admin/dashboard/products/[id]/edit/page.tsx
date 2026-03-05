import { ProductForm } from "@/components/admin/product-form";
import { supabaseAdmin } from "@/lib/supabase"; // Import supabaseAdmin
import { Product } from "@/lib/types"; // Import Product type
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch product data using supabaseAdmin
  const { data: product, error } = await supabaseAdmin
    .from('Product')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error("Error fetching product for edit:", error);
    return <div className="text-center py-10 text-muted-foreground">Product not found or error fetching data.</div>;
  }

  // Cast to Product type if needed, as Supabase returns generic object
  const initialData: Product = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    images: product.images,
    baseName: product.base_name || product.name, // Handle snake_case from DB if needed, or camelCase
    sku: product.sku,
    color: product.color,
    dimensions: product.dimensions,
    category: product.category ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    is_archived: product.is_archived ?? false,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
          <Link href="/admin/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground font-mono">{initialData.name}</p>
        </div>
      </div>
      
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <ProductForm initialData={initialData} />
      </div>
    </div>
  );
}
