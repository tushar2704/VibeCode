"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { sidebarData, SidebarItem } from "@/components/book-sidebar"

interface PageNavigationProps {
  currentSection: string
  currentDocument: string
}

interface NavigationItem {
  title: string
  href: string
  section: string
  document: string
}

// Flatten the sidebar data into a linear array for navigation
function flattenSidebarData(items: SidebarItem[], result: NavigationItem[] = []): NavigationItem[] {
  for (const item of items) {
    if (item.href) {
      // Extract section and document from href like "/docs/section/document"
      const pathParts = item.href.split('/').filter(Boolean)
      if (pathParts.length >= 3 && pathParts[0] === 'docs') {
        result.push({
          title: item.title,
          href: item.href,
          section: pathParts[1],
          document: pathParts[2]
        })
      }
    }
    
    if (item.items) {
      flattenSidebarData(item.items, result)
    }
  }
  
  return result
}

export function PageNavigation({ currentSection, currentDocument }: PageNavigationProps) {
  const navigationItems = React.useMemo(() => flattenSidebarData(sidebarData), [])
  
  const currentIndex = navigationItems.findIndex(
    item => item.section === currentSection && item.document === currentDocument
  )
  
  if (currentIndex === -1) {
    return null
  }
  
  const previousPage = currentIndex > 0 ? navigationItems[currentIndex - 1] : null
  const nextPage = currentIndex < navigationItems.length - 1 ? navigationItems[currentIndex + 1] : null
  
  if (!previousPage && !nextPage) {
    return null
  }
  
  return (
    <div className="mt-12 pt-8 border-t">
      <div className="grid gap-4 md:grid-cols-2">
        {previousPage ? (
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full h-auto p-6 justify-start group-hover:bg-muted/50"
                asChild
              >
                <Link href={previousPage.href}>
                  <div className="flex items-center space-x-3">
                    <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <div className="text-sm text-muted-foreground">Previous</div>
                      <div className="font-medium">{previousPage.title}</div>
                    </div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div /> // Empty div to maintain grid layout
        )}
        
        {nextPage ? (
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full h-auto p-6 justify-end group-hover:bg-muted/50"
                asChild
              >
                <Link href={nextPage.href}>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Next</div>
                      <div className="font-medium">{nextPage.title}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div /> // Empty div to maintain grid layout
        )}
      </div>
    </div>
  )
}