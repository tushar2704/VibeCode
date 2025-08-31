"use client"

import * as React from "react"
import Link from "next/link"
import { CodeBlock } from "./copy-button"

// Custom components for MDX
const mdxComponents = {
  // Enhanced code blocks with copy functionality
  pre: ({ children, className, ...props }: React.ComponentProps<"pre">) => (
    <CodeBlock className={className} {...props}>
      {children}
    </CodeBlock>
  ),
  
  // Custom heading components with anchor links
  h1: ({ children, id, ...props }: React.ComponentProps<"h1">) => (
    <h1 id={id} className="scroll-mt-20" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, id, ...props }: React.ComponentProps<"h2">) => (
    <h2 id={id} className="scroll-mt-20" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }: React.ComponentProps<"h3">) => (
    <h3 id={id} className="scroll-mt-20" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, id, ...props }: React.ComponentProps<"h4">) => (
    <h4 id={id} className="scroll-mt-20" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, id, ...props }: React.ComponentProps<"h5">) => (
    <h5 id={id} className="scroll-mt-20" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, id, ...props }: React.ComponentProps<"h6">) => (
    <h6 id={id} className="scroll-mt-20" {...props}>
      {children}
    </h6>
  ),
  
  // Enhanced links
  a: ({ href, children, ...props }: React.ComponentProps<"a">) => {
    if (href?.startsWith("http")) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline underline-offset-4"
          {...props}
        >
          {children}
        </a>
      )
    }
    return (
      <Link 
        href={href || "#"}
        className="text-primary hover:text-primary/80 underline underline-offset-4"
        {...props}
      >
        {children}
      </Link>
    )
  },
  
  // Enhanced blockquotes
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l-4 border-primary bg-muted/50 p-4 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  
  // Enhanced tables
  table: ({ children, ...props }: React.ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse border border-border"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  
  th: ({ children, ...props }: React.ComponentProps<"th">) => (
    <th
      className="border border-border bg-muted px-4 py-2 text-left font-semibold"
      {...props}
    >
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: React.ComponentProps<"td">) => (
    <td className="border border-border px-4 py-2" {...props}>
      {children}
    </td>
  ),
  
  // Enhanced inline code
  code: ({ children, className, ...props }: React.ComponentProps<"code">) => {
    // If it's inside a pre tag, don't style it (handled by CodeBlock)
    if (className?.includes("hljs")) {
      return <code className={className} {...props}>{children}</code>
    }
    
    return (
      <code
        className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    )
  },
}

interface MDXComponentsProviderProps {
  children: React.ReactNode
}

export function MDXComponentsProvider({ children }: MDXComponentsProviderProps) {
  return <>{children}</>
}

export { mdxComponents }