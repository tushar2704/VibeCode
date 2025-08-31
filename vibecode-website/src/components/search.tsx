"use client"

import * as React from "react"
import { Search, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SearchResult {
  title: string
  description?: string
  section: string
  document: string
  href: string
  matches: string[]
  tags?: string[]
}

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  
  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    
    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        // This would typically call an API endpoint
        // For now, we'll simulate search results
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const mockResults: SearchResult[] = [
          {
            title: "Getting Started with VibeCode",
            description: "Learn the fundamentals of VibeCode methodology",
            section: "getting-started",
            document: "overview",
            href: "/docs/getting-started/overview",
            matches: ["fundamentals", "methodology"],
            tags: ["basics", "introduction"]
          },
          {
            title: "Context Engineering",
            description: "Three-layer context framework for better development",
            section: "context-engineering",
            document: "overview",
            href: "/docs/context-engineering/overview",
            matches: ["context", "framework"],
            tags: ["engineering", "methodology"]
          },
          {
            title: "Web Development Frontend",
            description: "Frontend development strategies and best practices",
            section: "web-development",
            document: "frontend",
            href: "/docs/web-development/frontend",
            matches: ["frontend", "web"],
            tags: ["web", "frontend", "development"]
          }
        ].filter(result => 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description?.toLowerCase().includes(query.toLowerCase()) ||
          result.matches.some(match => match.toLowerCase().includes(query.toLowerCase())) ||
          result.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        
        setResults(mockResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [query])
  
  const handleResultClick = () => {
    onOpenChange(false)
    setQuery("")
    setResults([])
  }
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)}>
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-background rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="flex items-center space-x-2 text-lg font-semibold">
            <Search className="h-5 w-5" />
            <span>Search Documentation</span>
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => {
                  setQuery("")
                  setResults([])
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Searching...</div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.href}
                    onClick={handleResultClick}
                    className="block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{result.title}</h3>
                        {result.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {result.section}
                          </Badge>
                          {result.tags && result.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">No results found</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Try searching with different keywords
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Start typing to search</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Search across all documentation sections
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          
          <div className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">K</kbd> to search
          </div>
        </div>
      </div>
    </div>
  )
}

export function SearchButton() {
  const [open, setOpen] = React.useState(false)
  
  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search documentation...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 xl:flex">
          ⌘K
        </kbd>
      </Button>
      <SearchModal open={open} onOpenChange={setOpen} />
    </>
  )
}