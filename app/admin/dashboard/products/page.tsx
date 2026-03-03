import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAdminProducts } from "@/services/database/product.repository";
import { ProductsTable } from "@/components/admin/products-table";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Product Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your collection inventory
          </p>
        </div>
        <Button asChild className="rounded-none h-10 px-6 text-[10px] uppercase tracking-[0.2em] font-bold">
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
