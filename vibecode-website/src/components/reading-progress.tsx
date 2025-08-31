"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ReadingProgressProps {
  className?: string
}

export function ReadingProgress({ className }: ReadingProgressProps) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(scrollPercent, 100))
    }

    // Update on scroll
    window.addEventListener("scroll", updateScrollProgress, { passive: true })
    
    // Update on resize
    window.addEventListener("resize", updateScrollProgress, { passive: true })
    
    // Initial calculation
    updateScrollProgress()

    return () => {
      window.removeEventListener("scroll", updateScrollProgress)
      window.removeEventListener("resize", updateScrollProgress)
    }
  }, [])

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <div
        className="h-1 bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}