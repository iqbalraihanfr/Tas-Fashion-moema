import { supabaseAdmin, supabase } from "@/lib/supabase";
import { Showcase } from "@/lib/types";
import { AppError } from "@/lib/errors";

/**
 * Get all showcases ordered by position (admin view)
 */
export async function getAllShowcases(): Promise<Showcase[]> {
  const { data, error } = await supabaseAdmin
    .from("Showcase")
    .select("*")
    .order("position", { ascending: true });

  if (error) {
    console.error("Repository Error [getAllShowcases]:", error);
    throw new AppError("Failed to fetch showcases", 500, "DATABASE_ERROR");
  }

  return data as Showcase[];
}

/**
 * Get only active showcases ordered by position (buyer homepage)
 */
export async function getActiveShowcases(): Promise<Showcase[]> {
  const { data, error } = await supabase
    .from("Showcase")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("Repository Error [getActiveShowcases]:", error);
    return []; // graceful fallback for homepage
  }

  return data as Showcase[];
}

/**
 * Get a single showcase by ID
 */
export async function getShowcaseById(id: string): Promise<Showcase | null> {
  const { data, error } = await supabaseAdmin
    .from("Showcase")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Repository Error [getShowcaseById]:", error);
    throw new AppError("Failed to fetch showcase", 500, "DATABASE_ERROR");
  }

  return data as Showcase | null;
}

/**
 * Create a new showcase
 */
export async function createShowcase(
  data: Omit<Showcase, "id" | "created_at" | "updated_at">
): Promise<Showcase> {
  const { data: showcase, error } = await supabaseAdmin
    .from("Showcase")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Repository Error [createShowcase]:", error);
    throw new AppError("Failed to create showcase", 500, "DATABASE_ERROR");
  }

  return showcase as Showcase;
}

/**
 * Update a showcase
 */
export async function updateShowcase(
  id: string,
  data: Partial<Omit<Showcase, "id" | "created_at" | "updated_at">>
): Promise<Showcase> {
  const { data: showcase, error } = await supabaseAdmin
    .from("Showcase")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Repository Error [updateShowcase]:", error);
    throw new AppError("Failed to update showcase", 500, "DATABASE_ERROR");
  }

  return showcase as Showcase;
}

/**
 * Delete a showcase
 */
export async function deleteShowcase(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("Showcase")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Repository Error [deleteShowcase]:", error);
    throw new AppError("Failed to delete showcase", 500, "DATABASE_ERROR");
  }
}
