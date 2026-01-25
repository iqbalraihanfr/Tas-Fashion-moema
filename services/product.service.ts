import * as productRepo from "./database/product.repository";
import * as storageService from "./storage.service";
import slugify from "slugify";
import { AppError } from "@/lib/errors";

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: File[];
  slug?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
  existingImages?: string[];
}

export async function createProduct(input: CreateProductInput) {
  const slug = input.slug || slugify(input.name, { lower: true, strict: true });
  
  // 1. Upload Images
  const imageUrls = await storageService.uploadProductImages(input.images);
  
  // 2. Create in DB
  return await productRepo.createProduct({
    name: input.name,
    slug,
    description: input.description,
    price: input.price,
    stock: input.stock,
    images: imageUrls,
  });
}

export async function updateProduct(input: UpdateProductInput) {
  const currentProduct = await productRepo.getProductById(input.id);
  if (!currentProduct) {
    throw new AppError("Product not found", 404, "NOT_FOUND");
  }

  let finalImages = input.existingImages || currentProduct.images;
  
  // 1. Handle image deletions (if any images were removed)
  const imagesToDelete = currentProduct.images.filter(img => !finalImages.includes(img));
  if (imagesToDelete.length > 0) {
    await storageService.deleteProductImages(imagesToDelete);
  }

  // 2. Upload new images (if any)
  if (input.images && input.images.length > 0) {
    const newImageUrls = await storageService.uploadProductImages(input.images);
    finalImages = [...finalImages, ...newImageUrls];
  }

  const slug = input.slug || (input.name ? slugify(input.name, { lower: true, strict: true }) : currentProduct.slug);

  // 3. Update in DB
  return await productRepo.updateProduct(input.id, {
    name: input.name,
    slug,
    description: input.description,
    price: input.price,
    stock: input.stock,
    images: finalImages,
  });
}

export async function deleteProduct(id: string) {
  const product = await productRepo.getProductById(id);
  if (!product) return;

  // 1. Delete images from storage
  await storageService.deleteProductImages(product.images);

  // 2. Delete from DB
  await productRepo.deleteProduct(id);
}
