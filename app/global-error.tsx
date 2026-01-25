"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-white antialiased">
        <h2 className="text-3xl font-light uppercase tracking-[0.4em] mb-6">System Error</h2>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] max-w-md mb-12 leading-loose">
          A critical failure has occurred within the atelier&apos;s core systems.
        </p>
        <button
          onClick={() => reset()}
          className="h-14 px-12 border border-black uppercase tracking-[0.3em] text-[10px] hover:bg-black hover:text-white transition-all duration-500"
        >
          Reset Application
        </button>
      </body>
    </html>
  );
}
