import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BookLayout } from '@/components/book-layout'
import { DocumentContent } from '@/components/document-content'
import { getDocumentBySlug, getAllDocumentSlugs, compileMDXContent } from '@/lib/content'

interface DocPageProps {
  params: Promise<{
    section: string
    document: string
  }>
}

export async function generateStaticParams() {
  const slugs = getAllDocumentSlugs()
  return slugs.map(({ section, document }) => ({
    section,
    document,
  }))
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { section, document } = await params
  const doc = await getDocumentBySlug(section, document)
  
  if (!doc) {
    return {
      title: 'Document Not Found - VibeCode',
      description: 'The requested documentation page could not be found.',
    }
  }

  return {
    title: `${doc.frontMatter.title} - VibeCode`,
    description: doc.frontMatter.description || `Learn about ${doc.frontMatter.title} in the VibeCode documentation.`,
    keywords: [
      'VibeCode',
      'documentation',
      'development',
      'cross-platform',
      doc.frontMatter.title,
      ...(doc.frontMatter.tags || []),
    ],
    authors: [{ name: doc.frontMatter.author || 'Tushar Aggarwal' }],
    openGraph: {
      title: `${doc.frontMatter.title} - VibeCode`,
      description: doc.frontMatter.description || `Learn about ${doc.frontMatter.title} in the VibeCode documentation.`,
      type: 'article',
      url: `/docs/${section}/${document}`,
    },
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { section, document } = await params
  const doc = await getDocumentBySlug(section, document)
  
  if (!doc) {
    notFound()
  }

  let compiledContent
  try {
    const result = await compileMDXContent(doc.content)
    compiledContent = result.content
  } catch (error) {
    console.error('Error compiling MDX:', error)
    return (
      <BookLayout>
        <div className="container mx-auto max-w-4xl py-8">
          <div className="prose prose-lg dark:prose-invert">
            <h1>Error Loading Content</h1>
            <p>Sorry, there was an error loading this documentation page.</p>
          </div>
        </div>
      </BookLayout>
    )
  }

  return (
    <BookLayout 
      currentSection={section}
      currentDocument={document}
    >
      <DocumentContent
        doc={doc}
        compiledContent={compiledContent}
        section={section}
        document={document}
      />
    </BookLayout>
  )
}