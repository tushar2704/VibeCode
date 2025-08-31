import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/mdx-components'

// Types for our content structure
export interface DocFrontMatter {
  title: string
  description?: string
  date?: string
  author?: string
  tags?: string[]
  order?: number
  published?: boolean
}

export interface DocContent {
  slug: string
  frontMatter: DocFrontMatter
  content: string
  readingTime: number
  wordCount: number
}

export interface DocSection {
  title: string
  slug: string
  description?: string
  items: DocContent[]
  subsections?: DocSection[]
}

// Utility to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

// Get the docs directory path
const DOCS_PATH = path.join(process.cwd(), '..', 'docs')

// Check if docs directory exists, if not use relative path
function getDocsPath(): string {
  if (fs.existsSync(DOCS_PATH)) {
    return DOCS_PATH
  }
  // Fallback to relative path from vibecode-website
  return path.join(process.cwd(), '..', 'docs')
}

// Get all markdown files in a directory
export function getMarkdownFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return []
    }
    return fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md'))
      .sort()
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

// Parse a single markdown file
export async function parseMarkdownFile(filePath: string): Promise<DocContent | null> {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    
    const slug = path.basename(filePath, '.md')
    const wordCount = content.trim().split(/\s+/).length
    const readingTime = calculateReadingTime(content)

    return {
      slug,
      frontMatter: {
        title: data.title || slug.replace(/-/g, ' '),
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags || [],
        order: data.order || 0,
        published: data.published !== false, // Default to true
      },
      content,
      readingTime,
      wordCount,
    }
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error)
    return null
  }
}

// Compile MDX content with all plugins
export async function compileMDXContent(content: string) {
  try {
    return await compileMDX({
      source: content,
      components: mdxComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypeHighlight, { detect: true, ignoreMissing: true }],
          ],
        },
      },
    })
  } catch (error) {
    console.error('Error compiling MDX:', error)
    throw error
  }
}

// Get all documentation sections
export async function getAllDocSections(): Promise<DocSection[]> {
  const docsPath = getDocsPath()
  const sections: DocSection[] = []

  try {
    if (!fs.existsSync(docsPath)) {
      console.warn('Docs directory not found:', docsPath)
      return []
    }

    const entries = fs.readdirSync(docsPath, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.match(/^\d{2}-/)) {
        const sectionPath = path.join(docsPath, entry.name)
        const section = await parseDocSection(sectionPath, entry.name)
        if (section) {
          sections.push(section)
        }
      }
    }

    return sections.sort((a, b) => a.slug.localeCompare(b.slug))
  } catch (error) {
    console.error('Error getting doc sections:', error)
    return []
  }
}

// Parse a documentation section
async function parseDocSection(sectionPath: string, dirName: string): Promise<DocSection | null> {
  try {
    const slug = dirName.replace(/^\d{2}-/, '')
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    const items: DocContent[] = []
    const subsections: DocSection[] = []

    const entries = fs.readdirSync(sectionPath, { withFileTypes: true })

    // Process markdown files in the main directory
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const filePath = path.join(sectionPath, entry.name)
        const docContent = await parseMarkdownFile(filePath)
        if (docContent) {
          items.push(docContent)
        }
      } else if (entry.isDirectory()) {
        // Process subdirectories
        const subsectionPath = path.join(sectionPath, entry.name)
        const subsection = await parseDocSection(subsectionPath, entry.name)
        if (subsection) {
          subsections.push(subsection)
        }
      }
    }

    // Sort items by order, then by slug
    items.sort((a, b) => {
      if (a.frontMatter.order !== b.frontMatter.order) {
        return (a.frontMatter.order || 0) - (b.frontMatter.order || 0)
      }
      return a.slug.localeCompare(b.slug)
    })

    return {
      title,
      slug,
      items,
      subsections: subsections.sort((a, b) => a.slug.localeCompare(b.slug)),
    }
  } catch (error) {
    console.error(`Error parsing section ${dirName}:`, error)
    return null
  }
}

// Get a specific document by section and slug
export async function getDocumentBySlug(
  sectionSlug: string, 
  documentSlug: string
): Promise<DocContent | null> {
  const docsPath = getDocsPath()
  
  // Find the section directory
  const entries = fs.readdirSync(docsPath, { withFileTypes: true })
  const sectionDir = entries.find(entry => 
    entry.isDirectory() && entry.name.includes(sectionSlug)
  )

  if (!sectionDir) {
    return null
  }

  const sectionPath = path.join(docsPath, sectionDir.name)
  const documentPath = path.join(sectionPath, `${documentSlug}.md`)

  return await parseMarkdownFile(documentPath)
}

// Get all available slugs for static generation
export function getAllDocumentSlugs(): { section: string; document: string }[] {
  const docsPath = getDocsPath()
  const slugs: { section: string; document: string }[] = []

  try {
    if (!fs.existsSync(docsPath)) {
      return []
    }

    const sections = fs.readdirSync(docsPath, { withFileTypes: true })
    
    for (const section of sections) {
      if (section.isDirectory() && section.name.match(/^\d{2}-/)) {
        const sectionSlug = section.name.replace(/^\d{2}-/, '')
        const sectionPath = path.join(docsPath, section.name)
        
        const files = getMarkdownFiles(sectionPath)
        for (const file of files) {
          const documentSlug = path.basename(file, '.md')
          slugs.push({
            section: sectionSlug,
            document: documentSlug,
          })
        }
      }
    }

    return slugs
  } catch (error) {
    console.error('Error getting document slugs:', error)
    return []
  }
}

// Search functionality
export async function searchDocuments(query: string): Promise<DocContent[]> {
  const sections = await getAllDocSections()
  const results: DocContent[] = []
  const searchTerm = query.toLowerCase()

  for (const section of sections) {
    for (const item of section.items) {
      const titleMatch = item.frontMatter.title.toLowerCase().includes(searchTerm)
      const contentMatch = item.content.toLowerCase().includes(searchTerm)
      const descriptionMatch = item.frontMatter.description?.toLowerCase().includes(searchTerm)
      
      if (titleMatch || contentMatch || descriptionMatch) {
        results.push(item)
      }
    }

    // Search in subsections
    if (section.subsections) {
      for (const subsection of section.subsections) {
        for (const item of subsection.items) {
          const titleMatch = item.frontMatter.title.toLowerCase().includes(searchTerm)
          const contentMatch = item.content.toLowerCase().includes(searchTerm)
          const descriptionMatch = item.frontMatter.description?.toLowerCase().includes(searchTerm)
          
          if (titleMatch || contentMatch || descriptionMatch) {
            results.push(item)
          }
        }
      }
    }
  }

  return results
}