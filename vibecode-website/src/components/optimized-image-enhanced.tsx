'use client'

/**
 * Enhanced Image Optimization Components
 * Provides comprehensive image optimization with loading states, error handling, and performance monitoring
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle, ImageIcon } from 'lucide-react'

interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, 'onLoad' | 'onError'> {
  src: string
  alt: string
  fallbackSrc?: string
  showLoadingState?: boolean
  showErrorState?: boolean
  loadingClassName?: string
  errorClassName?: string
  onLoadComplete?: () => void
  onError?: (error: Error) => void
  enableBlur?: boolean
  enableLazyLoading?: boolean
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showLoadingState = true,
  showErrorState = true,
  loadingClassName,
  errorClassName,
  onLoadComplete,
  onError,
  enableBlur = true,
  enableLazyLoading = true,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setCurrentSrc(src)
  }, [src])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoadComplete?.()
  }, [onLoadComplete])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
    } else {
      const error = new Error(`Failed to load image: ${currentSrc}`)
      onError?.(error)
    }
  }, [fallbackSrc, currentSrc, onError])

  if (hasError && showErrorState) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        "border border-dashed rounded-md",
        errorClassName,
        className
      )}>
        <div className="flex flex-col items-center gap-2 p-4">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm">Failed to load image</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && showLoadingState && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-muted",
          "animate-pulse",
          loadingClassName
        )}>
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}
      
      <Image
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        loading={enableLazyLoading && !priority ? 'lazy' : 'eager'}
        placeholder={enableBlur ? 'blur' : 'empty'}
        blurDataURL={enableBlur ? 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==' : undefined}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
    </div>
  )
}

interface AvatarImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  name?: string
}

export function AvatarImage({ 
  size = 'md', 
  name, 
  className,
  ...props 
}: AvatarImageProps) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  }

  const sizeValue = sizes[size]

  return (
    <OptimizedImage
      width={sizeValue}
      height={sizeValue}
      className={cn(
        "rounded-full object-cover",
        className
      )}
      fallbackSrc={name ? generateAvatar(name) : undefined}
      {...props}
    />
  )
}

interface HeroImageProps extends Omit<OptimizedImageProps, 'priority'> {
  gradient?: boolean
  overlay?: boolean
}

export function HeroImage({ 
  gradient = false, 
  overlay = false, 
  className,
  ...props 
}: HeroImageProps) {
  return (
    <div className={cn("relative", className)}>
      <OptimizedImage
        priority={true}
        enableLazyLoading={false}
        className="w-full h-full object-cover"
        {...props}
      />
      
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      )}
      
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}
    </div>
  )
}

interface GalleryImageProps extends OptimizedImageProps {
  caption?: string
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait'
}

export function GalleryImage({ 
  caption, 
  aspectRatio = 'video',
  className,
  ...props 
}: GalleryImageProps) {
  const aspectRatios = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  }

  return (
    <figure className="space-y-2">
      <div className={cn(
        "overflow-hidden rounded-lg",
        aspectRatios[aspectRatio],
        className
      )}>
        <OptimizedImage
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          {...props}
        />
      </div>
      
      {caption && (
        <figcaption className="text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// Progressive image loading hook
export function useProgressiveImage(src: string, fallbackSrc?: string) {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc || '')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      setCurrentSrc(src)
      setIsLoaded(true)
    }
    img.src = src
  }, [src])

  return { src: currentSrc, isLoaded }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, options])

  return isIntersecting
}

// Image performance monitoring
export function useImagePerformance() {
  const [metrics, setMetrics] = useState<{
    loadTime: number
    fileSize: number
    renderTime: number
  } | null>(null)

  const measurePerformance = useCallback((src: string) => {
    const startTime = performance.now()
    const img = new window.Image()
    
    img.onload = () => {
      const loadTime = performance.now() - startTime
      
      // Estimate file size (this is approximate)
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const fileSize = parseInt(response.headers.get('content-length') || '0')
          const renderTime = performance.now() - startTime
          
          setMetrics({ loadTime, fileSize, renderTime })
        })
        .catch(() => {
          setMetrics({ loadTime, fileSize: 0, renderTime: 0 })
        })
    }
    
    img.src = src
  }, [])

  return { metrics, measurePerformance }
}

// Utility functions
function generateAvatar(name: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ]
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  const colorIndex = name.length % colors.length
  const color = colors[colorIndex]
  
  // Generate SVG data URL
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color.replace('bg-', '#')}" rx="50"/>
      <text x="50" y="50" dy="0.35em" text-anchor="middle" fill="white" font-size="40" font-family="system-ui">
        ${initials}
      </text>
    </svg>
  `
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Image format detection
export function getSupportedImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg'
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  // Check AVIF support
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif'
  }
  
  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp'
  }
  
  return 'jpeg'
}

// Responsive image srcSet generator
export function generateSrcSet(src: string, sizes: number[] = [480, 768, 1024, 1440, 1920]): string {
  const format = getSupportedImageFormat()
  return sizes
    .map(size => `${src}?w=${size}&f=${format} ${size}w`)
    .join(', ')
}