'use client'

/**
 * Bookmark Manager Component
 * Allows users to save and manage their favorite documentation pages
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bookmark, BookmarkCheck, Search, X, Star, Clock, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BookmarkData {
  id: string
  title: string
  description?: string
  url: string
  section: string
  document: string
  tags: string[]
  addedAt: string
  lastVisited?: string
}

interface BookmarkManagerProps {
  currentPage?: {
    title: string
    description?: string
    section: string
    document: string
    url: string
    tags?: string[]
  }
  className?: string
}

export function BookmarkManager({ currentPage, className }: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('vibecode-bookmarks')
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (error) {
        console.error('Error loading bookmarks:', error)
      }
    }
  }, [])

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('vibecode-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  // Check if current page is bookmarked
  const isCurrentPageBookmarked = currentPage ? 
    bookmarks.some(bookmark => bookmark.url === currentPage.url) : false

  // Add or remove bookmark for current page
  const toggleBookmark = () => {
    if (!currentPage) return

    if (isCurrentPageBookmarked) {
      removeBookmark(currentPage.url)
    } else {
      addBookmark(currentPage)
    }
  }

  // Add a new bookmark
  const addBookmark = (page: typeof currentPage) => {
    if (!page) return

    const newBookmark: BookmarkData = {
      id: `${page.section}-${page.document}-${Date.now()}`,
      title: page.title,
      description: page.description,
      url: page.url,
      section: page.section,
      document: page.document,
      tags: page.tags || [],
      addedAt: new Date().toISOString(),
    }

    setBookmarks(prev => [newBookmark, ...prev])
  }

  // Remove a bookmark
  const removeBookmark = (url: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.url !== url))
  }

  // Clear all bookmarks
  const clearAllBookmarks = () => {
    if (confirm('Are you sure you want to clear all bookmarks?')) {
      setBookmarks([])
    }
  }

  // Filter bookmarks based on search query
  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Update last visited when navigating to a bookmark
  const visitBookmark = (url: string) => {
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.url === url
          ? { ...bookmark, lastVisited: new Date().toISOString() }
          : bookmark
      )
    )
    window.location.href = url
    setIsOpen(false)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Floating bookmark toggle button */}
      {currentPage && (
        <Button
          variant={isCurrentPageBookmarked ? "default" : "outline"}
          size="sm"
          onClick={toggleBookmark}
          className="flex items-center gap-1"
          title={isCurrentPageBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {isCurrentPageBookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isCurrentPageBookmarked ? "Bookmarked" : "Bookmark"}
          </span>
        </Button>
      )}

      {/* Bookmarks panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Bookmarks</span>
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                {bookmarks.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Bookmarks
              {bookmarks.length > 0 && (
                <Badge variant="outline">{bookmarks.length} saved</Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Your saved documentation pages for quick access
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Search bookmarks */}
            {bookmarks.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Bookmarks list */}
            <ScrollArea className="h-[500px]">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {bookmarks.length === 0 ? (
                    <div className="space-y-2">
                      <Bookmark className="w-12 h-12 mx-auto opacity-50" />
                      <p>No bookmarks yet</p>
                      <p className="text-sm">Start bookmarking pages to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Search className="w-12 h-12 mx-auto opacity-50" />
                      <p>No bookmarks found</p>
                      <p className="text-sm">Try adjusting your search query</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => visitBookmark(bookmark.url)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                            {bookmark.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {bookmark.section.replace(/-/g, ' ')} → {bookmark.document.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeBookmark(bookmark.url)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      {bookmark.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {bookmark.description}
                        </p>
                      )}

                      {bookmark.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {bookmark.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {bookmark.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{bookmark.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Added {new Date(bookmark.addedAt).toLocaleDateString()}
                        </span>
                        {bookmark.lastVisited && (
                          <span>
                            Last visited {new Date(bookmark.lastVisited).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Clear all bookmarks */}
            {bookmarks.length > 0 && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllBookmarks}
                  className="w-full text-destructive hover:text-destructive"
                >
                  Clear All Bookmarks
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}