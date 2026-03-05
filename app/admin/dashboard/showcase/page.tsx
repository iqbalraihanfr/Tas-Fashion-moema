import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import * as showcaseService from "@/services/showcase.service";
import { DeleteShowcaseButton } from "@/components/admin/delete-showcase-button";

export default async function ShowcasePage() {
  const showcases = await showcaseService.getAllShowcases();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
            Showcase Manager
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage homepage category banners. Recommended: 3 banners.
          </p>
        </div>
        <Link
          href="/admin/dashboard/showcase/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Showcase
        </Link>
      </div>

      {/* Showcase Grid */}
      {showcases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <Plus className="h-5 w-5 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">
            No showcases yet
          </p>
          <p className="text-xs text-neutral-400 mb-4">
            Add showcase banners to display on the homepage.
          </p>
          <Link
            href="/admin/dashboard/showcase/new"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
          >
            Create First Showcase
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {showcases.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image Preview */}
              <div className="relative aspect-[4/3] bg-neutral-100">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {/* Active badge */}
                <div className="absolute top-3 left-3">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide">
                      <Eye className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-200 text-neutral-500 text-[10px] font-semibold uppercase tracking-wide">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </span>
                  )}
                </div>
                {/* Position badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white text-xs font-bold">
                    {item.position}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-neutral-800 text-sm">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {item.subtitle}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-2 font-mono bg-neutral-50 px-2 py-1 rounded">
                  → {item.link_url}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                  <Link
                    href={`/admin/dashboard/showcase/${item.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Link>
                  <DeleteShowcaseButton showcaseId={item.id} title={item.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
