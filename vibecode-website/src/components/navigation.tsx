"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, BookOpen, Github, Linkedin, Monitor } from "lucide-react"
import { SearchButton } from "@/components/search"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const mainNavItems = [
  {
    title: "Getting Started",
    href: "/getting-started",
    description: "Quick start guide to VibeCode methodology"
  },
  {
    title: "Introduction",
    href: "/introduction",
    description: "Core principles and philosophy"
  },
  {
    title: "Context Engineering",
    href: "/context-engineering",
    description: "Three-layer context framework"
  },
  {
    title: "AI Workflow",
    href: "/ai-workflow",
    description: "AI-assisted development process"
  }
]

const platformItems = [
  {
    title: "Web Development",
    href: "/web-development",
    description: "Frontend, backend, and full-stack strategies"
  },
  {
    title: "Mobile Development",
    href: "/mobile-development", 
    description: "Cross-platform and native mobile apps"
  },
  {
    title: "Desktop Development",
    href: "/desktop-development",
    description: "Cross-platform desktop applications"
  },
  {
    title: "Cloud & DevOps",
    href: "/cloud-devops",
    description: "Cloud platforms and infrastructure"
  }
]

export function Navigation() {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              VibeCode
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Foundation</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <BookOpen className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            VibeCode
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Cross-platform development guide with Context Engineering methodology.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {mainNavItems.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Platforms</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {platformItems.map((item) => (
                      <ListItem
                        key={item.title}
                        title={item.title}
                        href={item.href}
                      >
                        {item.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link href="/examples">
                    Examples
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <BookOpen className="h-5 w-5" />
              <span className="font-bold">VibeCode</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-1">
            <div className="hidden md:block">
              <SearchButton />
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://github.com/tusharaggarwalinseec/VibeCode" target="_blank">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://www.linkedin.com/in/tusharaggarwalinseec/" target="_blank">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Toggle theme menu"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                  {theme === "light" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                  {theme === "dark" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                  {theme === "system" && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}

function MobileNav() {
  return (
    <div className="flex flex-col space-y-3">
      <Link href="/" className="flex items-center space-x-2">
        <BookOpen className="h-5 w-5" />
        <span className="font-bold">VibeCode</span>
      </Link>
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col space-y-3 pt-6">
          <h4 className="font-medium">Foundation</h4>
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground"
            >
              {item.title}
            </Link>
          ))}
        </div>
        <div className="flex flex-col space-y-3 pt-6">
          <h4 className="font-medium">Platforms</h4>
          {platformItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"