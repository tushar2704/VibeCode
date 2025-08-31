"use client"

import * as React from "react"
import { Clock, User, Calendar, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DocContent } from "@/lib/content"
import { TableOfContents } from "@/components/table-of-contents"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ReadingProgress } from "@/components/reading-progress"
import { PageNavigation } from "@/components/page-navigation"
import { BookmarkManager } from "@/components/bookmark-manager"

interface DocumentContentProps {
  doc: DocContent
  compiledContent: React.ReactElement
  section: string
  document: string
}

export function DocumentContent({ 
  doc, 
  compiledContent, 
  section, 
  document 
}: DocumentContentProps) {
  const currentPage = React.useMemo(() => ({
    title: doc.frontMatter.title,
    description: doc.frontMatter.description,
    section,
    document,
    url: `/docs/${section}/${document}`,
    tags: doc.frontMatter.tags
  }), [doc.frontMatter, section, document])

  return (
    <>
      <ReadingProgress />
      <BookmarkManager currentPage={currentPage} />
      <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
        <main className="min-w-0">
          {/* Breadcrumbs */}
          <Breadcrumbs section={section} document={document} />
          
          {/* Document Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {doc.frontMatter.title}
            </h1>
            
            {doc.frontMatter.description && (
              <p className="text-xl text-muted-foreground mb-6">
                {doc.frontMatter.description}
              </p>
            )}
            
            {/* Document Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              {doc.frontMatter.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{doc.frontMatter.author}</span>
                </div>
              )}
              
              {doc.frontMatter.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(doc.frontMatter.date).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{doc.readingTime} min read</span>
              </div>
              
              <span>{doc.wordCount} words</span>
            </div>
            
            {/* Tags */}
            {doc.frontMatter.tags && doc.frontMatter.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {doc.frontMatter.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Separator />
          </header>
          
          {/* Document Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none">
            {compiledContent}
          </article>
          
          {/* Page Navigation */}
          <PageNavigation 
            currentSection={section}
            currentDocument={document}
          />
        </main>
        
        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TableOfContents content={doc.content} />
          </div>
        </aside>
      </div>
    </div>
    </>
  )
}