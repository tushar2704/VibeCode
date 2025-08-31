"use client"

import * as React from "react"

interface FocusManagerProps {
  children: React.ReactNode
  trapFocus?: boolean
  autoFocus?: boolean
  restoreFocus?: boolean
}

export function FocusManager({ 
  children, 
  trapFocus = false, 
  autoFocus = false,
  restoreFocus = true 
}: FocusManagerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null)
  
  React.useEffect(() => {
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement
    }
    
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0]
      if (firstFocusable) {
        firstFocusable.focus()
      }
    }
    
    return () => {
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [autoFocus, restoreFocus])
  
  React.useEffect(() => {
    if (!trapFocus) return
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return
      
      const focusableElements = getFocusableElements(containerRef.current)
      if (focusableElements.length === 0) return
      
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [trapFocus])
  
  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')
  
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter(element => {
      const style = window.getComputedStyle(element)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
}

interface SkipLinkProps {
  href: string
  children: React.ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      {children}
    </a>
  )
}

export function useKeyboardNavigation() {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Custom keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault()
            // Search functionality already handled by SearchButton
            break
          case '/':
            event.preventDefault()
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
            }
            break
          case 'b':
            event.preventDefault()
            // Toggle bookmark panel
            const bookmarkButton = document.querySelector('button:has([data-testid="star"]), button:has([data-testid="bookmark"])') as HTMLButtonElement
            if (bookmarkButton) {
              bookmarkButton.click()
            }
            break
        }
      }
      
      // Alt key shortcuts for navigation
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'h':
            event.preventDefault()
            // Go to homepage
            window.location.href = '/'
            break
          case 't':
            event.preventDefault()
            // Toggle theme
            const themeButton = document.querySelector('[aria-label*="theme"], [aria-label*="Toggle"]') as HTMLButtonElement
            if (themeButton) {
              themeButton.click()
            }
            break
          case 'm':
            event.preventDefault()
            // Toggle mobile menu
            const mobileMenuButton = document.querySelector('[aria-label*="menu"]') as HTMLButtonElement
            if (mobileMenuButton) {
              mobileMenuButton.click()
            }
            break
        }
      }
      
      // Arrow key navigation for sidebar links
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const activeElement = document.activeElement
        if (activeElement && activeElement.closest('[role="navigation"]')) {
          event.preventDefault()
          const navLinks = Array.from(document.querySelectorAll('nav a, nav button'))
          const currentIndex = navLinks.indexOf(activeElement as HTMLElement)
          
          if (currentIndex >= 0) {
            const nextIndex = event.key === 'ArrowDown' 
              ? Math.min(currentIndex + 1, navLinks.length - 1)
              : Math.max(currentIndex - 1, 0)
            
            const nextElement = navLinks[nextIndex] as HTMLElement
            if (nextElement) {
              nextElement.focus()
            }
          }
        }
      }
      
      // Global navigation
      switch (event.key) {
        case 'Escape':
          // Close any open modals/dropdowns
          const closeButtons = document.querySelectorAll('[aria-label*="close"], [aria-label*="Close"]')
          if (closeButtons.length > 0) {
            (closeButtons[0] as HTMLElement).click()
          }
          break
        case 'F1':
          event.preventDefault()
          // Show keyboard shortcuts help
          const helpButton = document.querySelector('[aria-label*="shortcuts"], [aria-label*="help"]') as HTMLButtonElement
          if (helpButton) {
            helpButton.click()
          }
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// Utility hook for managing focus announcements
export function useFocusAnnouncements() {
  const announceRef = React.useRef<HTMLDivElement>(null)
  
  const announce = React.useCallback((message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])
  
  const AnnouncementRegion = React.useCallback(() => (
    <div
      ref={announceRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  ), [])
  
  return { announce, AnnouncementRegion }
}

// Focus indicator enhancement
export function useFocusVisible() {
  React.useEffect(() => {
    // Add focus-visible polyfill behavior
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        document.body.classList.add('using-keyboard')
      }
    }
    
    const handleMouseDown = () => {
      document.body.classList.remove('using-keyboard')
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
}

// Roving tabindex for complex components
export function useRovingTabindex(containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const items = getFocusableElements(container)
    
    // Set initial tabindex
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1')
    })
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        return
      }
      
      event.preventDefault()
      const currentIndex = items.indexOf(event.target as HTMLElement)
      let nextIndex: number
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          break
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = items.length - 1
          break
        default:
          return
      }
      
      // Update tabindex and focus
      items.forEach((item, index) => {
        item.setAttribute('tabindex', index === nextIndex ? '0' : '-1')
      })
      
      items[nextIndex].focus()
    }
    
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [])
}