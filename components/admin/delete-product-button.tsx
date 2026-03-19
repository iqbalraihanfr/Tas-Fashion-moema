"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/admin-actions";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName?: string;
}) {
  const [state, formAction, isPending] = useActionState(deleteProduct, undefined);
  const ariaLabel = productName ? `Delete product: ${productName}` : "Delete product";

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            disabled={isPending}
            aria-label={ariaLabel}
            title={ariaLabel}
            className="h-8 w-8 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md"
          >
            {isPending ? (
              <span className="h-4 w-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Delete product
        </TooltipContent>
      </Tooltip>
      {state?.error && <p className="text-red-500 text-xs mt-1">{state.error}</p>}
    </form>
  );
}
