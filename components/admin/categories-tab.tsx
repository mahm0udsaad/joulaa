"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { categories } from "@/lib/data"

export default function CategoriesTab() {
  const [newCategory, setNewCategory] = useState({ name: "", image: "" })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCategory((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log("New category:", newCategory)
    // Reset form
    setNewCategory({ name: "", image: "" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" value={newCategory.name} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" name="image" value={newCategory.image} onChange={handleInputChange} required />
          </div>
          <Button type="submit">Add Category</Button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} products</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
