"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { UploadCloud, XCircle, Info } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/admin-actions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(1, "Full product name is required"),
  baseName: z.string().min(1, "Model/Base name is required"),
  sku: z.string().min(1, "SKU code is required"),
  color: z.string().min(1, "Color variant is required"),
  dimensions: z.string().min(1, "Dimensions are required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.number().int().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

type ProductFormProps = {
  initialData?: Product;
};

export function ProductForm({ initialData }: ProductFormProps) {
  const isEditMode = !!initialData;
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      baseName: initialData.baseName,
      sku: initialData.sku,
      color: initialData.color,
      dimensions: initialData.dimensions,
      slug: initialData.slug,
      description: initialData.description,
      price: initialData.price,
      stock: initialData.stock,
      images: initialData.images,
    } : {
      name: "",
      baseName: "",
      sku: "",
      color: "",
      dimensions: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
    },
  });

  const currentImages = watch("images");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
      const newLocalUrls = filesArray.map(f => URL.createObjectURL(f));
      setValue("images", [...currentImages, ...newLocalUrls]); 
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue("images", updatedImages);
    
    // Also remove from imageFiles if it's a new file
    // Note: This logic assumes new files are added to the end of the array
    // A more robust way would be tracking IDs, but for a simple form this works
    const existingImagesCount = initialData?.images.length || 0;
    if (index >= existingImagesCount) {
        const fileIndex = index - existingImagesCount;
        setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("baseName", data.baseName);
    formData.append("sku", data.sku);
    formData.append("color", data.color);
    formData.append("dimensions", data.dimensions);
    if (data.slug) formData.append("slug", data.slug);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());

    imageFiles.forEach((file) => {
      formData.append("newImages", file);
    });

    if (isEditMode && initialData) {
      formData.append("id", initialData.id);
      // Filter out blob URLs, only keep existing supabase URLs
      const keptExistingImages = data.images.filter(img => !img.startsWith('blob:'));
      formData.append("existingImages", JSON.stringify(keptExistingImages));
    }

    try {
      if (isEditMode) {
        await updateProduct(formData);
      } else {
        await createProduct(formData);
      }
    } catch (error) {
      console.error("Form submission error", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-20">
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="space-y-6">
        <div className="border-b border-muted pb-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">General Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Full Product Name</Label>
                <Input id="name" {...register("name")} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 placeholder:text-muted-foreground/50" placeholder="e.g. Joanna Gray Leather Tote" />
                {errors.name && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="baseName" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Model / Base Name</Label>
                <Input id="baseName" {...register("baseName")} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 placeholder:text-muted-foreground/50" placeholder="e.g. Joanna" />
                {errors.baseName && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.baseName.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
                <Label htmlFor="sku" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">SKU / Product Code</Label>
                <Input id="sku" {...register("sku")} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 placeholder:text-muted-foreground/50" placeholder="e.g. Y1886" />
                {errors.sku && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="color" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Color Variant</Label>
                <Input id="color" {...register("color")} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 placeholder:text-muted-foreground/50" placeholder="e.g. Gray" />
                {errors.color && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.color.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="dimensions" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Dimensions</Label>
                <Input id="dimensions" {...register("dimensions")} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 placeholder:text-muted-foreground/50" placeholder="e.g. 45 cm x 45 cm" />
                {errors.dimensions && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.dimensions.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="slug" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Custom URL Slug</Label>
                <Info className="w-3 h-3 text-muted-foreground" />
            </div>
            <Input id="slug" {...register("slug")} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 placeholder:text-muted-foreground/50 text-xs" placeholder="Leave blank to auto-generate (e.g. joanna-gray-leather-tote)" />
            {errors.slug && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.slug.message}</p>}
        </div>
      </div>

      {/* SECTION 2: DETAILS & PRICING */}
      <div className="space-y-6">
        <div className="border-b border-muted pb-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Pricing & Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <Label htmlFor="price" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Price (IDR)</Label>
                <div className="relative">
                    <span className="absolute left-0 bottom-2 text-sm font-medium">Rp</span>
                    <Input id="price" type="number" {...register("price", { valueAsNumber: true })} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary pl-7 pr-0 h-10 font-medium" />
                </div>
                {errors.price && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="stock" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Available Stock</Label>
                <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} className="rounded-none border-x-0 border-t-0 border-b border-muted focus-visible:ring-0 focus-visible:border-primary px-0 h-10 font-medium" />
                {errors.stock && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.stock.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Product Narrative</Label>
            <Textarea id="description" {...register("description")} className="rounded-none border border-muted focus-visible:ring-0 focus-visible:border-primary min-h-[150px] p-4 text-sm leading-relaxed" placeholder="Describe the materials, hardware, and usage context..." />
            {errors.description && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.description.message}</p>}
        </div>
      </div>

      {/* SECTION 3: MEDIA */}
      <div className="space-y-6">
        <div className="border-b border-muted pb-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Product Media</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentImages.map((imgUrl, index) => (
            <div key={index} className="relative group aspect-[3/4] bg-muted overflow-hidden">
              <Image src={imgUrl} alt={`Product Image ${index + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-white/90 hover:bg-white text-black rounded-none p-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] uppercase tracking-widest py-1 text-center">
                    Cover Image
                </div>
              )}
            </div>
          ))}

          <label className="flex flex-col items-center justify-center aspect-[3/4] border border-dashed border-muted cursor-pointer hover:bg-muted/50 transition-colors group">
            <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-4 font-bold group-hover:text-primary transition-colors">Add Image</span>
            <Input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        </div>
        {errors.images && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.images.message}</p>}
      </div>

      <div className="pt-10">
        <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none uppercase tracking-[0.3em] text-xs transition-all disabled:opacity-50"
        >
            {isSubmitting ? "Syncing with Atelier..." : isEditMode ? "Update Masterpiece" : "Finalize Collection Piece"}
        </Button>
      </div>
    </form>
  );
}
