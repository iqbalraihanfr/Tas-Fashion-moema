import imageCompression from "browser-image-compression";

/**
 * Configuration for image compression
 */
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.15, // Max 150KB
  maxWidthOrHeight: 1920, // Resize if too large
  useWebWorker: true, // Non-blocking
  fileType: "image/webp" as const, // WebP = smaller size, better quality
  initialQuality: 0.85,
};

/**
 * Compress a single image file
 * @param file - Original image file
 * @returns Compressed file as WebP
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const compressedBlob = await imageCompression(
      file,
      IMAGE_COMPRESSION_OPTIONS
    );

    // Convert blob back to File with proper name
    const compressedFile = new File(
      [compressedBlob],
      file.name.replace(/\.[^/.]+$/, ".webp"), // Change extension to .webp
      { type: "image/webp" }
    );

    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

/**
 * Compress multiple image files with progress callback
 * @param files - Array of original image files
 * @param onProgress - Optional callback for progress updates
 * @returns Array of compressed files with metadata
 */
export async function compressImages(
  files: File[],
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const originalSize = file.size;

    onProgress?.({
      currentFile: i + 1,
      totalFiles: files.length,
      fileName: file.name,
      status: "compressing",
    });

    try {
      const compressedFile = await compressImage(file);
      const compressedSize = compressedFile.size;
      const savings = Math.round((1 - compressedSize / originalSize) * 100);

      results.push({
        file: compressedFile,
        originalSize,
        compressedSize,
        savings,
        status: "success",
      });

      onProgress?.({
        currentFile: i + 1,
        totalFiles: files.length,
        fileName: file.name,
        status: "done",
        savings,
      });
    } catch {
      // If compression fails, use original file
      results.push({
        file,
        originalSize,
        compressedSize: originalSize,
        savings: 0,
        status: "error",
      });

      onProgress?.({
        currentFile: i + 1,
        totalFiles: files.length,
        fileName: file.name,
        status: "error",
      });
    }
  }

  return results;
}

/**
 * Generate a standardized filename for Supabase storage
 * Format: {baseName}-{color}-{number}.webp
 * Example: joanna-gray-1.webp (1 = hero/thumbnail, 2+ = gallery)
 *
 * @param baseName - Product model name (e.g., "Joanna")
 * @param color - Color variant (e.g., "Gray", "Pine Brown")
 * @param index - Image index (0 = hero/thumbnail)
 * @returns Standardized filename
 */
export function generateImageFileName(
  baseName: string,
  color: string,
  index: number
): string {
  // Convert to lowercase and replace spaces with dashes
  const normalizedBaseName = baseName.toLowerCase().replace(/\s+/g, "-");
  const normalizedColor = color.toLowerCase().replace(/\s+/g, "-");

  // Index starts at 1 (1 = hero, 2+ = gallery)
  const imageNumber = index + 1;

  return `${normalizedBaseName}-${normalizedColor}-${imageNumber}.webp`;
}

/**
 * Generate the full storage path for a product image
 * Format: products/{baseName}/{baseName}-{color}-{number}.webp
 * Example: products/joanna/joanna-gray-1.webp
 *
 * @param baseName - Product model name
 * @param color - Color variant
 * @param index - Image index
 * @returns Full storage path
 */
export function generateStoragePath(
  baseName: string,
  color: string,
  index: number
): string {
  const normalizedBaseName = baseName.toLowerCase().replace(/\s+/g, "-");
  const fileName = generateImageFileName(baseName, color, index);

  return `products/${normalizedBaseName}/${fileName}`;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Types
export interface CompressionProgress {
  currentFile: number;
  totalFiles: number;
  fileName: string;
  status: "compressing" | "done" | "error";
  savings?: number;
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savings: number;
  status: "success" | "error";
}

export interface ImagePreview {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize?: number;
  savings?: number;
  status: "pending" | "compressing" | "compressed" | "error";
  isExisting?: boolean;
  existingUrl?: string;
}
