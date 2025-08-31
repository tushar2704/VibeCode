import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbsProps {
  section: string
  document: string
}

export function Breadcrumbs({ section, document }: BreadcrumbsProps) {
  // Convert section slug to readable title
  const sectionTitle = section
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  // Convert document slug to readable title
  const documentTitle = document
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/docs">Documentation</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/docs/${section}`}>{sectionTitle}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage>{documentTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}