const DEFAULT_SITE_URL = "https://www.moemacollection.com";

export const siteConfig = {
  name: "MOEMA",
  siteName: "MOEMA Collection",
  url: (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL).replace(/\/$/, ""),
  description:
    "Discover premium fashion bags by MOEMA. Elegant silhouettes, refined details, and a curated collection for modern women.",
};
