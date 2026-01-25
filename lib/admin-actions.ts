"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as productService from "@/services/product.service";
import * as orderService from "@/services/order.service";
import { AppError } from "@/lib/errors";

// Zod schema for product validation
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  baseName: z.string().min(1, "Base name (Model) is required"),
  sku: z.string().min(1, "SKU/Code is required"),
  color: z.string().min(1, "Color is required"),
  dimensions: z.string().min(1, "Dimensions are required"),
  slug: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().positive("Price must be positive")),
  stock: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().nonnegative("Stock cannot be negative")),
  newImages: z.array(z.instanceof(File)).optional(),
  existingImages: z.array(z.string()).optional(),
});

// Zod schema for order status update
const orderStatusSchema = z.object({
  orderId: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']),
  shippingStatus: z.enum(['idle', 'processing', 'shipped', 'delivered']),
  trackingNumber: z.string().nullable().optional(),
});

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const baseName = formData.get("baseName") as string;
  const sku = formData.get("sku") as string;
  const color = formData.get("color") as string;
  const dimensions = formData.get("dimensions") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const newImages = formData.getAll("newImages") as File[];
  const customSlug = formData.get("slug") as string | null;

  const parsed = productSchema.safeParse({
    name,
    baseName,
    sku,
    color,
    dimensions,
    slug: customSlug || undefined,
    description,
    price,
    stock,
    newImages: newImages.filter(file => file.size > 0),
  });

  if (!parsed.success) {
    throw new Error("Invalid product data: " + parsed.error.issues[0].message);
  }

  try {
    await productService.createProduct({
      name: parsed.data.name,
      baseName: parsed.data.baseName,
      sku: parsed.data.sku,
      color: parsed.data.color,
      dimensions: parsed.data.dimensions,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      images: parsed.data.newImages || [],
      slug: parsed.data.slug,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create product.");
  }

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/catalog');
  revalidatePath('/');
  redirect('/admin/dashboard/products');
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const baseName = formData.get("baseName") as string;
  const sku = formData.get("sku") as string;
  const color = formData.get("color") as string;
  const dimensions = formData.get("dimensions") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const newImages = formData.getAll("newImages") as File[];
  const existingImagesJson = formData.get("existingImages") as string;
  const customSlug = formData.get("slug") as string | null;

  const existingImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

  const parsed = productSchema.safeParse({
    id,
    name,
    baseName,
    sku,
    color,
    dimensions,
    slug: customSlug || undefined,
    description,
    price,
    stock,
    newImages: newImages.filter(file => file.size > 0),
    existingImages: existingImages,
  });

  if (!parsed.success) {
    throw new Error("Invalid product data: " + parsed.error.issues[0].message);
  }

  try {
    await productService.updateProduct({
      id: parsed.data.id!,
      name: parsed.data.name,
      baseName: parsed.data.baseName,
      sku: parsed.data.sku,
      color: parsed.data.color,
      dimensions: parsed.data.dimensions,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      images: parsed.data.newImages || [],
      existingImages: parsed.data.existingImages,
      slug: parsed.data.slug,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update product.");
  }

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/catalog');
  redirect('/admin/dashboard/products');
}

export async function deleteProduct(prevState: unknown, formData: FormData) {
  const id = formData.get("productId") as string;

  if (!id) {
    return { error: "Product ID is missing." };
  }

  try {
    await productService.deleteProduct(id);
  } catch (error) {
    console.error(error);
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
    trackingNumber: trackingNumber || null,
  });

  if (!parsed.success) {
    throw new Error("Invalid order status data: " + parsed.error.issues[0].message);
  }

  try {
    await orderService.updateOrderStatus(parsed.data.orderId, {
      paymentStatus: parsed.data.paymentStatus,
      shippingStatus: parsed.data.shippingStatus,
      trackingNumber: parsed.data.trackingNumber ?? null,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update order status.");
  }

  revalidatePath(`/admin/dashboard/orders/${orderId}`);
  revalidatePath('/admin/dashboard/orders');
  redirect(`/admin/dashboard/orders/${orderId}`);
}