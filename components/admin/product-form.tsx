"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { UploadCloud, XCircle, Info, CheckCircle2, Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/admin-actions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/lib/types";
import {
  compressImages,
  formatFileSize,
  type ImagePreview,
  type CompressedImageResult,
} from "@/lib/image-utils";

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
  
  // Track image previews with compression status
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>(
    initialData?.images.map((url, i) => ({
      id: `existing-${i}`,
      file: new File([], ""),
      previewUrl: url,
      originalSize: 0,
      status: "compressed" as const,
      isExisting: true,
      existingUrl: url,
    })) || []
  );
  
  // Track compressed files ready for upload
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

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

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files);
    setIsCompressing(true);

    // Create initial previews with pending status
    const newPreviews: ImagePreview[] = filesArray.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      status: "pending" as const,
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setValue("images", [...currentImages, ...newPreviews.map(p => p.previewUrl)]);

    // Compress images
    try {
      const results: CompressedImageResult[] = await compressImages(filesArray);

      // Update previews with compression results
      setImagePreviews(prev => {
        const updated = [...prev];
        let resultIndex = 0;

        for (let i = 0; i < updated.length; i++) {
          if (updated[i].status === "pending" && resultIndex < results.length) {
            const result = results[resultIndex];
            updated[i] = {
              ...updated[i],
              file: result.file,
              compressedSize: result.compressedSize,
              savings: result.savings,
              status: result.status === "success" ? "compressed" : "error",
            };
            resultIndex++;
          }
        }

        return updated;
      });

      // Store compressed files
      setCompressedFiles(prev => [...prev, ...results.map(r => r.file)]);
    } catch (error) {
      console.error("Compression error:", error);
    } finally {
      setIsCompressing(false);
    }

    // Reset input
    e.target.value = "";
  }, [currentImages, setValue]);

  const removeImage = useCallback((index: number) => {
    const preview = imagePreviews[index];
    
    // Revoke URL if it's a blob (new image)
    if (preview && !preview.isExisting && preview.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(preview.previewUrl);
    }

    // Remove from previews
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);

    // Update form images
    setValue("images", newPreviews.map(p => p.previewUrl));

    // Remove from compressed files if it's a new image
    if (preview && !preview.isExisting) {
      const existingCount = imagePreviews.filter(p => p.isExisting).length;
      const fileIndex = index - existingCount;
      if (fileIndex >= 0) {
        setCompressedFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
  }, [imagePreviews, setValue]);

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

    // Append compressed image files
    compressedFiles.forEach((file) => {
      formData.append("newImages", file);
    });

    if (isEditMode && initialData) {
      formData.append("id", initialData.id);
      // Filter to only keep existing supabase URLs
      const keptExistingImages = imagePreviews
        .filter(p => p.isExisting && p.existingUrl)
        .map(p => p.existingUrl!);
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

  // Calculate total savings
  const totalOriginalSize = imagePreviews
    .filter(p => !p.isExisting && p.originalSize)
    .reduce((acc, p) => acc + p.originalSize, 0);
  const totalCompressedSize = imagePreviews
    .filter(p => !p.isExisting && p.compressedSize)
    .reduce((acc, p) => acc + (p.compressedSize || 0), 0);
  const totalSavings = totalOriginalSize > 0
    ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100)
    : 0;

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
        <div className="border-b border-muted pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Product Media</h2>
            {totalOriginalSize > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>
                  Auto-compressed: {formatFileSize(totalOriginalSize)} → {formatFileSize(totalCompressedSize)}
                  <span className="text-green-500 font-medium ml-1">(-{totalSavings}%)</span>
                </span>
              </div>
            )}
        </div>

        {/* Compression Info Banner */}
        <div className="bg-muted/50 border border-muted p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Kompresi Otomatis Gambar</p>
            <p>Gambar akan dikompresi otomatis menjadi format WebP (max 150KB) tanpa kehilangan kualitas visual. 
            File akan disimpan dengan format: <code className="bg-background px-1 py-0.5 rounded text-[10px]">products/{"{model}"}/{"{model}-{color}-{urutan}"}.webp</code></p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={preview.id} className="relative group aspect-[3/4] bg-muted overflow-hidden">
              <Image 
                src={preview.previewUrl} 
                alt={`Product Image ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              
              {/* Status Overlay */}
              {preview.status === "pending" || preview.status === "compressing" ? (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span className="text-[8px] uppercase tracking-widest">Compressing...</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-white/90 hover:bg-white text-black rounded-none p-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                </div>
              )}

              {/* Compression Stats Badge - Only for new images */}
              {!preview.isExisting && preview.status === "compressed" && preview.savings && preview.savings > 0 && (
                <div className="absolute top-2 left-2 bg-green-500/90 text-white text-[8px] uppercase tracking-widest px-2 py-1 font-bold">
                  -{preview.savings}%
                </div>
              )}

              {/* Cover Image Label */}
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] uppercase tracking-widest py-1 text-center">
                    Hero / Thumbnail
                </div>
              )}

              {/* Size Info on Hover - Only for new images */}
              {!preview.isExisting && preview.compressedSize && (
                <div className="absolute bottom-0 left-0 right-0 py-1.5 px-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-[8px] text-center">
                    <span className="line-through opacity-60">{formatFileSize(preview.originalSize)}</span>
                    <span className="mx-1">→</span>
                    <span className="font-bold">{formatFileSize(preview.compressedSize)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Upload Button */}
          <label className={`
            flex flex-col items-center justify-center aspect-[3/4] border border-dashed border-muted 
            cursor-pointer hover:bg-muted/50 transition-colors group
            ${isCompressing ? "pointer-events-none opacity-50" : ""}
          `}>
            {isCompressing ? (
              <>
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-4 font-bold">Processing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-4 font-bold group-hover:text-primary transition-colors">Add Image</span>
                <span className="text-[7px] text-muted-foreground/60 mt-1">Auto-compress to WebP</span>
              </>
            )}
            <Input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleImageChange} 
              accept="image/*"
              disabled={isCompressing}
            />
          </label>
        </div>
        {errors.images && <p className="text-red-500 text-[10px] uppercase tracking-tight">{errors.images.message}</p>}
      </div>

      <div className="pt-10">
        <Button 
            type="submit" 
            disabled={isSubmitting || isCompressing} 
            className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none uppercase tracking-[0.3em] text-xs transition-all disabled:opacity-50"
        >
            {isCompressing 
              ? "Compressing Images..." 
              : isSubmitting 
                ? "Syncing with Atelier..." 
                : isEditMode 
                  ? "Update Masterpiece" 
                  : "Finalize Collection Piece"
            }
        </Button>
      </div>
    </form>
  );
}
