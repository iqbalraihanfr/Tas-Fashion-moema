import { supabaseAdmin } from "@/lib/supabase";
import { AppError } from "@/lib/errors";
import { generateStoragePath } from "@/lib/image-utils";
import { compressWithSharp } from "@/lib/sharp-compress";

const BUCKET_NAME = "product-images";

/**
 * Upload product images to Supabase Storage with organized folder structure
 *
 * Storage structure: products/{baseName}/{baseName}-{color}-{number}.webp
 * Example: products/joanna/joanna-gray-1.webp
 *
 * @param files - Array of image files (resized from client, compressed server-side with Sharp)
 * @param baseName - Product model name (e.g., "Joanna")
 * @param color - Color variant (e.g., "Gray")
 * @param startIndex - Starting index for image numbering (default: 0)
 * @returns Array of public URLs for uploaded images
 */
export async function uploadProductImages(
  files: File[],
  baseName: string,
  color: string,
  startIndex: number = 0
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size === 0) continue;

    // Compress with Sharp for optimal quality at small file size
    const compressedBuffer = await compressWithSharp(file);

    // Generate organized storage path
    const storagePath = generateStoragePath(baseName, color, startIndex + i);

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, compressedBuffer, {
        cacheControl: "31536000", // 1 year cache for immutable images
        contentType: "image/webp",
        upsert: true, // Allow overwriting if re-uploading
      });

    if (error) {
      console.error("Storage Error [upload]:", error);
      throw new AppError(
        `Failed to upload image: ${error.message}`,
        500,
        "STORAGE_ERROR"
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    imageUrls.push(publicUrlData.publicUrl);
  }

  return imageUrls;
}

/**
 * Upload product images using legacy flat structure (for backwards compatibility)
 * @deprecated Use uploadProductImages with baseName and color parameters instead
 */
export async function uploadProductImagesLegacy(
  files: File[]
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const file of files) {
    if (file.size === 0) continue;

    const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage Error [upload]:", error);
      throw new AppError(
        `Failed to upload image: ${error.message}`,
        500,
        "STORAGE_ERROR"
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    imageUrls.push(publicUrlData.publicUrl);
  }

  return imageUrls;
}

/**
 * Delete product images from Supabase Storage
 * Handles both new organized paths and legacy flat structure
 *
 * @param imageUrls - Array of public URLs to delete
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  const filePaths = imageUrls.map((url) => {
    // Extract path after bucket name
    // URL format: https://xxx.supabase.co/storage/v1/object/public/product-images/path/to/file.webp
    const bucketPath = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const bucketIndex = url.indexOf(bucketPath);

    if (bucketIndex !== -1) {
      // Extract everything after the bucket path
      return decodeURIComponent(url.substring(bucketIndex + bucketPath.length));
    }

    // Fallback: just get the filename (legacy support)
    const parts = url.split("/");
    return parts[parts.length - 1];
  });

  if (filePaths.length > 0) {
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      console.error("Storage Error [delete]:", error);
      // We don't necessarily want to crash the whole process if deletion fails,
      // but we should log it.
    }
  }
}

/**
 * List all images for a specific product model
 *
 * @param baseName - Product model name (e.g., "Joanna")
 * @returns Array of file objects in the folder
 */
export async function listProductImages(baseName: string) {
  const folderPath = `products/${baseName.toLowerCase().replace(/\s+/g, "-")}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(folderPath, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("Storage Error [list]:", error);
    return [];
  }

  return data || [];
}

/**
 * Get the next available image number for a product variant
 * Used when adding new images to avoid overwriting
 *
 * @param baseName - Product model name
 * @param color - Color variant
 * @returns Next available image number (1-indexed)
 */
export async function getNextImageNumber(
  baseName: string,
  color: string
): Promise<number> {
  const files = await listProductImages(baseName);

  // Filter files matching this color variant
  const normalizedColor = color.toLowerCase().replace(/\s+/g, "-");
  const colorPattern = new RegExp(`-${normalizedColor}-(\\d+)\\.webp$`);

  let maxNumber = 0;
  for (const file of files) {
    const match = file.name.match(colorPattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  }

  return maxNumber + 1;
}
