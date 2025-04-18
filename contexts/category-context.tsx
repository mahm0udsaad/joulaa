"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

// Define the Category type
export interface Category {
  id: string
  name: string
  image: string
  count: number
  description?: string
  slug: string
  parentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Define the context state
interface CategoryContextState {
  categories: Category[]
  isLoading: boolean
  error: string | null
  tableExists: boolean
}

// Define the context type
interface CategoryContextType extends CategoryContextState {
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getCategoryById: (id: string) => Category | undefined
  refreshCategories: () => Promise<void>
}

// Create the context
const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

// Sample initial data
const initialCategories: Category[] = [
  {
    id: "1",
    name: "Lips",
    image: "https://tse2.mm.bing.net/th?id=OIP.g9fYq7pRmvWyYSUvooSOhQHaJz&pid=Api",
    count: 24,
    slug: "lips",
    description: "Lipsticks, lip glosses, and lip care products",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Face",
    image: "https://tse4.mm.bing.net/th?id=OIP.3E-9GZLnPi5EhM7ceYd2mQHaHa&pid=Api",
    count: 36,
    slug: "face",
    description: "Foundations, concealers, and face powders",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Eyes",
    image: "https://tse2.mm.bing.net/th?id=OIP.1Wc5ZRRUeppp4Tcgu9CGZwHaHa&pid=Api",
    count: 18,
    slug: "eyes",
    description: "Eyeshadows, eyeliners, and mascaras",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Create the provider component
export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CategoryContextState>({
    categories: [],
    isLoading: true,
    error: null,
    tableExists: true,
  })

  // Function to load categories from Supabase
  const loadCategories = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Fetch categories from Supabase
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        // Check if the error is because the table doesn't exist
        if (
          error.message.includes('relation "categories" does not exist') ||
          error.message.includes('relation "public.categories" does not exist')
        ) {
          console.log("Categories table does not exist yet. This is expected on first run.")
          setState({
            categories: [],
            isLoading: false,
            error: null,
            tableExists: false,
          })
          return
        }

        // Check if the error is because of RLS
        if (error.message.includes("row-level security")) {
          console.log("Row Level Security is preventing access to the categories table.")
          setState({
            categories: [],
            isLoading: false,
            error: "Row Level Security is preventing access to the categories table.",
            tableExists: true,
          })
          return
        }

        throw error
      }

      setState({
        categories: data || [],
        isLoading: false,
        error: null,
        tableExists: true,
      })
    } catch (error) {
      console.error("Failed to load categories:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load categories",
        tableExists: true,
      }))
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  // Function to refresh categories
  const refreshCategories = async () => {
    await loadCategories()
  }

  // Load data from Supabase on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Add a new category
  const addCategory = async (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if table exists first
      if (!state.tableExists) {
        toast({
          title: "Database Error",
          description: "Categories table does not exist. Please create it in the Supabase dashboard.",
          variant: "destructive",
        })
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const timestamp = new Date().toISOString()
      const newCategory = {
        ...category,
        id: Date.now().toString(),
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      // Insert into Supabase
      const { data, error } = await supabase.from("categories").insert([newCategory]).select()

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        setState((prev) => ({
          ...prev,
          categories: [...prev.categories, data[0]],
          isLoading: false,
        }))

        toast({
          title: "Success",
          description: `Category "${category.name}" has been added`,
        })
      }
    } catch (error) {
      console.error("Failed to add category:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to add category",
      }))

      // Re-throw the error so the component can handle it
      throw error
    }
  }

  // Update a category
  const updateCategory = async (id: string, category: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if table exists first
      if (!state.tableExists) {
        toast({
          title: "Database Error",
          description: "Categories table does not exist. Please create it in the Supabase dashboard.",
          variant: "destructive",
        })
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const updatedData = {
        ...category,
        updatedAt: new Date().toISOString(),
      }

      // Update in Supabase
      const { error } = await supabase.from("categories").update(updatedData).eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id
            ? {
                ...c,
                ...category,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        isLoading: false,
      }))

      toast({
        title: "Success",
        description: `Category has been updated`,
      })
    } catch (error) {
      console.error("Failed to update category:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update category",
      }))

      // Re-throw the error so the component can handle it
      throw error
    }
  }

  // Delete a category
  const deleteCategory = async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if table exists first
      if (!state.tableExists) {
        toast({
          title: "Database Error",
          description: "Categories table does not exist. Please create it in the Supabase dashboard.",
          variant: "destructive",
        })
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      // Delete from Supabase
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setState((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
        isLoading: false,
      }))

      toast({
        title: "Success",
        description: `Category has been deleted`,
      })
    } catch (error) {
      console.error("Failed to delete category:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to delete category",
      }))

      // Re-throw the error so the component can handle it
      throw error
    }
  }

  // Get a category by ID
  const getCategoryById = (id: string) => {
    return state.categories.find((c) => c.id === id)
  }

  return (
    <CategoryContext.Provider
      value={{
        ...state,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        refreshCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

// Custom hook to use the context
export function useCategory() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider")
  }
  return context
}
