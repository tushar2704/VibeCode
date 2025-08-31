"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = React.useState<TocItem[]>([])
  const [activeId, setActiveId] = React.useState<string>("")

  // Extract headings from markdown content
  React.useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const items: TocItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      items.push({ id, title, level })
    }

    setTocItems(items)
  }, [content])

  // Track active heading based on scroll position
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0.1,
      }
    )

    // Observe all headings
    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [tocItems])

  if (tocItems.length === 0) {
    return null
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const top = element.offsetTop - 100
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
        On This Page
      </h4>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={cn(
              "block w-full text-left text-sm py-1 px-2 rounded text-muted-foreground hover:text-foreground transition-colors",
              {
                "text-primary bg-primary/10": activeId === item.id,
                "pl-4": item.level === 2,
                "pl-6": item.level === 3,
                "pl-8": item.level === 4,
                "pl-10": item.level === 5,
                "pl-12": item.level === 6,
              }
            )}
          >
            {item.title}
          </button>
        ))}
      </nav>
    </div>
  )
}