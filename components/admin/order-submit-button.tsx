"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function OrderSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Saving..." : "Update Status"}
    </Button>
  );
}
