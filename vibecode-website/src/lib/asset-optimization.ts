/**
 * Asset Optimization Utilities for VibeCode Website
 * Provides comprehensive asset loading, caching, and optimization strategies
 */

import { useState, useEffect, useCallback } from 'react'

// Asset types and their optimization strategies
export type AssetType = 'image' | 'font' | 'css' | 'js' | 'svg'

export interface AssetOptimizationConfig {
  preload?: boolean
  prefetch?: boolean
  priority?: 'high' | 'low' | 'auto'
  format?: 'webp' | 'avif' | 'auto'
  quality?: number
  sizes?: string
  loading?: 'lazy' | 'eager'
  crossOrigin?: 'anonymous' | 'use-credentials'
}

// Asset preloading utility
export function preloadAsset(
  href: string, 
  type: AssetType, 
  config: AssetOptimizationConfig = {}
): void {
  // Check if already preloaded
  if (document.querySelector(`link[href="${href}"]`)) {
    return
  }

  const link = document.createElement('link')
  link.rel = config.preload ? 'preload' : 'prefetch'
  link.href = href
  
  // Set appropriate 'as' attribute based on asset type
  switch (type) {
    case 'image':
      link.as = 'image'
      if (config.crossOrigin) {
        link.crossOrigin = config.crossOrigin
      }
      break
    case 'font':
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      break
    case 'css':
      link.as = 'style'
      break
    case 'js':
      link.as = 'script'
      break
    case 'svg':
      link.as = 'image'
      link.type = 'image/svg+xml'
      break
  }

  if (config.priority) {
    link.setAttribute('fetchpriority', config.priority)
  }

  document.head.appendChild(link)
}

// Resource hints for critical assets
export function addResourceHints(resources: Array<{
  href: string
  type: AssetType
  hint: 'preload' | 'prefetch' | 'preconnect' | 'dns-prefetch'
  config?: AssetOptimizationConfig
}>): void {
  resources.forEach(({ href, type, hint, config = {} }) => {
    if (hint === 'preconnect' || hint === 'dns-prefetch') {
      // DNS/Connection hints
      const link = document.createElement('link')
      link.rel = hint
      link.href = href
      if (config.crossOrigin) {
        link.crossOrigin = config.crossOrigin
      }
      document.head.appendChild(link)
    } else {
      // Resource hints
      preloadAsset(href, type, { ...config, preload: hint === 'preload' })
    }
  })
}

// Critical CSS inlining
export function inlineCriticalCSS(css: string): void {
  const style = document.createElement('style')
  style.textContent = css
  style.dataset.critical = 'true'
  document.head.appendChild(style)
}

// Asset loading hook with caching
export function useAssetLoader<T>(
  url: string,
  type: AssetType,
  options: AssetOptimizationConfig = {}
) {
  const [asset, setAsset] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadAsset = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check cache first
      const cacheKey = `asset_${url}_${type}`
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached && type !== 'image') {
        setAsset(JSON.parse(cached))
        setLoading(false)
        return
      }

      let result: T

      switch (type) {
        case 'image':
          result = await loadImage(url, options) as T
          break
        case 'font':
          result = await loadFont(url) as T
          break
        case 'css':
          result = await loadCSS(url) as T
          break
        case 'js':
          result = await loadScript(url) as T
          break
        default:
          result = await fetch(url).then(res => res.text()) as T
      }

      // Cache non-image assets
      if (type !== 'image' && typeof result === 'string') {
        sessionStorage.setItem(cacheKey, JSON.stringify(result))
      }

      setAsset(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [url, type, options])

  useEffect(() => {
    loadAsset()
  }, [loadAsset])

  return { asset, loading, error, reload: loadAsset }
}

// Optimized image loading
async function loadImage(
  src: string, 
  options: AssetOptimizationConfig = {}
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin
    }
    
    if (options.loading) {
      img.loading = options.loading
    }

    // Add srcset for responsive images
    if (options.sizes) {
      img.sizes = options.sizes
    }

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    
    img.src = src
  })
}

// Font loading with Font Loading API
async function loadFont(url: string): Promise<FontFace> {
  const fontName = url.split('/').pop()?.split('.')[0] || 'custom-font'
  
  if ('fonts' in document) {
    const font = new FontFace(fontName, `url(${url})`)
    await font.load()
    document.fonts.add(font)
    return font
  } else {
    // Fallback for older browsers
    return preloadAsset(url, 'font') as any
  }
}

// CSS loading with link injection
async function loadCSS(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`))
    document.head.appendChild(link)
  })
}

// Script loading
async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
    document.head.appendChild(script)
  })
}

// Critical path optimization
export function optimizeCriticalPath() {
  // Preconnect to external domains
  addResourceHints([
    { href: 'https://fonts.googleapis.com', type: 'css', hint: 'preconnect' },
    { href: 'https://fonts.gstatic.com', type: 'font', hint: 'preconnect' },
    { href: 'https://cdn.jsdelivr.net', type: 'js', hint: 'dns-prefetch' }
  ])

  // Preload critical fonts
  preloadAsset('/fonts/inter-var.woff2', 'font', {
    crossOrigin: 'anonymous',
    priority: 'high'
  })

  // Preload hero images if present
  const heroImage = document.querySelector('img[data-hero]')
  if (heroImage) {
    preloadAsset(heroImage.getAttribute('src') || '', 'image', {
      priority: 'high'
    })
  }
}

// Asset compression utilities
export function shouldUseWebP(): boolean {
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

export function shouldUseAVIF(): boolean {
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
}

export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (shouldUseAVIF()) return 'avif'
  if (shouldUseWebP()) return 'webp'
  return 'jpeg'
}

// Lazy loading intersection observer
export function createLazyLoadObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }

  return new IntersectionObserver(callback, defaultOptions)
}

// Service Worker integration for asset caching
export function registerAssetCacheStrategy() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered:', registration)
      
      // Update available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              if (confirm('New content available. Reload to update?')) {
                window.location.reload()
              }
            }
          })
        }
      })
    }).catch(error => {
      console.log('SW registration failed:', error)
    })
  }
}

// Performance monitoring for assets
export function monitorAssetPerformance() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming
        if (resourceEntry.initiatorType === 'img' || resourceEntry.initiatorType === 'image') {
          console.log(`Image ${entry.name} loaded in ${entry.duration.toFixed(2)}ms`)
          
          // Track slow loading images
          if (entry.duration > 2000) {
            console.warn('Slow image detected:', entry.name)
          }
        }
      })
    })

    observer.observe({ entryTypes: ['resource'] })
  }
}

// Asset prefetching based on user behavior
export function setupIntelligentPrefetching() {
  let prefetchTimer: NodeJS.Timeout

  const prefetchOnHover = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const link = target.closest('a[href]') as HTMLAnchorElement
    
    if (link && link.hostname === window.location.hostname) {
      clearTimeout(prefetchTimer)
      prefetchTimer = setTimeout(() => {
        preloadAsset(link.href, 'css', { prefetch: true })
      }, 100)
    }
  }

  const cancelPrefetch = () => {
    clearTimeout(prefetchTimer)
  }

  document.addEventListener('mouseover', prefetchOnHover)
  document.addEventListener('mouseout', cancelPrefetch)

  // Cleanup function
  return () => {
    document.removeEventListener('mouseover', prefetchOnHover)
    document.removeEventListener('mouseout', cancelPrefetch)
    clearTimeout(prefetchTimer)
  }
}

// Initialize all optimizations
export function initializeAssetOptimizations() {
  // Run immediately
  optimizeCriticalPath()
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      monitorAssetPerformance()
      setupIntelligentPrefetching()
      registerAssetCacheStrategy()
    })
  } else {
    monitorAssetPerformance()
    setupIntelligentPrefetching()
    registerAssetCacheStrategy()
  }
}