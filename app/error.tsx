"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-light uppercase tracking-[0.3em] mb-4">An Interruption Occurred</h2>
      <p className="text-muted-foreground text-sm uppercase tracking-widest max-w-md mb-10 leading-relaxed">
        Our digital boutique is experiencing a momentary lapse. We apologize for the inconvenience.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          variant="outline"
          className="rounded-none h-12 px-10 uppercase tracking-[0.2em] text-[10px] border-primary"
        >
          Try Again
        </Button>
        <Button
          asChild
          className="rounded-none h-12 px-10 uppercase tracking-[0.2em] text-[10px] bg-black text-white"
        >
          <Link href="/">Back to Atelier</Link>
        </Button>
      </div>
    </div>
  );
}
