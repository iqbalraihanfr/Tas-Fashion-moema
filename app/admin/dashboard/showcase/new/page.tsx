import ShowcaseForm from "@/components/admin/showcase-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import * as showcaseService from "@/services/showcase.service";

export default async function NewShowcasePage() {
  const existingHeroId = await showcaseService.getHeroShowcaseId();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/dashboard/showcase"
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
            New Showcase
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Add a new banner to the homepage showcase section.
          </p>
        </div>
      </div>
      <ShowcaseForm existingHeroId={existingHeroId} />
    </div>
  );
}
