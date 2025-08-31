import NextLink from "next/link"
import { ArrowRight, BookOpen, Zap, Globe, Code, Github, Linkedin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookLayout } from "@/components/book-layout"

export default function Home() {
  return (
    <BookLayout>
      <div className="mx-auto max-w-6xl">
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                VibeCode
              </h1>
            </div>
            <span className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              The Ultimate Cross-Platform Development Guide with Context Engineering
            </span>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Master AI-assisted development across all platforms with systematic methodology 
              that combines intuitive flow with production-ready results.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <NextLink href="/docs/getting-started/overview">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </NextLink>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <NextLink href="/docs/01-introduction/overview">
                  Learn More
                </NextLink>
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Created by</span>
              <NextLink 
                href="https://www.linkedin.com/in/tusharaggarwalinseec/" 
                target="_blank"
                className="flex items-center space-x-2 hover:text-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="font-medium">Tushar Aggarwal</span>
              </NextLink>
              <Badge variant="secondary">AI Global Community Leader</Badge>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Core Principles
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              VibeCode combines five foundational principles to create a systematic approach to AI-assisted development.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-xl">Flow State Development</CardTitle>
                </div>
                <CardDescription>
                  Achieve deep concentration and optimal productivity by minimizing distractions and cognitive load.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-xl">Context Engineering</CardTitle>
                </div>
                <CardDescription>
                  Three-layer context framework ensuring every decision is grounded in relevant, structured information.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-xl">Platform-Native Mastery</CardTitle>
                </div>
                <CardDescription>
                  Deep expertise in each platform&apos;s unique characteristics, patterns, and optimization techniques.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Context Engineering Framework
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              A systematic three-layer approach to AI-assisted development that ensures consistent, production-ready results.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[64rem] md:grid-cols-3">
            <Card className="relative overflow-hidden border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="text-xl">System Context</CardTitle>
                <CardDescription>
                  Define AI assistant role, expertise level, behavioral guidelines, and quality standards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI Role Definition</li>
                  <li>• Expertise & Experience Level</li>
                  <li>• Behavioral Guidelines</li>
                  <li>• Code Quality Standards</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="text-xl">Domain Context</CardTitle>
                <CardDescription>
                  Specify technology stack, architecture patterns, industry standards, and platform constraints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Technology Stack</li>
                  <li>• Architecture Patterns</li>
                  <li>• Industry Standards</li>
                  <li>• Platform Constraints</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="text-xl">Task Context</CardTitle>
                <CardDescription>
                  Document application overview, functional requirements, and technical specifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Application Overview</li>
                  <li>• Functional Requirements</li>
                  <li>• Technical Specifications</li>
                  <li>• Integration Points</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Coverage Section */}
        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Platform Coverage
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Comprehensive strategies and best practices across all development platforms and domains.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
            <NextLink href="/docs/04-web-development/overview" className="group">
              <Card className="transition-all hover:shadow-md group-hover:border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Web Development</CardTitle>
                  <CardDescription>
                    Frontend, Backend, Full-Stack
                  </CardDescription>
                </CardHeader>
              </Card>
            </NextLink>
            <NextLink href="/docs/05-mobile-development/overview" className="group">
              <Card className="transition-all hover:shadow-md group-hover:border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Mobile Development</CardTitle>
                  <CardDescription>
                    Cross-Platform & Native
                  </CardDescription>
                </CardHeader>
              </Card>
            </NextLink>
            <NextLink href="/docs/06-desktop-development/overview" className="group">
              <Card className="transition-all hover:shadow-md group-hover:border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Desktop Apps</CardTitle>
                  <CardDescription>
                    Cross-Platform Desktop
                  </CardDescription>
                </CardHeader>
              </Card>
            </NextLink>
            <NextLink href="/docs/07-cloud-devops/overview" className="group">
              <Card className="transition-all hover:shadow-md group-hover:border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Cloud & DevOps</CardTitle>
                  <CardDescription>
                    AWS, Azure, GCP, K8s
                  </CardDescription>
                </CardHeader>
              </Card>
            </NextLink>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Start Your Journey
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of developers mastering cross-platform development with VibeCode methodology.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <NextLink href="/docs/getting-started/overview">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </NextLink>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <NextLink href="https://github.com/tusharaggarwalinseec/VibeCode" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </NextLink>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </BookLayout>
  )
}