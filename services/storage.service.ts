import { supabaseAdmin } from "@/lib/supabase";
import { AppError } from "@/lib/errors";

export async function uploadProductImages(files: File[]): Promise<string[]> {
  const imageUrls: string[] = [];
  
  for (const file of files) {
    if (file.size === 0) continue;
    
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error("Storage Error [upload]:", error);
      throw new AppError(`Failed to upload image: ${error.message}`, 500, "STORAGE_ERROR");
    }
    
    const { data: publicUrlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(data.path);
    imageUrls.push(publicUrlData.publicUrl);
  }
  
  return imageUrls;
}

export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  const filePaths = imageUrls.map(url => {
    const parts = url.split('/');
    return parts[parts.length - 1]; // Get the filename
  });

  if (filePaths.length > 0) {
    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .remove(filePaths);

    if (error) {
      console.error("Storage Error [delete]:", error);
      // We don't necessarily want to crash the whole process if deletion fails, 
      // but we should log it.
    }
  }
}
