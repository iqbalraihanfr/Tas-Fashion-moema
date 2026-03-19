import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import QueryProvider from "@/components/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: "%s | MOEMA",
    default: "MOEMA | Premium Fashion Bags",
  },
  description: siteConfig.description,
  keywords: ["moema", "premium bags", "fashion bags", "designer handbags", "women bags", "luxury bags"],
  authors: [{ name: "MOEMA Collection" }],
  creator: "MOEMA Collection",
  publisher: "MOEMA Collection",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    siteName: siteConfig.siteName,
    title: "MOEMA | Premium Fashion Bags",
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MOEMA premium fashion bags",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOEMA | Premium Fashion Bags",
    description: siteConfig.description,
    images: ["/og-image.png"],
    creator: "@moemacollection",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MOEMA',
  },
  other: {
    'theme-color': '#111111',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Typekit for faster font loading */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <NuqsAdapter>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NuqsAdapter>
        <CookieConsent />
      </body>
    </html>
  );
}
