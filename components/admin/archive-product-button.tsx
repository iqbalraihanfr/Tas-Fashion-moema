"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { archiveProduct, unarchiveProduct } from "@/lib/admin-actions";
import { Archive, ArchiveRestore } from "lucide-react";

interface ArchiveProductButtonProps {
  productId: string;
  isArchived: boolean;
}

export function ArchiveProductButton({ productId, isArchived }: ArchiveProductButtonProps) {
  const action = isArchived ? unarchiveProduct : archiveProduct;
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <Button
        variant="outline"
        size="sm"
        type="submit"
        disabled={isPending}
        className="rounded-none h-8"
        title={isArchived ? "Unarchive product" : "Archive product"}
      >
        {isPending ? (
          <span className="text-[10px] uppercase tracking-widest">
            {isArchived ? "Restoring..." : "Archiving..."}
          </span>
        ) : isArchived ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
      </Button>
      {state?.error && <p className="text-red-500 text-xs mt-1">{state.error}</p>}
    </form>
  );
}
