"use client";

import { useActionState } from "react";
import { deleteShowcase } from "@/lib/admin-actions";
import { Trash2 } from "lucide-react";

export function DeleteShowcaseButton({
  showcaseId,
  title,
}: {
  showcaseId: string;
  title: string;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteShowcase,
    undefined
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Delete showcase "${title}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="showcaseId" value={showcaseId} />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <span className="h-3 w-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        Delete
      </button>
      {state?.error && (
        <p className="text-red-500 text-xs mt-1">{state.error}</p>
      )}
    </form>
  );
}
