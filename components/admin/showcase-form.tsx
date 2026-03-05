"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createShowcase, updateShowcase } from "@/lib/admin-actions";
import { Showcase } from "@/lib/types";
import { Upload, X } from "lucide-react";

const CATEGORY_OPTIONS = [
  { label: "All Products", value: "/catalog" },
  { label: "Totes", value: "/catalog?category=totes" },
  { label: "Shoulder Bags", value: "/catalog?category=shoulder-bags" },
  { label: "Crossbody", value: "/catalog?category=crossbody" },
  { label: "Mini Bags", value: "/catalog?category=mini-bags" },
  { label: "Clutches", value: "/catalog?category=clutches" },
  { label: "New Arrivals", value: "/catalog?category=new-arrivals" },
];

interface ShowcaseFormProps {
  initialData?: Showcase;
}

export default function ShowcaseForm({ initialData }: ShowcaseFormProps) {
  const isEditMode = !!initialData;
  const [preview, setPreview] = useState<string | null>(
    initialData?.image_url || null
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.set("is_active", isActive ? "true" : "false");
    try {
      if (isEditMode) {
        await updateShowcase(formData);
      } else {
        await createShowcase(formData);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8 max-w-2xl">
      {isEditMode && <input type="hidden" name="id" value={initialData.id} />}

      {/* Image Upload */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Banner Image *
        </label>
        {/* Single persistent file input — never unmounts so it retains the selected file */}
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="relative">
          {preview ? (
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
              <Image
                src={preview}
                alt="Showcase preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 cursor-pointer hover:border-neutral-400 hover:bg-neutral-100 transition-colors"
            >
              <Upload className="h-8 w-8 text-neutral-400 mb-2" />
              <span className="text-sm font-medium text-neutral-500">
                Click to upload banner image
              </span>
              <span className="text-xs text-neutral-400 mt-1">
                Recommended: 1200×900px or 4:3 ratio
              </span>
            </label>
          )}
        </div>
        {preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-neutral-500 underline underline-offset-4 hover:text-neutral-700"
          >
            Change image
          </button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-500"
        >
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title || ""}
          placeholder="e.g., Work Bags"
          className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <label
          htmlFor="subtitle"
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-500"
        >
          Subtitle{" "}
          <span className="text-neutral-400 normal-case">(optional)</span>
        </label>
        <input
          id="subtitle"
          name="subtitle"
          type="text"
          defaultValue={initialData?.subtitle || ""}
          placeholder="e.g., For the modern professional"
          className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
        />
      </div>

      {/* Link URL */}
      <div className="space-y-2">
        <label
          htmlFor="link_url"
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-500"
        >
          Link to Category *
        </label>
        <select
          id="link_url"
          name="link_url"
          required
          defaultValue={initialData?.link_url || ""}
          className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
        >
          <option value="" disabled>
            — Select target category —
          </option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({opt.value})
            </option>
          ))}
        </select>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label
          htmlFor="position"
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-500"
        >
          Display Position *
        </label>
        <input
          id="position"
          name="position"
          type="number"
          required
          min={1}
          defaultValue={initialData?.position || 1}
          className="w-32 px-4 py-3 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
        />
        <p className="text-xs text-neutral-400">
          Lower position appears first. Position 1 gets the large left banner.
        </p>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? "bg-emerald-500" : "bg-neutral-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-neutral-700">
          {isActive ? "Active — visible on homepage" : "Hidden — not shown on homepage"}
        </span>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Showcase"
              : "Create Showcase"}
        </button>
        <a
          href="/admin/dashboard/showcase"
          className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
