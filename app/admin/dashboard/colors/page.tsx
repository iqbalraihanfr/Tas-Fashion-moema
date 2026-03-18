import { getAllColors } from "@/services/database/color.repository";
import { ColorManager } from "@/components/admin/color-manager";

export default async function ColorsPage() {
  const colors = await getAllColors();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Color Palette</h1>
        <p className="text-sm text-muted-foreground">
          Manage colors used across all product variants. Colors are shared store-wide.
        </p>
      </div>

      <ColorManager initialColors={colors} />
    </div>
  );
}
