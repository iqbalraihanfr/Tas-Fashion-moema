import * as showcaseRepo from "./database/showcase.repository";
import { supabaseAdmin } from "@/lib/supabase";
import { AppError } from "@/lib/errors";
import { compressWithSharp } from "@/lib/sharp-compress";

const BUCKET_NAME = "showcase-images";

export interface CreateShowcaseInput {
  title: string;
  subtitle: string | null;
  link_url: string;
  position: number;
  is_active: boolean;
  image: File;
}

export interface UpdateShowcaseInput {
  id: string;
  title?: string;
  subtitle?: string | null;
  link_url?: string;
  position?: number;
  is_active?: boolean;
  image?: File; // new image (optional on update)
}

/**
 * Upload a showcase image to Supabase Storage
 */
async function uploadShowcaseImage(file: File): Promise<string> {
  // Compress with Sharp for optimal quality
  const compressedBuffer = await compressWithSharp(file);
  const filename = `showcase-${Date.now()}-${file.name.replace(/\.[^/.]+$/, ".webp").replace(/\s/g, "_")}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filename, compressedBuffer, {
      cacheControl: "31536000",
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    console.error("Storage Error [uploadShowcaseImage]:", error);
    throw new AppError(
      `Failed to upload showcase image: ${error.message}`,
      500,
      "STORAGE_ERROR"
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Delete a showcase image from Supabase Storage
 */
async function deleteShowcaseImage(imageUrl: string): Promise<void> {
  const bucketPath = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const bucketIndex = imageUrl.indexOf(bucketPath);

  let filePath: string;
  if (bucketIndex !== -1) {
    filePath = decodeURIComponent(
      imageUrl.substring(bucketIndex + bucketPath.length)
    );
  } else {
    const parts = imageUrl.split("/");
    filePath = parts[parts.length - 1];
  }

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error("Storage Error [deleteShowcaseImage]:", error);
  }
}

// --- CRUD ---

export async function getAllShowcases() {
  return showcaseRepo.getAllShowcases();
}

export async function getActiveShowcases() {
  return showcaseRepo.getActiveShowcases();
}

export async function createShowcase(input: CreateShowcaseInput) {
  const imageUrl = await uploadShowcaseImage(input.image);

  return showcaseRepo.createShowcase({
    title: input.title,
    subtitle: input.subtitle,
    image_url: imageUrl,
    link_url: input.link_url,
    position: input.position,
    is_active: input.is_active,
  });
}

export async function updateShowcase(input: UpdateShowcaseInput) {
  const current = await showcaseRepo.getShowcaseById(input.id);
  if (!current) {
    throw new AppError("Showcase not found", 404, "NOT_FOUND");
  }

  let imageUrl = current.image_url;

  // If new image is provided, upload and delete old
  if (input.image && input.image.size > 0) {
    imageUrl = await uploadShowcaseImage(input.image);
    await deleteShowcaseImage(current.image_url);
  }

  return showcaseRepo.updateShowcase(input.id, {
    title: input.title ?? current.title,
    subtitle: input.subtitle !== undefined ? input.subtitle : current.subtitle,
    image_url: imageUrl,
    link_url: input.link_url ?? current.link_url,
    position: input.position ?? current.position,
    is_active: input.is_active !== undefined ? input.is_active : current.is_active,
  });
}

export async function deleteShowcase(id: string) {
  const current = await showcaseRepo.getShowcaseById(id);
  if (!current) return;

  // Delete image from storage
  await deleteShowcaseImage(current.image_url);

  // Delete from DB
  await showcaseRepo.deleteShowcase(id);
}
