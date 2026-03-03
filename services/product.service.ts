import * as productRepo from "./database/product.repository";
import * as storageService from "./storage.service";
import slugify from "slugify";
import { AppError } from "@/lib/errors";

export interface CreateProductInput {
  name: string;           // Full name, e.g., "Joanna Gray"
  baseName: string;       // Model name, e.g., "Joanna"
  sku: string;            // Product code, e.g., "Y1886"
  color: string;          // Color variant, e.g., "Gray"
  dimensions: string;     // Size, e.g., "45 cm x 45 cm"
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
  
  // 1. Upload Images with organized folder structure
  // Structure: products/{baseName}/{baseName}-{color}-{number}.webp
  const imageUrls = await storageService.uploadProductImages(
    input.images,
    input.baseName,
    input.color
  );
  
  // 2. Create in DB
  return await productRepo.createProduct({
    name: input.name,
    baseName: input.baseName,
    slug,
    sku: input.sku,
    color: input.color,
    dimensions: input.dimensions,
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
    // Calculate start index based on existing images count
    const baseName = input.baseName || currentProduct.baseName;
    const color = input.color || currentProduct.color;
    const startIndex = finalImages.length;
    
    const newImageUrls = await storageService.uploadProductImages(
      input.images,
      baseName,
      color,
      startIndex
    );
    finalImages = [...finalImages, ...newImageUrls];
  }

  const slug = input.slug || (input.name ? slugify(input.name, { lower: true, strict: true }) : currentProduct.slug);

  // 3. Update in DB
  return await productRepo.updateProduct(input.id, {
    name: input.name,
    baseName: input.baseName,
    slug,
    sku: input.sku,
    color: input.color,
    dimensions: input.dimensions,
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
