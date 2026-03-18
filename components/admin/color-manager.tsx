"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { createColorAction, deleteColorAction } from "@/lib/admin-actions";
import type { ColorEntry } from "@/services/database/color.repository";

interface ColorManagerProps {
  initialColors: ColorEntry[];
}

export function ColorManager({ initialColors }: ColorManagerProps) {
  const [colors, setColors] = useState<ColorEntry[]>(initialColors);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#c19a6b");
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ id: string; message: string; usedBy: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    setError(null);
    if (!newName.trim()) {
      setError("Color name is required.");
      return;
    }
    if (colors.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      setError(`"${newName.trim()}" already exists.`);
      return;
    }

    const formData = new FormData();
    formData.set("name", newName.trim());
    formData.set("hex", newHex);

    startTransition(async () => {
      const result = await createColorAction(formData);
      if (!result.success) {
        setError(result.error ?? "Failed to add color.");
        return;
      }
      // Optimistic: add to list with a temp id
      setColors((prev) => [
        ...prev,
        { id: `temp-${Date.now()}`, name: newName.trim(), hex: newHex, createdAt: new Date().toISOString() },
      ].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewHex("#c19a6b");
    });
  };

  const handleDelete = (color: ColorEntry) => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteColorAction(color.id);
      if (!result.success) {
        setDeleteError({
          id: color.id,
          message: result.error ?? "Cannot delete this color.",
          usedBy: result.usedBy ?? [],
        });
        return;
      }
      setColors((prev) => prev.filter((c) => c.id !== color.id));
    });
  };

  return (
    <div className="space-y-8">
      {/* Add Color Form */}
      <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Add New Color</h2>
          <p className="text-sm text-muted-foreground">
            Pick a color with the wheel, give it a name, and save it to your palette.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Color Wheel */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider">Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                title="Pick a color"
              />
              <Input
                value={newHex}
                onChange={(e) => setNewHex(e.target.value)}
                className="h-10 w-28 font-mono text-sm"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>

          {/* Color Name */}
          <div className="space-y-1.5 flex-1 min-w-[160px]">
            <Label htmlFor="color-name" className="text-xs font-medium uppercase tracking-wider">
              Color Name
            </Label>
            <Input
              id="color-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Dusty Rose"
              className="h-10"
            />
          </div>

          {/* Preview + Submit */}
          <div className="flex items-center gap-3">
            {newName && (
              <div
                className="h-10 w-10 rounded-full border border-gray-300 shrink-0"
                style={{ backgroundColor: newHex }}
                title={newName}
              />
            )}
            <Button
              onClick={handleAdd}
              disabled={isPending}
              className="h-10 gap-1.5 uppercase tracking-widest text-xs rounded-none px-6"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* Delete error notice */}
      {deleteError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm space-y-2">
          <p className="font-medium text-amber-800 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {deleteError.message}
          </p>
          {deleteError.usedBy.length > 0 && (
            <div>
              <p className="text-amber-700 text-xs mb-1">Products using this color:</p>
              <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                {deleteError.usedBy.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <p className="text-xs text-amber-600 mt-2">
                Archive or delete those products first, then you can remove this color.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Existing Colors Grid */}
      <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Palette ({colors.length})</h2>
          <p className="text-sm text-muted-foreground">
            All colors available for product variants.
          </p>
        </div>

        {colors.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No colors yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {colors.map((color) => (
              <div
                key={color.id}
                className="group flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 hover:border-gray-300 transition-colors"
              >
                <div
                  className="h-7 w-7 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{color.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{color.hex}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    handleDelete(color);
                  }}
                  disabled={isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600 shrink-0"
                  title={`Delete ${color.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
