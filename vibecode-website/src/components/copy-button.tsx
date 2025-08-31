"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
        className
      )}
      onClick={copyToClipboard}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  "data-language"?: string
}

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [codeText, setCodeText] = React.useState("")
  const codeRef = React.useRef<HTMLPreElement>(null)

  React.useEffect(() => {
    if (codeRef.current) {
      setCodeText(codeRef.current.textContent || "")
    }
  }, [children])

  return (
    <div className="group relative">
      <pre
        ref={codeRef}
        className={cn(
          "relative overflow-x-auto rounded-lg border bg-muted p-4",
          className
        )}
        {...props}
      >
        {children}
      </pre>
      <CopyButton text={codeText} />
    </div>
  )
}