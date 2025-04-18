"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useProduct } from "@/contexts/product-context"
import { LoadingSpinner } from "@/components/loading-spinner"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  brand: z.string().min(2, { message: "Brand must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  cost: z.coerce.number().positive({ message: "Cost must be a positive number." }),
  profitMargin: z.coerce.number().positive({ message: "Profit must be a positive number." }),
  discount: z.coerce.number().min(0, { message: "Discount must be a non-negative number." }),
  category: z.string().min(1, { message: "Please select a category." }),
  stock_quantity: z.coerce.number().int().positive({ message: "Stock quantity must be a positive integer." }),
})

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addProduct, uploadProductImage } = useProduct()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [colors, setColors] = useState<{ name: string; hex_value: string }[]>([])
  const [colorName, setColorName] = useState("")
  const [colorHex, setColorHex] = useState("#000000")
  const [variants, setVariants] = useState<{ key: string; value: string }[]>([])
  const [variantKey, setVariantKey] = useState("")
  const [variantValue, setVariantValue] = useState("")

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      description: "",
      price: 0,
      cost: 0,
      profitMargin: 0,
      discount: 0,
      category: "",
      stock_quantity: 0,
    },
  })

  // Calculate price based on cost and profit
  useEffect(() => {
    const cost = form.watch("cost")
    const profitMargin = form.watch("profitMargin")

    if (cost && profitMargin) {
      // Calculate price as cost + profit (fixed amount)
      const calculatedPrice = cost + profitMargin
      form.setValue("price", calculatedPrice)
    }
  }, [form.watch("cost"), form.watch("profitMargin"), form])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      setUploadingImage(true)
      const file = e.target.files[0]
      const imageUrl = await uploadProductImage(file)

      setImageUrls((prev) => [...prev, imageUrl])
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Add color
  const addColor = () => {
    if (colorName.trim() === "" || colorHex.trim() === "") {
      toast({
        title: "Invalid color",
        description: "Please provide both a color name and hex value",
        variant: "destructive",
      })
      return
    }

    setColors((prev) => [...prev, { name: colorName, hex_value: colorHex }])
    setColorName("")
    setColorHex("#000000")
  }

  // Remove color
  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  // Add variant
  const addVariant = () => {
    if (variantKey.trim() === "" || variantValue.trim() === "") {
      toast({
        title: "Invalid variant",
        description: "Please provide both a key and value for the variant",
        variant: "destructive",
      })
      return
    }

    setVariants((prev) => [...prev, { key: variantKey, value: variantValue }])
    setVariantKey("")
    setVariantValue("")
  }

  // Remove variant
  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (imageUrls.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one product image",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Create the product object
      const product = {
        ...values,
        image_urls: imageUrls,
        colors: colors.length > 0 ? colors : undefined,
        variants: variants.length > 0 ? variants : undefined,
      }

      await addProduct(product)
      toast({
        title: "Product added",
        description: "Product has been added successfully",
      })
      router.push("/admin/products/manage")
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <Button variant="outline" onClick={() => router.push("/admin/products/manage")}>
          Back to Products
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Enter the details of the new product</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="makeup">Makeup</SelectItem>
                            <SelectItem value="skincare">Skincare</SelectItem>
                            <SelectItem value="haircare">Haircare</SelectItem>
                            <SelectItem value="fragrance">Fragrance</SelectItem>
                            <SelectItem value="tools">Tools & Brushes</SelectItem>
                            <SelectItem value="bath">Bath & Body</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>The cost to purchase or manufacture the product</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profitMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>Fixed profit amount added to the cost</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} readOnly />
                        </FormControl>
                        <FormDescription>Automatically calculated as Cost + Profit</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter product description" rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Images */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Product Images</h3>
                  <p className="text-sm text-gray-500">Upload images of the product</p>
                </div>

                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  {uploadingImage && <LoadingSpinner size="sm" />}
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Product Colors</h3>
                  <p className="text-sm text-gray-500">Add available colors for this product</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Input
                    placeholder="Color name (e.g., Ruby Red)"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className="w-full md:w-1/3"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <span className="text-sm">{colorHex}</span>
                  </div>
                  <Button type="button" variant="outline" onClick={addColor}>
                    <Plus className="h-4 w-4 mr-2" /> Add Color
                  </Button>
                </div>

                {colors.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {colors.map((color, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: color.hex_value }}
                          ></div>
                          <span>{color.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Product Variants</h3>
                  <p className="text-sm text-gray-500">
                    Add key features or variants (e.g., "Free Shipping", "Easy Returns")
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Input
                    placeholder="Key (e.g., Free Shipping)"
                    value={variantKey}
                    onChange={(e) => setVariantKey(e.target.value)}
                    className="w-full md:w-1/3"
                  />
                  <Input
                    placeholder="Value (e.g., On orders over $50)"
                    value={variantValue}
                    onChange={(e) => setVariantValue(e.target.value)}
                    className="w-full md:w-1/3"
                  />
                  <Button type="button" variant="outline" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" /> Add Variant
                  </Button>
                </div>

                {variants.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium">{variant.key}</div>
                          <div className="text-sm text-gray-500">{variant.value}</div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/products/manage")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="sm" /> : "Add Product"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
