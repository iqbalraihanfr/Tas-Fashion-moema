import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swsiannmzvkawjkorwjd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/product-images/**',
      },
      {
        protocol: 'https',
        hostname: 'swsiannmzvkawjkorwjd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/showcase-images/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
