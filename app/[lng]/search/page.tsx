"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product-card"
import { useSearchParams } from "next/navigation"
import { useProduct } from "@/contexts/product-context"
import { useCategory } from "@/contexts/category-context"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const { products } = useProduct()
  const { categories } = useCategory()

  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRange: [] as string[],
    brands: [] as string[],
  })

  const handleFilter = (type: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter((item) => item !== value) : [...prev[type], value],
    }))
  }

  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      query === "" ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())

    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category)

    const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand)

    const price = product.price * (1 - product.discount)
    const matchesPrice =
      filters.priceRange.length === 0 ||
      filters.priceRange.some((range) => {
        const [min, max] = range.split("-").map(Number)
        return price >= min && price <= max
      })

    return matchesQuery && matchesCategory && matchesBrand && matchesPrice
  })

  // Get unique categories from products
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)))

  // Get unique brands from products
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand)))

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div>
                <h3 className="font-medium mb-4">Categories</h3>
                <div className="space-y-3">
                  {uniqueCategories.map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleFilter("categories", category)}
                      />
                      <Label htmlFor={`category-${category}`} className="ml-2">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="space-y-3">
                  {["0-15", "15-30", "30-50", "50-100"].map((range) => (
                    <div key={range} className="flex items-center">
                      <Checkbox
                        id={`price-${range}`}
                        checked={filters.priceRange.includes(range)}
                        onCheckedChange={() => handleFilter("priceRange", range)}
                      />
                      <Label htmlFor={`price-${range}`} className="ml-2">
                        ${range.replace("-", " - $")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-4">Brands</h3>
                <div className="space-y-3">
                  {uniqueBrands.map((brand) => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={filters.brands.includes(brand)}
                        onCheckedChange={() => handleFilter("brands", brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="ml-2">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{query ? `Search Results for "${query}"` : "All Products"}</h1>
        <p className="text-muted-foreground">{filteredProducts.length} products found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No products found. Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </main>
  )
}
