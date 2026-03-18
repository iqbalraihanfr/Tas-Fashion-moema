// lib/color-map.ts
// Maps admin-entered color name strings to CSS hex values.
// When a new color is added via admin, add its entry here — no other file needs to change.

export const COLOR_MAP: Record<string, string> = {
  "Black": "#1a1a1a",
  "White": "#f5f5f5",
  "Gray": "#9ca3af",
  "Cream": "#f5f0e8",
  "Camel": "#c19a6b",
  "Pine Brown": "#6b4c3b",
  "Tan": "#d2b48c",
  "Navy": "#1e3a5f",
  "Olive": "#6b7c45",
  "Burgundy": "#800020",
  "Dusty Pink": "#d4a5a5",
  "Sage": "#b2bfad",
};

export const COLOR_NAMES = Object.keys(COLOR_MAP);

export function colorToHex(colorName: string): string {
  return COLOR_MAP[colorName] ?? "#d4c4b7"; // fallback: neutral beige
}
