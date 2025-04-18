"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
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

export default function CategoriesSidebar() {
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
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Categories</h3>
      </div>
      <div className="p-2">
        {loading ? (
          <>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="py-2 px-3">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </>
        ) : categories.length === 0 ? (
          <div className="py-4 px-3 text-center text-gray-500">
            <p>No categories available</p>
          </div>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
