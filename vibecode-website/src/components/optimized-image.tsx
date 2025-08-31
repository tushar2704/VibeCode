"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  
  const handleLoad = () => {
    setIsLoading(false)
  }
  
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }
  
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm">Image not available</span>
      </div>
    )
  }
  
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton 
          className="absolute inset-0" 
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
      />
    </div>
  )
}

interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}

export function LazyComponent({ 
  children, 
  fallback = <Skeleton className="h-24 w-full" />,
  rootMargin = "50px"
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [rootMargin])
  
  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}