"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Keyboard, HelpCircle } from "lucide-react"

interface KeyboardShortcut {
  keys: string[]
  description: string
  context?: string
}

const keyboardShortcuts: KeyboardShortcut[] = [
  {
    keys: ["Ctrl", "K"],
    description: "Open search dialog",
    context: "Global"
  },
  {
    keys: ["Esc"],
    description: "Close dialog or modal",
    context: "Global"
  },
  {
    keys: ["Tab"],
    description: "Navigate to next focusable element",
    context: "Global"
  },
  {
    keys: ["Shift", "Tab"],
    description: "Navigate to previous focusable element",
    context: "Global"
  },
  {
    keys: ["↑", "↓"],
    description: "Navigate search results",
    context: "Search"
  },
  {
    keys: ["Enter"],
    description: "Select search result or activate button",
    context: "Search / Navigation"
  },
  {
    keys: ["Space"],
    description: "Scroll page down or activate button",
    context: "Reading"
  },
  {
    keys: ["Shift", "Space"],
    description: "Scroll page up",
    context: "Reading"
  },
  {
    keys: ["Home"],
    description: "Go to top of page",
    context: "Reading"
  },
  {
    keys: ["End"],
    description: "Go to bottom of page",
    context: "Reading"
  }
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = React.useState(false)
  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  if (!open) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background border"
        onClick={() => setOpen(true)}
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </Button>
    )
  }
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background border"
        onClick={() => setOpen(true)}
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </Button>
      
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
        <div 
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-background rounded-lg shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <h2 className="flex items-center space-x-2 text-lg font-semibold">
              <Keyboard className="h-5 w-5" />
              <span>Keyboard Shortcuts</span>
            </h2>
          </div>
          
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            <p className="text-sm text-muted-foreground">
              Use these keyboard shortcuts to navigate and interact with the documentation more efficiently.
            </p>
            
            <div className="grid gap-4">
              {keyboardShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="font-medium">{shortcut.description}</div>
                    {shortcut.context && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {shortcut.context}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        <Badge variant="outline" className="font-mono text-xs px-2 py-1">
                          {key}
                        </Badge>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Accessibility Features:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• All interactive elements are keyboard accessible</li>
                    <li>• Screen reader friendly with ARIA labels</li>
                    <li>• High contrast colors for better visibility</li>
                    <li>• Focus indicators for keyboard navigation</li>
                    <li>• Skip links for screen reader users</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Press <Badge variant="outline" className="font-mono text-xs">?</Badge> anytime to show this dialog
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}