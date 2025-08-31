import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { BookLayout } from '@/components/book-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText } from 'lucide-react'
import { getAllDocSections } from '@/lib/content'
import { Breadcrumbs } from '@/components/breadcrumbs'

interface SectionPageProps {
  params: Promise<{
    section: string
  }>
}

export async function generateStaticParams() {
  const sections = await getAllDocSections()
  return sections.map((section) => ({
    section: section.slug,
  }))
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { section } = await params
  const sections = await getAllDocSections()
  const currentSection = sections.find(s => s.slug === section)
  
  if (!currentSection) {
    return {
      title: 'Section Not Found - VibeCode',
      description: 'The requested documentation section could not be found.',
    }
  }

  return {
    title: `${currentSection.title} - VibeCode Documentation`,
    description: `Explore ${currentSection.title} documentation in the VibeCode guide.`,
    keywords: [
      'VibeCode',
      'documentation',
      'development',
      'cross-platform',
      currentSection.title,
    ],
    openGraph: {
      title: `${currentSection.title} - VibeCode Documentation`,
      description: `Explore ${currentSection.title} documentation in the VibeCode guide.`,
      type: 'website',
      url: `/docs/${section}`,
    },
  }
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params
  const sections = await getAllDocSections()
  const currentSection = sections.find(s => s.slug === section)
  
  if (!currentSection) {
    notFound()
  }

  return (
    <BookLayout>
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs section={section} document="" />
        
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {currentSection.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {currentSection.description || `Comprehensive guide to ${currentSection.title.toLowerCase()}`}
          </p>
        </header>

        {/* Main Documents */}
        {currentSection.items.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Documentation</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {currentSection.items.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${section}/${doc.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-md group-hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {doc.frontMatter.title}
                          </CardTitle>
                          {doc.frontMatter.description && (
                            <CardDescription className="mt-2">
                              {doc.frontMatter.description}
                            </CardDescription>
                          )}
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{doc.readingTime} min read</span>
                        </div>
                        <span>{doc.wordCount} words</span>
                      </div>
                      {doc.frontMatter.tags && doc.frontMatter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {doc.frontMatter.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.frontMatter.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.frontMatter.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Subsections */}
        {currentSection.subsections && currentSection.subsections.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Subsections</h2>
            <div className="space-y-8">
              {currentSection.subsections.map((subsection) => (
                <div key={subsection.slug}>
                  <h3 className="text-xl font-semibold mb-4">{subsection.title}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {subsection.items.map((doc) => (
                      <Link
                        key={doc.slug}
                        href={`/docs/${section}/${subsection.slug}/${doc.slug}`}
                        className="group"
                      >
                        <Card className="transition-all hover:shadow-md group-hover:border-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {doc.frontMatter.title}
                              </CardTitle>
                              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            {doc.frontMatter.description && (
                              <CardDescription>
                                {doc.frontMatter.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{doc.readingTime} min</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </BookLayout>
  )
}