import { supabaseAdmin, supabase } from "@/lib/supabase";
import { COLOR_MAP } from "@/lib/color-map";

/** Build a fallback ColorEntry list from the static COLOR_MAP */
function staticFallback(): ColorEntry[] {
  return Object.entries(COLOR_MAP).map(([name, hex]) => ({
    id: name,
    name,
    hex,
    createdAt: new Date().toISOString(),
  }));
}

export type ColorEntry = {
  id: string;
  name: string;
  hex: string;
  createdAt: string;
};

/** Convert a ColorEntry array to a name→hex lookup object */
export function colorsToMap(colors: ColorEntry[]): Record<string, string> {
  return Object.fromEntries(colors.map((c) => [c.name, c.hex]));
}

export async function getAllColors(): Promise<ColorEntry[]> {
  const { data, error } = await supabase
    .from('Color')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    // Table not created yet — fall back to static color-map so the app stays functional
    return staticFallback();
  }

  // Table exists but empty (pre-seed) — also fall back
  if (!data || data.length === 0) {
    return staticFallback();
  }

  return data as ColorEntry[];
}

export async function createColor(name: string, hex: string): Promise<ColorEntry> {
  const { data, error } = await supabaseAdmin
    .from('Color')
    .insert({ name: name.trim(), hex: hex.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`A color named "${name}" already exists.`);
    }
    throw new Error('Failed to create color.');
  }

  return data as ColorEntry;
}

/**
 * Attempts to delete a color by id.
 * Returns null on success.
 * Returns { usedBy: string[] } if active products are using this color.
 */
export async function deleteColor(
  id: string
): Promise<{ usedBy: string[] } | null> {
  const { data: colorData } = await supabaseAdmin
    .from('Color')
    .select('name')
    .eq('id', id)
    .single();

  if (!colorData) return null;

  const { data: usedProducts } = await supabaseAdmin
    .from('Product')
    .select('name')
    .eq('color', colorData.name)
    .eq('is_archived', false);

  if (usedProducts && usedProducts.length > 0) {
    return { usedBy: (usedProducts as { name: string }[]).map((p) => p.name) };
  }

  const { error } = await supabaseAdmin
    .from('Color')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Failed to delete color.');

  return null;
}
