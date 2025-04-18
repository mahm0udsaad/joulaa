"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { useCategory } from "@/contexts/category-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, SlidersHorizontal, X } from "lucide-react"
import type { Product } from "@/contexts/product-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function ShopPage() {
  const { categories } = useCategory()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [sortOption, setSortOption] = useState("featured")
  const [showDiscount, setShowDiscount] = useState(false)
  const [showNewArrivals, setShowNewArrivals] = useState(false)
  const [showBestSellers, setShowBestSellers] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // Get unique brands from products
  const brands = [...new Set(products.map((product) => product.brand))].filter(Boolean).sort()

  // Active categories
  const activeCategories = categories.filter((category) => category.isActive)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)

        // Check if the products table exists
        const { error: tableError } = await supabase.from("products").select("id").limit(1)

        if (tableError) {
          console.error("Error checking products table:", tableError)
          setError("Unable to fetch products. Please try again later.")
          return
        }

        // Fetch all products
        const { data, error } = await supabase.from("products").select("*")

        if (error) {
          console.error("Error fetching products:", error)
          setError("Unable to fetch products. Please try again later.")
          return
        }

        setProducts(data || [])
        setFilteredProducts(data || [])
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Apply filters whenever filter states change
  useEffect(() => {
    let result = [...products]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category_id?.toString() || ""))
    }

    // Apply price range filter
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((product) => product.brand && selectedBrands.includes(product.brand))
    }

    // Apply discount filter
    if (showDiscount) {
      result = result.filter((product) => product.discount > 0)
    }

    // Apply new arrivals filter
    if (showNewArrivals) {
      result = result.filter((product) => product.isNewArrival)
    }

    // Apply best sellers filter
    if (showBestSellers) {
      result = result.filter((product) => product.isBestSeller)
    }

    // Apply sorting
    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortOption === "newest") {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    } else if (sortOption === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [
    products,
    searchQuery,
    selectedCategories,
    priceRange,
    selectedBrands,
    sortOption,
    showDiscount,
    showNewArrivals,
    showBestSellers,
  ])

  // Get current page products
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Handle brand toggle
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 200])
    setSelectedBrands([])
    setSortOption("featured")
    setShowDiscount(false)
    setShowNewArrivals(false)
    setShowBestSellers(false)
  }

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar skeleton */}
          <div className="md:w-1/4 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>

          {/* Products grid skeleton */}
          <div className="md:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="h-60 w-full rounded-lg mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <Button asChild>
          <a href="/">Return to Home</a>
        </Button>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop All Products</h1>

        {/* Mobile filter button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your product search with these filters.</SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {/* Mobile filters - same as desktop but in a sheet */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <Accordion type="multiple" defaultValue={["categories", "price", "brands"]}>
                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {activeCategories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}-mobile`}
                              checked={selectedCategories.includes(category.id.toString())}
                              onCheckedChange={() => toggleCategory(category.id.toString())}
                            />
                            <label
                              htmlFor={`category-${category.id}-mobile`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Slider
                          defaultValue={[0, 200]}
                          max={200}
                          step={1}
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          className="my-6"
                        />
                        <div className="flex items-center justify-between">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="brands">
                    <AccordionTrigger>Brands</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {brands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brand-${brand}-mobile`}
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={() => toggleBrand(brand)}
                            />
                            <label
                              htmlFor={`brand-${brand}-mobile`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="other">
                    <AccordionTrigger>Other Filters</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="discount-mobile"
                            checked={showDiscount}
                            onCheckedChange={(checked) => setShowDiscount(checked === true)}
                          />
                          <label
                            htmlFor="discount-mobile"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            On Sale
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="new-arrivals-mobile"
                            checked={showNewArrivals}
                            onCheckedChange={(checked) => setShowNewArrivals(checked === true)}
                          />
                          <label
                            htmlFor="new-arrivals-mobile"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            New Arrivals
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="best-sellers-mobile"
                            checked={showBestSellers}
                            onCheckedChange={(checked) => setShowBestSellers(checked === true)}
                          />
                          <label
                            htmlFor="best-sellers-mobile"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Best Sellers
                          </label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button onClick={resetFilters} variant="outline" className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop sidebar with filters */}
        <div className="hidden md:block md:w-1/4 space-y-6">
          <div>
            <h3 className="font-medium mb-2">Search</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {activeCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id.toString())}
                    onCheckedChange={() => toggleCategory(category.id.toString())}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Price Range</h3>
            <Slider
              defaultValue={[0, 200]}
              max={200}
              step={1}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="my-6"
            />
            <div className="flex items-center justify-between">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Other Filters</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="discount"
                  checked={showDiscount}
                  onCheckedChange={(checked) => setShowDiscount(checked === true)}
                />
                <label
                  htmlFor="discount"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  On Sale
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-arrivals"
                  checked={showNewArrivals}
                  onCheckedChange={(checked) => setShowNewArrivals(checked === true)}
                />
                <label
                  htmlFor="new-arrivals"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  New Arrivals
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="best-sellers"
                  checked={showBestSellers}
                  onCheckedChange={(checked) => setShowBestSellers(checked === true)}
                />
                <label
                  htmlFor="best-sellers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Best Sellers
                </label>
              </div>
            </div>
          </div>

          <Button onClick={resetFilters} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>

        {/* Products section */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search query.</p>
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
