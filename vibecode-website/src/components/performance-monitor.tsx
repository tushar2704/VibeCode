"use client"

import * as React from "react"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  networkRequests: number
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)
  
  React.useEffect(() => {
    // Measure page load performance
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const resources = performance.getEntriesByType('resource')
        
        const loadTime = navigation.loadEventEnd - navigation.startTime
        const renderTime = navigation.domContentLoadedEventEnd - navigation.startTime
        const networkRequests = resources.length
        
        // Memory usage (if available)
        const memoryUsage = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
        
        setMetrics({
          loadTime,
          renderTime,
          memoryUsage,
          networkRequests
        })
        
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.group('🔍 Performance Metrics')
          console.log('Load Time:', `${loadTime.toFixed(2)}ms`)
          console.log('Render Time:', `${renderTime.toFixed(2)}ms`)
          console.log('Network Requests:', networkRequests)
          if (memoryUsage) {
            console.log('Memory Usage:', `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`)
          }
          console.groupEnd()
        }
      }
    }
    
    // Measure after page is fully loaded
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
      return () => window.removeEventListener('load', measurePerformance)
    }
  }, [])
  
  return metrics
}

export function PerformanceDebugger() {
  const metrics = usePerformanceMonitoring()
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-3 rounded-lg text-xs font-mono">
      <div className="font-bold mb-2">Performance Metrics</div>
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
      <div>Requests: {metrics.networkRequests}</div>
      {metrics.memoryUsage && (
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      )}
    </div>
  )
}

// Core Web Vitals monitoring
export function useCoreWebVitals() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Import web-vitals dynamically
    // Core Web Vitals monitoring would require web-vitals package
    // For now, we'll use basic performance metrics
    try {
      const logMetric = (metric: { name: string; value: number; rating: string }) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎯 ${metric.name}:`, metric.value, metric.rating)
        }
        
        // In production, you would send this to your analytics service
        // Example: analytics.track('Core Web Vital', metric)
      }
      
      // Web Vitals implementation placeholder
      console.log('Performance monitoring initialized')
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error)
    }
  }, [])
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class PerformanceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error with performance context
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const memoryUsage = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
      
      console.error('Performance Error Context:', {
        error: error.message,
        stack: error.stack,
        loadTime: navigation.loadEventEnd - navigation.startTime,
        memoryUsage: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'Unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              A performance-related error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    
    return this.props.children
  }
}