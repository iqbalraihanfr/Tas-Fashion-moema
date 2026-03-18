import { ProductForm } from "@/components/admin/product-form";
import { getUniqueBaseNames } from "@/services/database/product.repository";
import { getAllColors } from "@/services/database/color.repository";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const [existingBaseNames, colors] = await Promise.all([
    getUniqueBaseNames(),
    getAllColors(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
          <Link href="/admin/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create New Product</h1>
          <p className="text-sm text-muted-foreground">Add a new item to your store inventory.</p>
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm p-6">
        <ProductForm existingBaseNames={existingBaseNames} colors={colors} />
      </div>
    </div>
  );
}
