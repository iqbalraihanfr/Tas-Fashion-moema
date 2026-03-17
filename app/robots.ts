import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout/',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://www.moemacollection.com/sitemap.xml',
  }
}
