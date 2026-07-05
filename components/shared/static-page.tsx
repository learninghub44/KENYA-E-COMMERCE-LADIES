import type { ReactNode } from "react"

interface StaticPageProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function StaticPage({ title, subtitle, children }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="mb-8 text-sm text-muted-foreground">{subtitle}</p>
      )}
      <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
