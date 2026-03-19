import * as productRepo from "./database/product.repository";
import * as storageService from "./storage.service";
import slugify from "slugify";
import { AppError } from "@/lib/errors";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

export interface CreateProductInput {
  name: string;           // Full name, e.g., "Joanna Gray"
  baseName: string;       // Model name, e.g., "Joanna"
  sku: string;            // Product code, e.g., "Y1886"
  color: string;          // Color variant, e.g., "Gray"
  dimensions: string;     // Size, e.g., "45 cm x 45 cm"
  description: string;
  category: string | null; // Product category, e.g., "Totes"
  price: number;
  stock: number;
  images: File[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
  existingImages?: string[];
}

function normalizeRequiredText(value: string, field: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    throw new AppError(`${field} is required`, 400, "VALIDATION_ERROR");
  }

  return normalized;
}

function normalizeOptionalCategory(category: string | null | undefined) {
  if (!category) {
    return null;
  }

  const normalized = category.trim();
  if (!normalized) {
    return null;
  }

  if (!PRODUCT_CATEGORIES.includes(normalized as (typeof PRODUCT_CATEGORIES)[number])) {
    throw new AppError("Invalid product category", 400, "VALIDATION_ERROR");
  }

  return normalized;
}

function ensurePublicProductShape(input: Pick<CreateProductInput, "name" | "baseName" | "sku" | "color" | "dimensions" | "description" | "category">) {
  const name = normalizeRequiredText(input.name, "Product name");
  const baseName = normalizeRequiredText(input.baseName, "Base name");
  const sku = normalizeRequiredText(input.sku, "SKU");
  const color = normalizeRequiredText(input.color, "Color");
  const dimensions = normalizeRequiredText(input.dimensions, "Dimensions");
  const description = normalizeRequiredText(input.description, "Description");
  const category = normalizeOptionalCategory(input.category);
  const slug = slugify(name, { lower: true, strict: true });

  if (!slug) {
    throw new AppError(
      "Product name must contain letters or numbers so a valid slug can be generated",
      400,
      "VALIDATION_ERROR"
    );
  }

  return {
    name,
    baseName,
    sku,
    color,
    dimensions,
    description,
    category,
    slug,
  };
}

export async function createProduct(input: CreateProductInput) {
  const normalized = ensurePublicProductShape(input);
  if (input.images.length === 0) {
    throw new AppError("At least one product image is required", 400, "VALIDATION_ERROR");
  }
  
  // 1. Upload Images with organized folder structure
  // Structure: products/{baseName}/{baseName}-{color}-{number}.webp
  const imageUrls = await storageService.uploadProductImages(
    input.images,
    normalized.baseName,
    normalized.color
  );
  
  // 2. Create in DB
  return await productRepo.createProduct({
    name: normalized.name,
    baseName: normalized.baseName,
    slug: normalized.slug,
    sku: normalized.sku,
    color: normalized.color,
    dimensions: normalized.dimensions,
    description: normalized.description,
    category: normalized.category,
    price: input.price,
    stock: input.stock,
    images: imageUrls,
    is_archived: false,
  });
}

export async function updateProduct(input: UpdateProductInput) {
  const currentProduct = await productRepo.getProductById(input.id);
  if (!currentProduct) {
    throw new AppError("Product not found", 404, "NOT_FOUND");
  }

  const normalized = ensurePublicProductShape({
    name: input.name ?? currentProduct.name,
    baseName: input.baseName ?? currentProduct.baseName,
    sku: input.sku ?? currentProduct.sku,
    color: input.color ?? currentProduct.color,
    dimensions: input.dimensions ?? currentProduct.dimensions,
    description: input.description ?? currentProduct.description,
    category: input.category ?? currentProduct.category,
  });

  let finalImages = input.existingImages || currentProduct.images;
  
  // 1. Handle image deletions (if any images were removed)
  const imagesToDelete = currentProduct.images.filter(img => !finalImages.includes(img));
  if (imagesToDelete.length > 0) {
    await storageService.deleteProductImages(imagesToDelete);
  }

  // 2. Upload new images (if any)
  if (input.images && input.images.length > 0) {
    // Calculate start index based on existing images count
    const baseName = normalized.baseName;
    const color = normalized.color;
    const startIndex = finalImages.length;
    
    const newImageUrls = await storageService.uploadProductImages(
      input.images,
      baseName,
      color,
      startIndex
    );
    finalImages = [...finalImages, ...newImageUrls];
  }

  if (finalImages.length === 0) {
    throw new AppError("At least one product image is required", 400, "VALIDATION_ERROR");
  }

  // 3. Update in DB
  return await productRepo.updateProduct(input.id, {
    name: normalized.name,
    baseName: normalized.baseName,
    slug: normalized.slug,
    sku: normalized.sku,
    color: normalized.color,
    dimensions: normalized.dimensions,
    description: normalized.description,
    category: normalized.category,
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

export async function archiveProduct(id: string) {
  const product = await productRepo.getProductById(id);
  if (!product) {
    throw new AppError("Product not found", 404, "NOT_FOUND");
  }
  await productRepo.archiveProduct(id);
}

export async function unarchiveProduct(id: string) {
  const product = await productRepo.getProductById(id);
  if (!product) {
    throw new AppError("Product not found", 404, "NOT_FOUND");
  }
  await productRepo.unarchiveProduct(id);
}
