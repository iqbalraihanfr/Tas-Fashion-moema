// lib/color-map.ts
// Maps admin-entered color name strings to CSS hex values.
// When a new color is added via admin, add its entry here — no other file needs to change.

export const COLOR_MAP: Record<string, string> = {
  // Neutrals
  "Black": "#1a1a1a",
  "White": "#f5f5f5",
  "Gray": "#9ca3af",
  "Grey": "#9ca3af",
  "Light Grey": "#d1d5db",
  "Silver Grey": "#c0c0c0",
  "Cream": "#f5f0e8",
  "Ivory": "#fffff0",
  // Browns & earth tones
  "Camel": "#c19a6b",
  "Tan": "#d2b48c",
  "Brown": "#8b5e3c",
  "Pine Brown": "#6b4c3b",
  "Chocolate": "#3d1c02",
  "Cocoa": "#5c3d2e",
  "Coffee": "#6f4e37",
  "Coffe": "#6f4e37",
  "Cappuccino": "#a07850",
  "Caramel": "#c68642",
  "Tawny": "#cd5700",
  "Wheat": "#f5deb3",
  "Oak": "#9c6b3c",
  "Mocca": "#7b4f3a",
  "Ebony": "#2c2416",
  // Greens
  "Olive": "#6b7c45",
  "Olive Green": "#6b7c45",
  "Old Green": "#556b2f",
  "Mustard Green": "#9a8c2c",
  "Sage": "#b2bfad",
  "Mung Beans (Kacang Hijau)": "#5a7a3a",
  // Blues
  "Navy": "#1e3a5f",
  "Baby Blue": "#89cff0",
  "Pearl Blue": "#b0c4d8",
  // Pinks & reds
  "Dusty Pink": "#d4a5a5",
  "Wine": "#722f37",
  "Wine Red": "#722f37",
  "Burgundy": "#800020",
  "Purplish Red": "#9b2335",
  "Red Angola": "#a0212e",
  // Yellows
  "Lemon Yellow": "#fff44f",
  "Gold": "#d4af37",
  // Others
  "Apricot": "#fbceb1",
  "Khaki": "#c3b091",
};

export const COLOR_NAMES = Object.keys(COLOR_MAP);

export function colorToHex(colorName: string): string {
  return COLOR_MAP[colorName] ?? "#d4c4b7"; // fallback: neutral beige
}
