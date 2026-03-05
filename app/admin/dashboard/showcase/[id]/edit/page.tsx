import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShowcaseForm from "@/components/admin/showcase-form";
import * as showcaseService from "@/services/showcase.service";
import { Showcase } from "@/lib/types";

export default async function EditShowcasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [showcases, existingHeroId] = await Promise.all([
    showcaseService.getAllShowcases(),
    showcaseService.getHeroShowcaseId(),
  ]);
  const showcase = showcases.find((s) => s.id === id);

  if (!showcase) {
    notFound();
  }

  const initialData: Showcase = {
    id: showcase.id,
    title: showcase.title,
    subtitle: showcase.subtitle,
    image_url: showcase.image_url,
    link_url: showcase.link_url,
    position: showcase.position,
    is_active: showcase.is_active,
    created_at: showcase.created_at,
    updated_at: showcase.updated_at,
  };

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
            Edit Showcase
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Update &ldquo;{showcase.title}&rdquo; banner.
          </p>
        </div>
      </div>
      <ShowcaseForm initialData={initialData} existingHeroId={existingHeroId} />
    </div>
  );
}
