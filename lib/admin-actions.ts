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
  category: z.string().nullable().default(null),
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
  const categoryRaw = formData.get("category") as string;
  const category = categoryRaw || null;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const newImages = formData.getAll("newImages") as File[];

  const parsed = productSchema.safeParse({
    name,
    baseName,
    sku,
    color,
    dimensions,
    category,
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
      category: parsed.data.category,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      images: parsed.data.newImages || [],
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
  const categoryRaw = formData.get("category") as string;
  const category = categoryRaw || null;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const newImages = formData.getAll("newImages") as File[];
  const existingImagesJson = formData.get("existingImages") as string;

  const existingImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];

  const parsed = productSchema.safeParse({
    id,
    name,
    baseName,
    sku,
    color,
    dimensions,
    category,
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
      category: parsed.data.category,
      description: parsed.data.description,
      price: parsed.data.price,
      stock: parsed.data.stock,
      images: parsed.data.newImages || [],
      existingImages: parsed.data.existingImages,
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

export async function archiveProduct(prevState: unknown, formData: FormData) {
  const id = formData.get("productId") as string;

  if (!id) {
    return { error: "Product ID is missing." };
  }

  try {
    await productService.archiveProduct(id);
  } catch (error) {
    console.error(error);
    return { error: "Failed to archive product." };
  }

  revalidatePath('/admin/dashboard/products');
  revalidatePath('/catalog');
  revalidatePath('/');
  return { success: true };
}

export async function unarchiveProduct(prevState: unknown, formData: FormData) {
  const id = formData.get("productId") as string;

  if (!id) {
    return { error: "Product ID is missing." };
  }

  try {
    await productService.unarchiveProduct(id);
  } catch (error) {
    console.error(error);
    return { error: "Failed to unarchive product." };
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

// =============================================
// SHOWCASE ACTIONS
// =============================================
import * as showcaseService from "@/services/showcase.service";

const showcaseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable().default(null),
  link_url: z.string().min(1, "Link URL is required"),
  position: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().nonnegative()),
  is_active: z.boolean().default(true),
});

export async function createShowcase(formData: FormData) {
  const title = formData.get("title") as string;
  const subtitleRaw = formData.get("subtitle") as string;
  const subtitle = subtitleRaw || null;
  const link_url = formData.get("link_url") as string;
  const position = formData.get("position") as string;
  const is_active = formData.get("is_active") === "true";
  const image = formData.get("image") as File;

  const parsed = showcaseSchema.safeParse({
    title,
    subtitle,
    link_url,
    position,
    is_active,
  });

  if (!parsed.success) {
    throw new Error("Invalid showcase data: " + parsed.error.issues[0].message);
  }

  if (!image || image.size === 0) {
    throw new Error("Showcase image is required.");
  }

  try {
    await showcaseService.createShowcase({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      link_url: parsed.data.link_url,
      position: parsed.data.position,
      is_active: parsed.data.is_active,
      image,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create showcase.");
  }

  revalidatePath('/admin/dashboard/showcase');
  revalidatePath('/');
  redirect('/admin/dashboard/showcase');
}

export async function updateShowcase(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const subtitleRaw = formData.get("subtitle") as string;
  const subtitle = subtitleRaw || null;
  const link_url = formData.get("link_url") as string;
  const position = formData.get("position") as string;
  const is_active = formData.get("is_active") === "true";
  const image = formData.get("image") as File | null;

  const parsed = showcaseSchema.safeParse({
    id,
    title,
    subtitle,
    link_url,
    position,
    is_active,
  });

  if (!parsed.success) {
    throw new Error("Invalid showcase data: " + parsed.error.issues[0].message);
  }

  try {
    await showcaseService.updateShowcase({
      id: parsed.data.id!,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      link_url: parsed.data.link_url,
      position: parsed.data.position,
      is_active: parsed.data.is_active,
      image: image && image.size > 0 ? image : undefined,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update showcase.");
  }

  revalidatePath('/admin/dashboard/showcase');
  revalidatePath('/');
  redirect('/admin/dashboard/showcase');
}

export async function deleteShowcase(prevState: unknown, formData: FormData) {
  const id = formData.get("showcaseId") as string;

  if (!id) {
    return { error: "Showcase ID is missing." };
  }

  try {
    await showcaseService.deleteShowcase(id);
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete showcase." };
  }

  revalidatePath('/admin/dashboard/showcase');
  revalidatePath('/');
  return { success: true };
}