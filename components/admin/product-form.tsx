"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { UploadCloud, XCircle } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/admin-actions"; // We'll create these actions
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter"; // For client-side validation with Formik/React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(), // Made optional
  description: z.string().min(1, "Description is required"),
  price: z.number().int().positive("Price must be positive"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type ProductFormData = z.infer<typeof productSchema>;

type ProductFormProps = {
  initialData?: Product; // Optional for edit mode
};

export function ProductForm({ initialData }: ProductFormProps) {
  const isEditMode = !!initialData;
  const action = isEditMode ? updateProduct : createProduct;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const currentImages = watch("images");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);
      // Update form values for validation, actual upload happens in action
      setValue("images", [...currentImages, ...filesArray.map(f => URL.createObjectURL(f))]); 
    }
  };

  const removeImage = (index: number, isNewFile: boolean) => {
    if (isNewFile) {
      const newFiles = imageFiles.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      const newImageUrls = newFiles.map(f => URL.createObjectURL(f));
      setValue("images", initialData ? [...initialData.images, ...newImageUrls] : newImageUrls);
    } else {
      // Remove existing image (from initialData)
      const updatedInitialImages = initialData?.images.filter((_, i) => i !== index) || [];
      setValue("images", updatedInitialImages);
    }
  };


  const onSubmit = async (data: ProductFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    // Only append slug if provided
    if (data.slug) {
        formData.append("slug", data.slug);
    }
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());

    imageFiles.forEach((file) => {
      formData.append("newImages", file); // Append new files
    });

    if (isEditMode && initialData) {
      formData.append("id", initialData.id);
      formData.append("existingImages", JSON.stringify(currentImages.filter(img => img.startsWith('/')))); // Keep existing images
    }

    try {
      if (isEditMode) {
        await updateProduct(formData);
      } else {
        await createProduct(formData);
      }
      // Handle success, e.g., redirect or show a toast
    } catch (error) {
      console.error("Form submission error", error);
      // Handle error, e.g., show error message
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL identifier)</Label>
          <Input id="slug" {...register("slug")} className="mt-1" placeholder="Leave blank to auto-generate" />
          <p className="text-[10px] text-muted-foreground mt-1">Optional. Leave blank to auto-generate from name.</p>
          {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} className="mt-1" rows={5} />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Price (Rp)</Label>
          <Input id="price" type="number" {...register("price", { valueAsNumber: true })} className="mt-1" />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} className="mt-1" />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
        </div>
      </div>

      <div>
        <Label>Product Images</Label>
        <div className="mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Existing Images */}
          {initialData?.images.map((imgUrl, index) => (
            <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <Image src={imgUrl} alt={`Product Image ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index, false)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
          {/* New Images Preview */}
          {imageFiles.map((file, index) => (
            <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <Image src={URL.createObjectURL(file)} alt={`New Image ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index, true)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Image Upload Button */}
          <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
            <UploadCloud className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500 mt-2">Upload Image</span>
            <Input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        </div>
        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full uppercase tracking-widest rounded-none">
        {isSubmitting ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
