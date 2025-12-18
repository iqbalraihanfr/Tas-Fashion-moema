"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/admin-actions";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(deleteProduct, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <Button
        variant="destructive"
        size="sm"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Deleting..." : <Trash2 className="h-4 w-4" />}
      </Button>
      {state?.error && <p className="text-red-500 text-xs mt-1">{state.error}</p>}
    </form>
  );
}
