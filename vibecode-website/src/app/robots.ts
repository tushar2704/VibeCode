export const dynamic = 'force-static'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/']
    },
    sitemap: 'https://vibecode.dev/sitemap.xml', // Replace with your actual domain
  }
}