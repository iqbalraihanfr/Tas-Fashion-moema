import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import QueryProvider from "@/components/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
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
  metadataBase: new URL("https://www.moemacollection.com"),
  title: {
    template: "%s | MOEMA - Modern Leather Atelier",
    default: "MOEMA - Modern Leather Atelier",
  },
  description: "Discover luxury branded bags and modern sculpture with MOEMA. Handcrafted leather goods for the contemporary woman.",
  keywords: ["luxury bags", "leather atelier", "designer handbags", "modern sculpture", "MOEMA"],
  authors: [{ name: "MOEMA" }],
  creator: "MOEMA",
  publisher: "MOEMA",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.moemacollection.com",
    siteName: "MOEMA",
    title: "MOEMA - Modern Leather Atelier",
    description: "Discover luxury branded bags and modern sculpture with MOEMA.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MOEMA - Modern Leather Atelier",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOEMA - Modern Leather Atelier",
    description: "Discover luxury branded bags and modern sculpture with MOEMA.",
    images: ["/og-image.png"],
    creator: "@moemacollection",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <NuqsAdapter>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}

