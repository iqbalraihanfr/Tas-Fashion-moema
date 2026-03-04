import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAdminProducts } from "@/services/database/product.repository";
import { ProductsTable } from "@/components/admin/products-table";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your collection inventory
          </p>
        </div>
        <Button asChild className="h-9 px-4 rounded-md text-sm font-medium">
          <Link href="/admin/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Products Table with Search & Filters */}
      <ProductsTable products={products} />
    </div>
  );
}
