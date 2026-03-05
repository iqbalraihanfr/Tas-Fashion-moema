const MAX_DIMENSION = 1500;
const UPLOAD_QUALITY = 0.5;

/**
 * Convert canvas to a compressed blob, trying WebP first then falling back to JPEG.
 */
function canvasToCompressedBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Try WebP first
    canvas.toBlob(
      (webpBlob) => {
        if (webpBlob && webpBlob.type === "image/webp") {
          return resolve(webpBlob);
        }

        // WebP not supported — fallback to JPEG (universally supported)
        canvas.toBlob(
          (jpegBlob) => {
            if (!jpegBlob) return reject(new Error("Canvas toBlob failed"));
            resolve(jpegBlob);
          },
          "image/jpeg",
          UPLOAD_QUALITY
        );
      },
      "image/webp",
      UPLOAD_QUALITY
    );
  });
}

/**
 * Resize an image on the browser using canvas.
 * This is a lightweight pre-processing step to reduce upload size.
 * Final compression happens server-side with Sharp for optimal quality.
 */
export async function resizeImageForUpload(file: File): Promise<File> {
  // Skip if already small enough (< 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = async () => {
      try {
        const { width, height } = img;

        // Calculate new dimensions (resize if larger than max)
        const ratio = Math.min(
          MAX_DIMENSION / width,
          MAX_DIMENSION / height,
          1 // never upscale
        );
        const newWidth = Math.round(width * ratio);
        const newHeight = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const blob = await canvasToCompressedBlob(canvas);
        const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
        const resizedFile = new File(
          [blob],
          file.name.replace(/\.[^/.]+$/, ext),
          { type: blob.type }
        );

        URL.revokeObjectURL(img.src);
        resolve(resizedFile);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize multiple images with progress callback
 */
export async function resizeImagesForUpload(
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
      const resizedFile = await resizeImageForUpload(file);
      const compressedSize = resizedFile.size;
      const savings = Math.round((1 - compressedSize / originalSize) * 100);

      results.push({
        file: resizedFile,
        originalSize,
        compressedSize,
        savings: Math.max(savings, 0),
        status: "success",
      });

      onProgress?.({
        currentFile: i + 1,
        totalFiles: files.length,
        fileName: file.name,
        status: "done",
        savings: Math.max(savings, 0),
      });
    } catch {
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
 */
export function generateImageFileName(
  baseName: string,
  color: string,
  index: number
): string {
  const normalizedBaseName = baseName.toLowerCase().replace(/\s+/g, "-");
  const normalizedColor = color.toLowerCase().replace(/\s+/g, "-");
  const imageNumber = index + 1;
  return `${normalizedBaseName}-${normalizedColor}-${imageNumber}.webp`;
}

/**
 * Generate the full storage path for a product image
 * Format: products/{baseName}/{baseName}-{color}-{number}.webp
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
