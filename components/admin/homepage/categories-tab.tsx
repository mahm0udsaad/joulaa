"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Trash2, Loader2, ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CategoryShowcaseItem } from "@/lib/types"

export default function CategoriesTab() {
  const [categoryShowcase, setCategoryShowcase] = useState<any[]>([])
  const [isLoadingCategoryShowcase, setIsLoadingCategoryShowcase] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<CategoryShowcaseItem | null>(null)

  useEffect(() => {
    fetchCategoryShowcase()
  }, [])

  const fetchCategoryShowcase = async () => {
    setIsLoadingCategoryShowcase(true)
    try {
      const { data, error } = await supabase.from("category_showcase").select("*").order("order", { ascending: true })

      if (error) throw error
      setCategoryShowcase(data || [])
    } catch (error) {
      console.error("Error fetching category showcase:", error)
      toast({
        title: "Error",
        description: "Failed to fetch category showcase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategoryShowcase(false)
    }
  }

  // Edit category item
  const editCategoryItem = (item: CategoryShowcaseItem) => {
    setCurrentCategory(item)
    setCategoryDialogOpen(true)
  }

  // Add new category item
  const addNewCategoryItem = () => {
    setCurrentCategory(null)
    setCategoryDialogOpen(true)
  }

  // Save category item
  const saveCategoryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const categoryData = {
      name: formData.get("name") as string,
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
      href: formData.get("href") as string,
      image: formData.get("image") as string,
      order: currentCategory?.order || categoryShowcase.length + 1,
      active: formData.get("active") === "on",
    }

    try {
      if (currentCategory) {
        // Update existing category
        const { error } = await supabase.from("category_showcase").update(categoryData).eq("id", currentCategory.id)

        if (error) throw error

        setCategoryShowcase(
          categoryShowcase.map((category) =>
            category.id === currentCategory.id ? { ...category, ...categoryData } : category,
          ),
        )

        toast({
          title: "Category updated",
          description: "Category item has been updated successfully.",
        })
      } else {
        // Create new category
        const { data, error } = await supabase.from("category_showcase").insert(categoryData).select()

        if (error) throw error

        setCategoryShowcase([...categoryShowcase, data[0]])

        toast({
          title: "Category added",
          description: "New category item has been added successfully.",
        })
      }

      setCategoryDialogOpen(false)
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete category
  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase.from("category_showcase").delete().eq("id", id)

      if (error) throw error

      setCategoryShowcase(categoryShowcase.filter((category) => category.id !== id))

      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle category active state
  const toggleCategoryActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from("category_showcase").update({ active }).eq("id", id)

      if (error) throw error

      setCategoryShowcase(categoryShowcase.map((category) => (category.id === id ? { ...category, active } : category)))

      toast({
        title: active ? "Category activated" : "Category deactivated",
        description: `The category has been ${active ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories Manager</CardTitle>
            <CardDescription>
              Manage your featured categories here. You can select which categories to feature on the homepage.
            </CardDescription>
          </div>
          <Button onClick={addNewCategoryItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingCategoryShowcase ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading categories...</p>
            </div>
          ) : categoryShowcase.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found. Click "Add Category" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryShowcase.map((category) => (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  <div
                    className={`relative h-32 w-full bg-gradient-to-r ${category.color || "from-gray-400 to-gray-200"}`}
                  >
                    {category.image && (
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover mix-blend-overlay"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-bold text-xl text-white drop-shadow-md">{category.name}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary p-1 rounded">{category.icon}</div>
                        <span className="text-gray-500 truncate">{category.href}</span>
                      </div>
                      {category.active && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editCategoryItem(category)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${category.id}`}
                          checked={category.active}
                          onCheckedChange={(checked) => toggleCategoryActive(category.id, checked)}
                        />
                        <Label htmlFor={`active-${category.id}`}>{category.active ? "Active" : "Inactive"}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Item Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {currentCategory
                ? "Update the details of this category."
                : "Create a new category for your homepage showcase."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveCategoryItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentCategory?.name || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Icon
                </Label>
                <Select name="icon" defaultValue={currentCategory?.icon || "Sparkles"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sparkles">Sparkles</SelectItem>
                    <SelectItem value="Palette">Palette</SelectItem>
                    <SelectItem value="Lipstick">Lipstick</SelectItem>
                    <SelectItem value="Scissors">Scissors</SelectItem>
                    <SelectItem value="Spray">Spray</SelectItem>
                    <SelectItem value="Eye">Eye</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Select name="color" defaultValue={currentCategory?.color || "from-rose-400 to-rose-200"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="from-rose-400 to-rose-200">Rose</SelectItem>
                    <SelectItem value="from-purple-400 to-purple-200">Purple</SelectItem>
                    <SelectItem value="from-pink-400 to-pink-200">Pink</SelectItem>
                    <SelectItem value="from-blue-400 to-blue-200">Blue</SelectItem>
                    <SelectItem value="from-yellow-400 to-yellow-200">Yellow</SelectItem>
                    <SelectItem value="from-green-400 to-green-200">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="image"
                    name="image"
                    defaultValue={currentCategory?.image || ""}
                    className="flex-grow"
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="href" className="text-right">
                  Link
                </Label>
                <Input
                  id="href"
                  name="href"
                  defaultValue={currentCategory?.href || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <div className="flex items-center gap-2">
                  <Switch id="active" name="active" defaultChecked={currentCategory?.active ?? true} />
                  <Label htmlFor="active">Show this category</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
