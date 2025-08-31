"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, BookOpen, FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export interface SidebarItem {
  title: string
  href?: string
  items?: SidebarItem[]
  icon?: React.ComponentType<{ className?: string }>
}

export const sidebarData: SidebarItem[] = [
  {
    title: "Getting Started",
    href: "/docs/getting-started/overview",
    icon: BookOpen
  },
  {
    title: "Foundation & Methodology",
    items: [
      {
        title: "Introduction & Philosophy",
        href: "/docs/introduction/overview"
      },
      {
        title: "Context Engineering Fundamentals", 
        href: "/docs/context-engineering/overview"
      },
      {
        title: "AI-Assisted Development Workflow",
        href: "/docs/ai-workflow/overview"
      }
    ]
  },
  {
    title: "Platform-Specific Strategies",
    items: [
      {
        title: "Web Development Excellence",
        href: "/docs/web-development/overview",
        items: [
          { title: "Frontend Development", href: "/docs/web-development/frontend" },
          { title: "Backend Development", href: "/docs/web-development/backend" },
          { title: "Full-Stack Integration", href: "/docs/web-development/fullstack" }
        ]
      },
      {
        title: "Mobile Development Mastery", 
        href: "/docs/mobile-development/overview",
        items: [
          { title: "Cross-Platform Development", href: "/docs/mobile-development/cross-platform" },
          { title: "Native Development", href: "/docs/mobile-development/native" }
        ]
      },
      {
        title: "Desktop Application Development",
        href: "/docs/desktop-development/overview",
        items: [
          { title: "Cross-Platform Desktop", href: "/docs/desktop-development/cross-platform" },
          { title: "Native Desktop Development", href: "/docs/desktop-development/native" }
        ]
      },
      {
        title: "Cloud & DevOps Excellence",
        href: "/docs/cloud-devops/overview",
        items: [
          { title: "Cloud Platforms", href: "/docs/cloud-devops/platforms" },
          { title: "Containerization & Orchestration", href: "/docs/cloud-devops/containers" },
          { title: "CI/CD & Infrastructure", href: "/docs/cloud-devops/cicd" }
        ]
      },
      {
        title: "Specialized Development Domains",
        href: "/docs/specialized/overview",
        items: [
          { title: "Game Development", href: "/docs/specialized/game-development" },
          { title: "Data Science & AI", href: "/docs/specialized/data-science-ai" },
          { title: "Blockchain & Web3", href: "/docs/specialized/blockchain-web3" },
          { title: "IoT & Embedded Systems", href: "/docs/specialized/iot-embedded" }
        ]
      }
    ]
  },
  {
    title: "Cross-Cutting Excellence",
    items: [
      {
        title: "Testing & Quality Assurance",
        href: "/docs/testing-qa/overview"
      },
      {
        title: "Performance Optimization",
        href: "/docs/performance/overview"
      },
      {
        title: "Security Best Practices",
        href: "/docs/security/overview"
      },
      {
        title: "Architecture & Design Patterns",
        href: "/docs/architecture/overview"
      }
    ]
  },
  {
    title: "Development Workflow",
    items: [
      {
        title: "Version Control & Collaboration",
        href: "/docs/version-control/overview"
      },
      {
        title: "Tools & Environment Setup",
        href: "/docs/tools-environment/overview"
      },
      {
        title: "Debugging & Troubleshooting",
        href: "/docs/debugging/overview"
      }
    ]
  },
  {
    title: "Advanced Topics",
    items: [
      {
        title: "Modern Development Paradigms",
        href: "/docs/advanced-topics/overview"
      },
      {
        title: "Career Development",
        href: "/docs/career/overview"
      },
      {
        title: "Community & Resources",
        href: "/docs/community/overview"
      }
    ]
  }
]

interface BookSidebarProps {
  className?: string
  currentSection?: string
  currentDocument?: string
}

export function BookSidebar({ className, currentSection, currentDocument }: BookSidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)] px-1">
              <div className="space-y-2">
                {sidebarData.map((item, index) => (
                  <SidebarItem 
                    key={index} 
                    item={item} 
                    currentSection={currentSection}
                    currentDocument={currentDocument}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  item: SidebarItem
  level?: number
  currentSection?: string
  currentDocument?: string
}

function SidebarItem({ item, level = 0, currentSection, currentDocument }: SidebarItemProps) {
  const pathname = usePathname()
  
  // Check if this item or any of its children are active
  const isDirectlyActive = pathname === item.href ||
    (currentSection && currentDocument && item.href === `/docs/${currentSection}/${currentDocument}`) ||
    (currentSection && item.href === `/docs/${currentSection}`)
  
  const hasActiveChild = React.useMemo(() => {
    if (!item.items) return false
    
    const checkActive = (items: SidebarItem[]): boolean => {
      return items.some(subItem => {
        const subIsActive = pathname === subItem.href ||
          (currentSection && currentDocument && subItem.href === `/docs/${currentSection}/${currentDocument}`) ||
          (currentSection && subItem.href === `/docs/${currentSection}`)
        
        if (subIsActive) return true
        if (subItem.items) return checkActive(subItem.items)
        return false
      })
    }
    
    return checkActive(item.items)
  }, [item.items, pathname, currentSection, currentDocument])
  
  const isActive = isDirectlyActive
  const shouldExpand = isActive || hasActiveChild
  
  const [isOpen, setIsOpen] = React.useState(() => shouldExpand)
  
  // Update expansion state when navigation changes
  React.useEffect(() => {
    setIsOpen(shouldExpand)
  }, [shouldExpand])

  if (!item.items) {
    return (
      <div className={cn("space-y-1", level > 0 && "ml-4")}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start font-normal",
            isActive && "bg-muted font-medium"
          )}
          asChild
        >
          <Link href={item.href || "#"}>
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {!item.icon && level > 0 && <FileText className="mr-2 h-4 w-4" />}
            {item.title}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", level > 0 && "ml-4")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={hasActiveChild ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-between font-normal",
              hasActiveChild && "bg-muted font-medium"
            )}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.title}
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1">
          {item.items.map((subItem, index) => (
            <SidebarItem 
              key={index} 
              item={subItem} 
              level={level + 1} 
              currentSection={currentSection}
              currentDocument={currentDocument}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}