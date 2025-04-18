"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import type { Product } from "@/contexts/product-context"

export default function TrendingPage() {
  const [sortOption, setSortOption] = useState("popularity")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrendingProducts() {
      try {
        setLoading(true)

        // Check if the products table exists
        const { error: tableError } = await supabase.from("products").select("id").limit(1)

        if (tableError) {
          console.error("Error checking products table:", tableError)
          setError("Unable to fetch products. Please try again later.")
          return
        }

        // Fetch trending products - high rating, featured, or with discount
        let query = supabase.from("products").select("*").or("rating.gte.4,isFeatured.eq.true,discount.gt.0")

        // Apply sorting based on the selected option
        if (sortOption === "popularity") {
          query = query.order("reviews", { ascending: false })
        } else if (sortOption === "rating") {
          query = query.order("rating", { ascending: false })
        } else if (sortOption === "discount") {
          query = query.order("discount", { ascending: false })
        } else if (sortOption === "price-low") {
          query = query.order("price", { ascending: true })
        } else if (sortOption === "price-high") {
          query = query.order("price", { ascending: false })
        }

        const { data, error } = await query.limit(13)

        if (error) {
          console.error("Error fetching trending products:", error)
          setError("Unable to fetch products. Please try again later.")
          return
        }

        setProducts(data || [])
      } catch (err) {
        console.error("Error fetching trending products:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingProducts()
  }, [sortOption])

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40 mt-4 md:mt-0" />
        </div>

        {/* Featured trending product skeleton */}
        <div className="relative rounded-lg overflow-hidden mb-12 bg-gradient-to-r from-pink-100 to-purple-100">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="md:w-1/2 h-64 md:h-auto">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* Trending products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-60 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Trending Now</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </main>
    )
  }

  if (products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Trending Now</h1>
        <p className="text-gray-500 mb-6">No trending products available at the moment. Check back soon!</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trending Now</h1>
          <p className="text-muted-foreground">Discover what's hot and trending in beauty right now</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="discount">Biggest Discount</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured trending product */}
      {products.length > 0 && (
        <div className="relative rounded-lg overflow-hidden mb-12 bg-gradient-to-r from-pink-100 to-purple-100">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
                Trending #1
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{products[0].name}</h2>
              <p className="text-muted-foreground mb-6">{products[0].description}</p>
              <div className="flex items-center gap-4 mb-6">
                {products[0].discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold">
                      ${((products[0].price * (100 - products[0].discount)) / 100).toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">${products[0].price.toFixed(2)}</span>
                    <span className="bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded">
                      {Math.round(products[0].discount)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">${products[0].price.toFixed(2)}</span>
                )}
              </div>
              <Button className="w-full sm:w-auto" asChild>
                <Link href={`/product/${products[0].id}`}>Shop Now</Link>
              </Button>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:hidden" />
              <img
                src={products[0].image_urls?.[0] || "/placeholder.svg"}
                alt={products[0].name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Trending products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(1).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  )
}
