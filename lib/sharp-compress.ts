import sharp from "sharp";

const MAX_WIDTH_OR_HEIGHT = 1500;
const TARGET_SIZE_KB = 200;
const TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024;

/**
 * Compress an image using Sharp (server-side).
 * Resizes to max 1500px and outputs high-quality WebP targeting ~200KB.
 *
 * @param input - File, Buffer, or ArrayBuffer
 * @returns Compressed WebP buffer
 */
export async function compressWithSharp(
  input: File | Buffer | ArrayBuffer
): Promise<Buffer> {
  let buffer: Buffer;

  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else if (input instanceof ArrayBuffer) {
    buffer = Buffer.from(input);
  } else {
    buffer = input;
  }

  // First pass: resize and compress at quality 82
  let result = await sharp(buffer)
    .resize(MAX_WIDTH_OR_HEIGHT, MAX_WIDTH_OR_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  // If still over target, reduce quality iteratively
  if (result.length > TARGET_SIZE_BYTES) {
    // Binary search for optimal quality
    let low = 40;
    let high = 80;
    let bestResult = result;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const attempt = await sharp(buffer)
        .resize(MAX_WIDTH_OR_HEIGHT, MAX_WIDTH_OR_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: mid })
        .toBuffer();

      if (attempt.length <= TARGET_SIZE_BYTES) {
        bestResult = attempt;
        low = mid + 1; // Try higher quality
      } else {
        high = mid - 1; // Try lower quality
      }
    }

    result = bestResult;
  }

  return result;
}
