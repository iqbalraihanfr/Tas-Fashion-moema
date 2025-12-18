import { ProductForm } from "@/components/admin/product-form";
import { supabaseAdmin } from "@/lib/supabase"; // Import supabaseAdmin
import { Product } from "@/lib/types"; // Import Product type

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
    return <div>Product not found or error fetching data.</div>;
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
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product: {initialData.name}</h1>
      <ProductForm initialData={initialData} />
    </div>
  );
}
