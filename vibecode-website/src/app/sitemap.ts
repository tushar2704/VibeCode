import { getAllDocumentSlugs } from '@/lib/content'

export const dynamic = 'force-static'

export default function sitemap() {
  const baseUrl = 'https://vibecode.dev' // Replace with your actual domain
  
  // Get all document slugs
  const documentSlugs = getAllDocumentSlugs()
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/docs/getting-started/overview`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]
  
  // Dynamic documentation pages
  const documentPages = documentSlugs.map(({ section, document }) => ({
    url: `${baseUrl}/docs/${section}/${document}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  return [...staticPages, ...documentPages]
}