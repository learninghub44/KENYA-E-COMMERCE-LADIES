"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, PackageOpen, Sparkles } from "lucide-react"

import { Card, CardContent } from "../../../components/ui/card"
import { Skeleton } from "../../../components/ui/skeleton"
import { EmptyState } from "../../../components/shared/empty-state"
import { Breadcrumbs } from "../../../components/shared/breadcrumbs"

interface CategoryNode {
  id: string
  parentId: string | null
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
  children: CategoryNode[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        setIsLoading(true)
        const res = await fetch("/api/catalog/categories")
        if (!res.ok) throw new Error("Failed to load categories")
        const data = await res.json()
        if (!cancelled) setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load categories")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Shop by Category</h1>
        <p className="mt-2 text-muted-foreground">
          Browse fashion, beauty, skincare, wellness, accessories, and lifestyle products from verified Kenyan sellers.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={PackageOpen}
          title="Couldn't load categories"
          description={error}
        />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No categories yet"
          description="Categories will appear here once they're added to the catalog."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link href={`/categories/${category.slug}`} className="group block h-full">
                <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">{category.name}</h2>
                      {category.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      {category.children.length > 0 && (
                        <span className="text-muted-foreground">
                          {category.children.length} subcategor{category.children.length === 1 ? "y" : "ies"}
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Shop now <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
