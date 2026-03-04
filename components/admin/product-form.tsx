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
        <div className="border-b pb-2">
            <h2 className="text-lg font-semibold tracking-tight">General Information</h2>
            <p className="text-sm text-muted-foreground">Basic details about the product.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Product Name</Label>
                <Input id="name" {...register("name")} className="h-10" placeholder="e.g. Joanna Gray Leather Tote" />
                {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="baseName" className="text-sm font-medium">Model / Base Name</Label>
                <Input id="baseName" {...register("baseName")} className="h-10" placeholder="e.g. Joanna" />
                {errors.baseName && <p className="text-red-500 text-xs font-medium">{errors.baseName.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium">SKU / Product Code</Label>
                <Input id="sku" {...register("sku")} className="h-10" placeholder="e.g. Y1886" />
                {errors.sku && <p className="text-red-500 text-xs font-medium">{errors.sku.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-medium">Color Variant</Label>
                <Input id="color" {...register("color")} className="h-10" placeholder="e.g. Gray" />
                {errors.color && <p className="text-red-500 text-xs font-medium">{errors.color.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="dimensions" className="text-sm font-medium">Dimensions</Label>
                <Input id="dimensions" {...register("dimensions")} className="h-10" placeholder="e.g. 45 cm x 45 cm" />
                {errors.dimensions && <p className="text-red-500 text-xs font-medium">{errors.dimensions.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Label htmlFor="slug" className="text-sm font-medium">Custom URL Slug</Label>
                <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input id="slug" {...register("slug")} className="h-10" placeholder="Leave blank to auto-generate (e.g. joanna-gray-leather-tote)" />
            {errors.slug && <p className="text-red-500 text-xs font-medium">{errors.slug.message}</p>}
        </div>
      </div>

      {/* SECTION 2: DETAILS & PRICING */}
      <div className="space-y-6">
        <div className="border-b pb-2">
            <h2 className="text-lg font-semibold tracking-tight">Pricing & Details</h2>
            <p className="text-sm text-muted-foreground">Set the price, stock, and product description.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">Price (IDR)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rp</span>
                    <Input id="price" type="number" {...register("price", { valueAsNumber: true })} className="pl-9 h-10 font-medium" />
                </div>
                {errors.price && <p className="text-red-500 text-xs font-medium">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">Available Stock</Label>
                <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} className="h-10 font-medium" />
                {errors.stock && <p className="text-red-500 text-xs font-medium">{errors.stock.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Product Description</Label>
            <Textarea id="description" {...register("description")} className="min-h-[150px] p-4 text-sm resize-y rounded-md" placeholder="Describe the materials, hardware, and usage context..." />
            {errors.description && <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>}
        </div>
      </div>

      {/* SECTION 3: MEDIA */}
      <div className="space-y-6">
        <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Product Media</h2>
              <p className="text-sm text-muted-foreground">Upload and manage product images.</p>
            </div>
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
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Automatic Image Compression</p>
            <p>Images will be automatically compressed to WebP format (max 150KB) to ensure fast loading times.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={preview.id} className="relative group aspect-[3/4] bg-muted rounded-md overflow-hidden border border-border">
              <Image 
                src={preview.previewUrl} 
                alt={`Product Image ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-105" 
              />
              
              {/* Status Overlay */}
              {preview.status === "pending" || preview.status === "compressing" ? (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mb-2" />
                  <span className="text-xs font-medium">Compressing...</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-background/90 hover:bg-background text-foreground rounded-md p-1.5 transition-colors shadow-sm"
                    >
                      <XCircle className="w-4 h-4 text-red-500" />
                    </button>
                </div>
              )}

              {/* Compression Stats Badge - Only for new images */}
              {!preview.isExisting && preview.status === "compressed" && preview.savings && preview.savings > 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  -{preview.savings}%
                </div>
              )}

              {/* Cover Image Label */}
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] font-medium py-1.5 text-center">
                    Primary Image
                </div>
              )}

              {/* Size Info on Hover - Only for new images */}
              {!preview.isExisting && preview.compressedSize && (
                <div className="absolute bottom-0 left-0 right-0 py-2 px-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-[10px] text-center font-medium">
                    <span className="line-through opacity-70">{formatFileSize(preview.originalSize)}</span>
                    <span className="mx-1">→</span>
                    <span>{formatFileSize(preview.compressedSize)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Upload Button */}
          <label className={`
            flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-muted-foreground/25 rounded-md
            cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/50 transition-colors group
            ${isCompressing ? "pointer-events-none opacity-50" : ""}
          `}>
            {isCompressing ? (
              <>
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                <span className="text-xs font-medium text-muted-foreground mt-3">Processing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary transition-colors">Add Image</span>
                <span className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP</span>
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
        {errors.images && <p className="text-red-500 text-xs font-medium">{errors.images.message}</p>}
      </div>

      <div className="pt-6 border-t flex justify-end gap-4">
        <Button 
            type="submit" 
            disabled={isSubmitting || isCompressing} 
            className="w-full sm:w-auto h-10 px-8 rounded-md font-medium transition-all"
        >
            {isCompressing 
              ? "Compressing Images..." 
              : isSubmitting 
                ? "Saving..." 
                : isEditMode 
                  ? "Save Changes" 
                  : "Create Product"
            }
        </Button>
      </div>
    </form>
  );
}
