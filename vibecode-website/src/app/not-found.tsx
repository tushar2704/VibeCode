import Link from "next/link"
import { BookOpen, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            The documentation page you&apos;re looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/docs/getting-started/overview">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Documentation
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/docs/introduction/overview">
                <Search className="mr-2 h-4 w-4" />
                Start with Introduction
              </Link>
            </Button>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please{" "}
              <Link 
                href="https://github.com/tusharaggarwalinseec/VibeCode/issues"
                target="_blank"
                className="text-primary hover:underline"
              >
                report it on GitHub
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}