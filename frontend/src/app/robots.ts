import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/admin/',
          '/kyc',
          '/checkout',
          '/checkout/',
          '/settings',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://maxfunded.com/sitemap.xml',
  };
}
