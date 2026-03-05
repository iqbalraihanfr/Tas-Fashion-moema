import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, Monitor, LayoutGrid } from "lucide-react";
import * as showcaseService from "@/services/showcase.service";
import { DeleteShowcaseButton } from "@/components/admin/delete-showcase-button";

export default async function ShowcasePage() {
  const showcases = await showcaseService.getAllShowcases();

  const hero = showcases.find((s) => s.position === 0);
  const categories = showcases.filter((s) => s.position !== 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">
            Showcase Manager
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage hero jumbotron and category banners on homepage.
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

      {/* Hero Jumbotron Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-neutral-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Hero Jumbotron
          </h2>
        </div>

        {hero ? (
          <div className="group relative rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[21/9] bg-neutral-100">
              <Image
                src={hero.image_url}
                alt={hero.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                {hero.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold uppercase tracking-wide">
                    <Eye className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-200 text-neutral-500 text-[10px] font-semibold uppercase tracking-wide">
                    <EyeOff className="h-3 w-3" /> Hidden
                  </span>
                )}
              </div>
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold uppercase tracking-wide">
                  <Monitor className="h-3 w-3" /> Hero
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-800 text-sm">{hero.title}</h3>
              {hero.subtitle && (
                <p className="text-xs text-neutral-400 mt-0.5">{hero.subtitle}</p>
              )}
              <p className="text-xs text-neutral-500 mt-2 font-mono bg-neutral-50 px-2 py-1 rounded">
                → {hero.link_url}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                <Link
                  href={`/admin/dashboard/showcase/${hero.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>
                <DeleteShowcaseButton showcaseId={hero.id} title={hero.title} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <Monitor className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-600 mb-1">No hero jumbotron set</p>
            <p className="text-xs text-neutral-400 mb-3">
              Create a showcase with type &ldquo;Hero Jumbotron&rdquo; to display a full-screen banner.
            </p>
            <Link
              href="/admin/dashboard/showcase/new"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
            >
              Create Hero
            </Link>
          </div>
        )}
      </div>

      {/* Category Banners Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-neutral-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Category Banners
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
            <LayoutGrid className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-600 mb-1">No category banners yet</p>
            <p className="text-xs text-neutral-400 mb-3">
              Add category banners to display below the hero section.
            </p>
            <Link
              href="/admin/dashboard/showcase/new"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
            >
              Create Banner
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] bg-neutral-100">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
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
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white text-xs font-bold">
                      {item.position}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-800 text-sm">{item.title}</h3>
                  {item.subtitle && (
                    <p className="text-xs text-neutral-400 mt-0.5">{item.subtitle}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2 font-mono bg-neutral-50 px-2 py-1 rounded">
                    → {item.link_url}
                  </p>
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
    </div>
  );
}
