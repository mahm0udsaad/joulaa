"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  featured?: boolean
  order?: number
}

export default function HeaderCategoriesDropdown() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })

        if (error) {
          console.error("Error fetching categories:", error)
          return
        }

        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium">
        Categories <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-2 py-1.5">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </>
        ) : categories.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-gray-500">
            <p>No categories available</p>
          </div>
        ) : (
          categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild>
              <Link href={`/category/${category.slug}`} className="flex items-center gap-3">
                {category.image_url && (
                  <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <span>{category.name}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
