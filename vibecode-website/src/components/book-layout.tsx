"use client"

import * as React from "react"
import { Navigation } from "./navigation"
import { BookSidebar } from "./book-sidebar"
import { Footer } from "./footer"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts"
import { cn } from "@/lib/utils"

interface BookLayoutProps {
  children: React.ReactNode
  className?: string
  currentSection?: string
  currentDocument?: string
}

export function BookLayout({ children, className, currentSection, currentDocument }: BookLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <BookSidebar 
            className="h-full" 
            currentSection={currentSection}
            currentDocument={currentDocument}
          />
        </aside>
        <main className={cn("relative py-6 lg:gap-10 lg:py-8 xl:gap-20", className)}>
          {children}
        </main>
      </div>
      <Footer />
      <KeyboardShortcutsDialog />
    </div>
  )
}