"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Github, Linkedin, Twitter, Heart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  foundation: [
    { title: "Getting Started", href: "/docs/getting-started/overview" },
    { title: "Introduction", href: "/docs/introduction/overview" },
    { title: "Context Engineering", href: "/docs/context-engineering/overview" },
    { title: "AI Workflow", href: "/docs/ai-workflow/overview" }
  ],
  platforms: [
    { title: "Web Development", href: "/docs/web-development/overview" },
    { title: "Mobile Development", href: "/docs/mobile-development/overview" },
    { title: "Desktop Development", href: "/docs/desktop-development/overview" },
    { title: "Cloud & DevOps", href: "/docs/cloud-devops/overview" }
  ],
  resources: [
    { title: "Examples", href: "/docs/examples/overview" },
    { title: "Tutorials", href: "/docs/tutorials/overview" },
    { title: "Community", href: "/docs/community/overview" },
    { title: "Contributing", href: "/docs/contributing/overview" }
  ]
}

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/tusharaggarwalinseec/VibeCode",
    icon: Github
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/tusharaggarwalinseec/",
    icon: Linkedin
  },
  {
    name: "Twitter",
    href: "https://twitter.com/tushar_inseec",
    icon: Twitter
  }
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-lg">VibeCode</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              The ultimate cross-platform development guide with Context Engineering methodology. 
              Master AI-assisted development across all platforms.
            </p>
            <div className="flex items-center space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Foundation Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Foundation</h3>
            <ul className="space-y-2">
              {footerLinks.foundation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Platforms</h3>
            <ul className="space-y-2">
              {footerLinks.platforms.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} VibeCode. All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Created with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by</span>
            <Link
              href="https://www.linkedin.com/in/tusharaggarwalinseec/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline flex items-center space-x-1"
            >
              <span>Tushar Aggarwal</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components.
              Deployed on Vercel for optimal performance and reliability.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}