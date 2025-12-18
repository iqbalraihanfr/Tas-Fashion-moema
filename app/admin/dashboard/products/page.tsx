import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase"; // Using admin client for products to bypass RLS in admin context
import { DeleteProductButton } from "@/components/admin/delete-product-button"; // Import the delete button

export default async function AdminProductsPage() {
  const { data: products, error } = await supabaseAdmin.from('Product').select('*').order('createdAt', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading products.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button asChild>
          <Link href="/admin/dashboard/products/new">Add New Product</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder-bag.jpg"}
                    alt={product.name}
                    width={60}
                    height={60}
                    className="aspect-square rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild className="mr-2">
                    <Link href={`/admin/dashboard/products/${product.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteProductButton productId={product.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
