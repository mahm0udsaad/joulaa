"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProductCard from "@/components/product-card"
import type { Product } from "@/contexts/product-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null)
  const [secondProduct, setSecondProduct] = useState<Product | null>(null)

  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setLoading(true)

        // Check if the products table exists
        const { error: tableError } = await supabase.from("products").select("id").limit(1)

        if (tableError) {
          console.error("Error checking products table:", tableError)
          setError("Unable to fetch products. Please try again later.")
          return
        }

        // Fetch new arrivals - products with isNewArrival flag or most recently added
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .or("isNewArrival.eq.true")
          .order("createdAt", { ascending: false })
          .limit(9)

        if (error) {
          console.error("Error fetching new arrivals:", error)
          setError("Unable to fetch products. Please try again later.")
          return
        }

        setProducts(data || [])

        // Fetch hero section products
        const featured = data?.find((product) => product.newArrivalHeroSection === true) || null
        const second =
          data?.find((product) => product.newArrivalHeroSection === true && product.id !== featured?.id) || null

        setFeaturedProduct(featured)
        setSecondProduct(second)
      } catch (err) {
        console.error("Error fetching new arrivals:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchNewArrivals()
  }, [])

  if (loading) {
    return (
      <main>
        {/* Hero Section Skeleton */}
        <section className="relative bg-accent min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-4 w-1/2 max-w-md" />
                <Skeleton className="h-10 w-40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-80 w-full rounded-lg" />
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid Skeleton */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton className="h-60 w-full rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">New Arrivals</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </main>
    )
  }

  if (products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">New Arrivals</h1>
        <p className="text-gray-500 mb-6">No new products available at the moment. Check back soon!</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </main>
    )
  }

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-accent min-h-[60vh] flex items-center">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                New Season,
                <br />
                <span className="text-primary">New Beauty</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Discover our latest arrivals of premium cosmetics, designed to enhance your natural beauty and elevate
                your makeup routine.
              </p>
              <div className="flex items-center text-primary font-medium">
                <span>Explore the collection</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {featuredProduct && (
                <div className="relative h-80 rounded-lg overflow-hidden transform translate-y-8">
                  <Image
                    src={featuredProduct.image_urls?.[0] || "/placeholder.svg"}
                    alt={featuredProduct.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-medium">{featuredProduct.name}</p>
                    <p className="text-sm opacity-90">{featuredProduct.brand}</p>
                  </div>
                </div>
              )}
              {secondProduct && (
                <div className="relative h-80 rounded-lg overflow-hidden transform -translate-y-8">
                  <Image
                    src={secondProduct.image_urls?.[0] || "/placeholder.svg"}
                    alt={secondProduct.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-medium">{secondProduct.name}</p>
                    <p className="text-sm opacity-90">{secondProduct.brand}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Latest Additions</h2>
          <p className="text-muted-foreground">Be the first to try our newest beauty innovations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  )
}
