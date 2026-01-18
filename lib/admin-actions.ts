"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import slugify from "slugify";

// Zod schema for product validation
const productSchema = z.object({
  id: z.string().optional(), // For update
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(), // Auto-generate if not provided
  description: z.string().min(1, "Description is required"),
  price: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().positive("Price must be positive")),
  stock: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().nonnegative("Stock cannot be negative")),
  newImages: z.array(z.instanceof(File)).optional(), // For new files being uploaded
  existingImages: z.array(z.string()).optional(), // URLs of images already in storage
});

// Zod schema for order status update
const orderStatusSchema = z.object({
  orderId: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']),
  shippingStatus: z.enum(['idle', 'processing', 'shipped', 'delivered']), // Added 'delivered'
  trackingNumber: z.string().nullable().optional(),
});

// Helper to upload images to Supabase Storage
async function uploadImages(files: File[]): Promise<string[]> {
  const imageUrls: string[] = [];
  for (const file of files) {
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Image upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    const { data: publicUrlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(data.path);
    imageUrls.push(publicUrlData.publicUrl);
  }
  return imageUrls;
}

// Helper to delete images from Supabase Storage
async function deleteImages(imageUrls: string[]) {
  const filePaths = imageUrls.map(url => {
    const parts = url.split('/');
    return parts[parts.length - 1]; // Get the filename
  });

  if (filePaths.length > 0) {
    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove(filePaths);

    if (error) {
      console.error("Image deletion error:", error);
      // Don't throw an error here, just log, as product might still be updated
    }
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const newImages = formData.getAll("newImages") as File[];
  const customSlug = formData.get("slug") as string | null;

  const parsed = productSchema.safeParse({
    name,
    slug: customSlug || slugify(name, { lower: true, strict: true }),
    description,
    price,
    stock,
    newImages: newImages.filter(file => file.size > 0), // Filter out empty file inputs
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid product data: " + parsed.error.flatten().fieldErrors.name?.[0]);
  }

  const data = parsed.data;
  const images: string[] = [];

  // Upload new images
  if (data.newImages && data.newImages.length > 0) {
    const uploadedUrls = await uploadImages(data.newImages);
    images.push(...uploadedUrls);
  }

  const productSlug = data.slug || slugify(data.name, { lower: true, strict: true });

  const { error } = await supabaseAdmin
    .from('Product')
    .insert({
      name: data.name,
      slug: productSlug,
      description: data.description,
      price: data.price,
      stock: data.stock,
      images: images,
    });

  if (error) {
    console.error("Supabase create product error:", error);
    throw new Error("Failed to create product.");
  }

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/catalog'); // Revalidate public catalog
  revalidatePath('/'); // Revalidate homepage
  redirect('/admin/dashboard/products');
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const newImages = formData.getAll("newImages") as File[];
  const existingImagesJson = formData.get("existingImages") as string; // Stringified array of URLs
  const customSlug = formData.get("slug") as string | null;

  const existingImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

  const parsed = productSchema.safeParse({
    id,
    name,
    slug: customSlug || slugify(name, { lower: true, strict: true }),
    description,
    price,
    stock,
    newImages: newImages.filter(file => file.size > 0),
    existingImages: existingImages,
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid product data: " + parsed.error.flatten().fieldErrors.name?.[0]);
  }

  const data = parsed.data;
  const finalImages: string[] = data.existingImages || [];

  // Fetch current product to compare images
  const { data: currentProduct, error: fetchError } = await supabaseAdmin
    .from('Product')
    .select('images')
    .eq('id', id)
    .single();

  if (fetchError || !currentProduct) {
      console.error("Error fetching current product for update:", fetchError);
      throw new Error("Product not found for update.");
  }
  
  const oldImagesInDb: string[] = currentProduct.images;
  
  // Determine images to delete (old images no longer in existingImages)
  const imagesToDelete = oldImagesInDb.filter(img => !finalImages.includes(img));
  await deleteImages(imagesToDelete);

  // Upload new images
  if (data.newImages && data.newImages.length > 0) {
    const uploadedUrls = await uploadImages(data.newImages);
    finalImages.push(...uploadedUrls);
  }

  const productSlug = data.slug || slugify(data.name, { lower: true, strict: true });

  const { error } = await supabaseAdmin
    .from('Product')
    .update({
      name: data.name,
      slug: productSlug,
      description: data.description,
      price: data.price,
      stock: data.stock,
      images: finalImages,
    })
    .eq('id', id);

  if (error) {
    console.error("Supabase update product error:", error);
    throw new Error("Failed to update product.");
  }

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/catalog');
  revalidatePath(`/product/${productSlug}`); // Revalidate specific product page
  redirect('/admin/dashboard/products');
}

export async function deleteProduct(prevState: unknown, formData: FormData) {
  const id = formData.get("productId") as string;

  if (!id) {
    return { error: "Product ID is missing." };
  }

  // First, get product data to delete associated images
  const { data: product, error: fetchError } = await supabaseAdmin
    .from('Product')
    .select('images')
    .eq('id', id)
    .single();

  if (fetchError || !product) {
    console.error("Error fetching product for deletion:", fetchError);
    return { error: "Product not found for deletion." };
  }

  // Delete images from storage
  await deleteImages(product.images);

  // Delete product from database
  const { error } = await supabaseAdmin
    .from('Product')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Supabase delete product error:", error);
    return { error: "Failed to delete product." };
  }

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/catalog');
  revalidatePath('/');
  return { success: true };
}

export async function updateOrderStatus(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const paymentStatus = formData.get("paymentStatus") as string;
  const shippingStatus = formData.get("shippingStatus") as string;
  const trackingNumber = formData.get("trackingNumber") as string;

  const parsed = orderStatusSchema.safeParse({
    orderId,
    paymentStatus,
    shippingStatus,
    trackingNumber: trackingNumber || null, // Allow null for empty tracking number
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid order status data: " + parsed.error.flatten().fieldErrors.orderId?.[0]);
  }

  const { data, error } = await supabaseAdmin
    .from('Order')
    .update({
      paymentStatus: parsed.data.paymentStatus,
      shippingStatus: parsed.data.shippingStatus,
      trackingNumber: parsed.data.trackingNumber,
    })
    .eq('id', orderId);

  if (error) {
    console.error("Supabase update order status error:", error);
    throw new Error("Failed to update order status.");
  }

  revalidatePath(`/admin/dashboard/orders/${orderId}`); // Revalidate specific order page
  revalidatePath('/admin/dashboard/orders'); // Revalidate orders list
  redirect(`/admin/dashboard/orders/${orderId}`); // Redirect back to the same page to show updates
}
