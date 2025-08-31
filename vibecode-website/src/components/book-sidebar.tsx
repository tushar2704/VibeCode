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
    href: "/getting-started",
    icon: BookOpen
  },
  {
    title: "Foundation & Methodology",
    items: [
      {
        title: "Introduction & Philosophy",
        href: "/introduction"
      },
      {
        title: "Context Engineering Fundamentals", 
        href: "/context-engineering"
      },
      {
        title: "AI-Assisted Development Workflow",
        href: "/ai-workflow"
      }
    ]
  },
  {
    title: "Platform-Specific Strategies",
    items: [
      {
        title: "Web Development Excellence",
        href: "/web-development",
        items: [
          { title: "Frontend Development", href: "/web-development/frontend" },
          { title: "Backend Development", href: "/web-development/backend" },
          { title: "Full-Stack Integration", href: "/web-development/fullstack" }
        ]
      },
      {
        title: "Mobile Development Mastery", 
        href: "/mobile-development",
        items: [
          { title: "Cross-Platform Development", href: "/mobile-development/cross-platform" },
          { title: "Native Development", href: "/mobile-development/native" }
        ]
      },
      {
        title: "Desktop Application Development",
        href: "/desktop-development",
        items: [
          { title: "Cross-Platform Desktop", href: "/desktop-development/cross-platform" },
          { title: "Native Desktop Development", href: "/desktop-development/native" }
        ]
      },
      {
        title: "Cloud & DevOps Excellence",
        href: "/cloud-devops",
        items: [
          { title: "Cloud Platforms", href: "/cloud-devops/platforms" },
          { title: "Containerization & Orchestration", href: "/cloud-devops/containers" },
          { title: "CI/CD & Infrastructure", href: "/cloud-devops/cicd" }
        ]
      },
      {
        title: "Specialized Development Domains",
        href: "/specialized",
        items: [
          { title: "Game Development", href: "/specialized/game-development" },
          { title: "Data Science & AI", href: "/specialized/data-science-ai" },
          { title: "Blockchain & Web3", href: "/specialized/blockchain-web3" },
          { title: "IoT & Embedded Systems", href: "/specialized/iot-embedded" }
        ]
      }
    ]
  },
  {
    title: "Cross-Cutting Excellence",
    items: [
      {
        title: "Testing & Quality Assurance",
        href: "/testing-qa"
      },
      {
        title: "Performance Optimization",
        href: "/performance"
      },
      {
        title: "Security Best Practices",
        href: "/security"
      },
      {
        title: "Architecture & Design Patterns",
        href: "/architecture"
      }
    ]
  },
  {
    title: "Development Workflow",
    items: [
      {
        title: "Version Control & Collaboration",
        href: "/version-control"
      },
      {
        title: "Tools & Environment Setup",
        href: "/tools-environment"
      },
      {
        title: "Debugging & Troubleshooting",
        href: "/debugging"
      }
    ]
  },
  {
    title: "Advanced Topics",
    items: [
      {
        title: "Modern Development Paradigms",
        href: "/advanced-topics"
      },
      {
        title: "Career Development",
        href: "/career"
      },
      {
        title: "Community & Resources",
        href: "/community"
      }
    ]
  }
]

interface BookSidebarProps {
  className?: string
}

export function BookSidebar({ className }: BookSidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)] px-1">
              <div className="space-y-2">
                {sidebarData.map((item, index) => (
                  <SidebarItem key={index} item={item} />
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
}

function SidebarItem({ item, level = 0 }: SidebarItemProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(() => {
    if (item.items) {
      return item.items.some(subItem => 
        pathname === subItem.href || 
        (subItem.items && subItem.items.some(subSubItem => pathname === subSubItem.href))
      )
    }
    return false
  })

  const isActive = pathname === item.href
  const hasActiveChild = item.items?.some(subItem => 
    pathname === subItem.href || 
    (subItem.items && subItem.items.some(subSubItem => pathname === subSubItem.href))
  )

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
            <SidebarItem key={index} item={subItem} level={level + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}