"use client"

import { useEffect, useState } from "react"
import { useCategory } from "@/contexts/category-context"
import { useProduct } from "@/contexts/product-context"
import ProductCard from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { categories, isLoading: categoriesLoading } = useCategory()
  const { products, isLoading: productsLoading } = useProduct()
  const [category, setCategory] = useState<any>(null)
  const [categoryProducts, setCategoryProducts] = useState<any[]>([])

  useEffect(() => {
    if (!categoriesLoading && !productsLoading) {
      // Find the category by slug
      const foundCategory = categories.find((c) => c.slug === params.slug)

      if (foundCategory) {
        setCategory(foundCategory)

        // Filter products by category name
        const filteredProducts = products.filter(
          (product) => product.category.toLowerCase() === foundCategory.name.toLowerCase(),
        )
        setCategoryProducts(filteredProducts)
      }
    }
  }, [params.slug, categories, products, categoriesLoading, productsLoading])

  // Show loading state
  if (categoriesLoading || productsLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  // If category not found, show a message instead of using notFound()
  if (!category) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground">The category you're looking for doesn't exist or has been removed.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-muted-foreground">
          {category.description || `Discover our collection of premium ${category.name.toLowerCase()} products`}
        </p>
      </div>

      {categoryProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
