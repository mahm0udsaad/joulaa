"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { products, categories } from "@/lib/data"

export default function ProductsTab() {
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setNewProduct((prev) => ({ ...prev, category: value }))
  }

  const handleImageUpload = () => {
    // Placeholder for image upload functionality
    console.log("Image upload functionality to be implemented")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log("New product:", newProduct)
    // Reset form
    setNewProduct({
      name: "",
      brand: "",
      description: "",
      price: "",
      category: "",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" value={newProduct.brand} onChange={handleInputChange} required />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={handleSelectChange} value={newProduct.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Product Image</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={handleImageUpload}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Click to upload product image</p>
            </div>
          </div>
          <Button type="submit">Add Product</Button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Existing Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <p className="mt-2">${product.price.toFixed(2)}</p>
              <p className="text-sm">{product.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
