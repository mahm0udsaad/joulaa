"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCategory } from "@/contexts/category-context"
import Image from "next/image"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { categories } = useCategory()
  const searchRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  const handleCategoryClick = (slug: string) => {
    router.push(`/categories/${slug}`)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter only active categories with images
  const activeCategories = categories.filter((category) => category.isActive && category.image_url).slice(0, 4)

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full pr-10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.length > 0) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-background shadow-md">
          {query.length > 0 ? (
            <div className="p-4">
              <h3 className="mb-2 text-sm font-medium">Search for: {query}</h3>
              <Button variant="default" className="w-full" onClick={handleSearch}>
                Search products
              </Button>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="mb-2 text-sm font-medium">Popular Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {activeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="group cursor-pointer rounded-md border p-2 hover:bg-accent"
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <div className="relative mb-2 h-20 w-full overflow-hidden rounded-md">
                      <Image
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <p className="text-center text-sm font-medium">{category.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
