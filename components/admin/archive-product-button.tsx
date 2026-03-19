"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { archiveProduct, unarchiveProduct } from "@/lib/admin-actions";
import { Archive, ArchiveRestore } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ArchiveProductButtonProps {
  productId: string;
  isArchived: boolean;
  productName?: string;
}

export function ArchiveProductButton({ productId, isArchived, productName }: ArchiveProductButtonProps) {
  const action = isArchived ? unarchiveProduct : archiveProduct;
  const [state, formAction, isPending] = useActionState(action, undefined);
  const actionLabel = isArchived ? "Restore product" : "Archive product";
  const ariaLabel = productName ? `${actionLabel}: ${productName}` : actionLabel;

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
            className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
          >
            {isPending ? (
              <span className="h-4 w-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
            ) : isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {actionLabel}
        </TooltipContent>
      </Tooltip>
      {state?.error && <p className="text-red-500 text-xs mt-1">{state.error}</p>}
    </form>
  );
}
