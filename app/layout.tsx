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
  title: {
    template: "%s | MOEMA - Modern Leather Atelier",
    default: "MOEMA - Modern Leather Atelier",
  },
  description: "Discover luxury branded bags and modern sculpture with MOEMA.",
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

