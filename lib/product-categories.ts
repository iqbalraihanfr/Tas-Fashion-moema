export const PRODUCT_CATEGORIES = [
  "Totes",
  "Shoulder Bags",
  "Crossbody",
  "Mini Bags",
  "Clutches",
  "Backpacks",
  "Sale",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
