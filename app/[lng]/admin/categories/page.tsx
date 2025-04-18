"use client"

import type React from "react"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Switch,
} from "@/components/ui/ui"
import { Database, Pencil, Plus, Search, ShieldAlert, Trash2, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useCategory, type Category } from "@/hooks/use-category"
import { seedInitialData } from "@/lib/seed"
import { toast } from "@/hooks/use-toast"
import { uploadImage } from "@/lib/upload-helper"
import { supabase } from "@/lib/supabase"

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, isLoading, tableExists, refreshCategories } =
    useCategory()
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [rlsDialogOpen, setRlsDialogOpen] = useState(false)
  const [storageBucketDialogOpen, setStorageBucketDialogOpen] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [hasRlsError, setHasRlsError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show setup dialog if table doesn't exist
  useEffect(() => {
    if (!tableExists && !isLoading) {
      setSetupDialogOpen(true)
    }
  }, [tableExists, isLoading])

  // Check if we need to seed initial data
  useEffect(() => {
    const checkAndSeedData = async () => {
      if (tableExists && categories.length === 0 && !isLoading && !isSeeding) {
        setIsSeeding(true)

        const result = await seedInitialData()

        if (!result.success && result.error === "rls") {
          setHasRlsError(true)
          setRlsDialogOpen(true)
        } else if (result.success) {
          await refreshCategories()
        }

        setIsSeeding(false)
      }
    }

    checkAndSeedData()
  }, [categories.length, isLoading, isSeeding, tableExists, refreshCategories])

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Open dialog for adding a new category
  const handleAddCategory = () => {
    if (!tableExists) {
      toast({
        title: "Database Error",
        description: "Categories table does not exist. Please create it in the Supabase dashboard.",
        variant: "destructive",
      })
      return
    }

    if (hasRlsError) {
      setRlsDialogOpen(true)
      return
    }

    setCurrentCategory({
      name: "",
      image: "",
      count: 0,
      description: "",
      slug: "",
      isActive: true,
    })
    setDialogOpen(true)
  }

  // Open dialog for editing a category
  const handleEditCategory = (category: Category) => {
    if (hasRlsError) {
      setRlsDialogOpen(true)
      return
    }

    setCurrentCategory(category)
    setDialogOpen(true)
  }

  // Open dialog for deleting a category
  const handleDeleteClick = (category: Category) => {
    if (hasRlsError) {
      setRlsDialogOpen(true)
      return
    }

    setCurrentCategory(category)
    setDeleteDialogOpen(true)
  }

  // Handle image upload button click
  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Upload the image to Supabase Storage
      const imageUrl = await uploadImage(file)

      // Update the category state with the new image URL
      setCurrentCategory((prev) => (prev ? { ...prev, image: imageUrl } : null))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (errorMessage.includes("bucket") && errorMessage.includes("not found")) {
        setStorageBucketDialogOpen(true)
      } else if (errorMessage.includes("row-level security")) {
        setStorageBucketDialogOpen(true)
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle form submission for adding/editing a category
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const categoryData = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      slug:
        (formData.get("slug") as string) || formData.get("name")?.toString().toLowerCase().replace(/\s+/g, "-") || "",
      count: Number.parseInt(formData.get("count") as string) || 0,
      isActive: formData.get("isActive") === "on",
    }

    try {
      if (currentCategory?.id) {
        // Update existing category
        await updateCategory(currentCategory.id, categoryData)
      } else {
        // Add new category
        await addCategory(categoryData as Omit<Category, "id" | "createdAt" | "updatedAt">)
      }
      setDialogOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (errorMessage.includes("row-level security")) {
        setHasRlsError(true)
        setRlsDialogOpen(true)
        setDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to save category",
          variant: "destructive",
        })
      }
    }
  }

  // Handle category deletion
  const handleDelete = async () => {
    if (currentCategory?.id) {
      try {
        await deleteCategory(currentCategory.id)
        setDeleteDialogOpen(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        if (errorMessage.includes("row-level security")) {
          setHasRlsError(true)
          setRlsDialogOpen(true)
          setDeleteDialogOpen(false)
        } else {
          toast({
            title: "Error",
            description: "Failed to delete category",
            variant: "destructive",
          })
        }
      }
    }
  }

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/\s+/g, "-")
    setCurrentCategory((prev) => (prev ? { ...prev, name, slug } : null))
  }

  // Check RLS status after fixing it
  const checkRlsStatus = async () => {
    try {
      // Try to insert a test category
      const testCategory = {
        id: `test-${Date.now()}`,
        name: "Test Category",
        image: "",
        count: 0,
        slug: `test-${Date.now()}`,
        description: "Test category to check RLS",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const { error } = await supabase.from("categories").insert([testCategory])

      if (error) {
        if (error.message.includes("row-level security")) {
          toast({
            title: "RLS Still Active",
            description: "Row Level Security is still preventing access. Please check your policy settings.",
            variant: "destructive",
          })
          return false
        }
        throw error
      }

      // Delete the test category
      await supabase.from("categories").delete().eq("id", testCategory.id)

      setHasRlsError(false)
      setRlsDialogOpen(false)

      toast({
        title: "Success",
        description: "Row Level Security policy has been configured correctly!",
      })

      // Refresh categories
      await refreshCategories()

      return true
    } catch (error) {
      console.error("Error checking RLS status:", error)
      toast({
        title: "Error",
        description: "Failed to check RLS status",
        variant: "destructive",
      })
      return false
    }
  }

  // Check storage bucket setup
  const checkStorageBucket = async () => {
    try {
      // Create a small test file
      const testFile = new File(["test"], "test.txt", { type: "text/plain" })

      // Try to upload the test file
      const { error } = await supabase.storage.from("categories").upload(`test-${Date.now()}.txt`, testFile)

      if (error) {
        if (error.message.includes("row-level security")) {
          toast({
            title: "RLS Still Active",
            description:
              "Row Level Security is still preventing access to the storage bucket. Please check your policy settings.",
            variant: "destructive",
          })
          return false
        }

        if (error.message.includes("bucket") && error.message.includes("not found")) {
          toast({
            title: "Bucket Not Found",
            description: "The 'categories' bucket does not exist. Please create it in the Supabase dashboard.",
            variant: "destructive",
          })
          return false
        }

        throw error
      }

      setStorageBucketDialogOpen(false)

      toast({
        title: "Success",
        description: "Storage bucket is configured correctly!",
      })

      return true
    } catch (error) {
      console.error("Error checking storage bucket:", error)
      toast({
        title: "Error",
        description: "Failed to check storage bucket",
        variant: "destructive",
      })
      return false
    }
  }

  const refreshProducts = async () => {
    // This function doesn't actually do anything, but it's needed to satisfy the type checker.
    // In a real application, you would likely want to refresh the list of products here.
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>
  }

  if (!tableExists) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Database className="h-16 w-16 text-gray-400" />
        <h2 className="text-2xl font-bold">Database Setup Required</h2>
        <p className="text-center max-w-md text-gray-500">
          The categories table doesn't exist in your Supabase database. Please create it through the Supabase dashboard.
        </p>
        <Button onClick={() => setSetupDialogOpen(true)}>View Setup Instructions</Button>

        <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Database Setup Required</DialogTitle>
              <DialogDescription>
                You need to create the categories table in your Supabase database. Follow these instructions:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Log in to your Supabase dashboard at{" "}
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    https://app.supabase.com
                  </a>
                </li>
                <li>Select your project</li>
                <li>Go to the "Table Editor" section</li>
                <li>Click "Create a new table"</li>
                <li>Name the table "categories"</li>
                <li>Add the following columns:</li>
              </ol>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">Column Name</th>
                      <th className="px-4 py-2 border">Data Type</th>
                      <th className="px-4 py-2 border">Default Value</th>
                      <th className="px-4 py-2 border">Primary Key</th>
                      <th className="px-4 py-2 border">Not Null</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border">id</td>
                      <td className="px-4 py-2 border">text</td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">Yes</td>
                      <td className="px-4 py-2 border">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">name</td>
                      <td className="px-4 py-2 border">text</td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">image</td>
                      <td className="px-4 py-2 border">text</td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">count</td>
                      <td className="px-4 py-2 border">integer</td>
                      <td className="px-4 py-2 border">0</td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">description</td>
                      <td className="px-4 py-2 border">text</td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">slug</td>
                      <td className="px-4 py-2 border">text</td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">parentId</td>
                      <td className="px-4 py-2 border">text</td>
                      <td className="px-4 py-2 border"></td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">isActive</td>
                      <td className="px-4 py-2 border">boolean</td>
                      <td className="px-4 py-2 border">true</td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">createdAt</td>
                      <td className="px-4 py-2 border">timestamptz</td>
                      <td className="px-4 py-2 border">now()</td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">updatedAt</td>
                      <td className="px-4 py-2 border">timestamptz</td>
                      <td className="px-4 py-2 border">now()</td>
                      <td className="px-4 py-2 border">No</td>
                      <td className="px-4 py-2 border">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-4">
                <h3 className="text-sm font-medium text-yellow-800">Important: Configure Row Level Security</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  After creating the table, you need to configure Row Level Security (RLS) to allow access to the table:
                </p>
                <ol className="list-decimal pl-5 mt-2 text-sm text-yellow-700 space-y-1">
                  <li>Go to the "Authentication" section in the sidebar</li>
                  <li>Click on "Policies"</li>
                  <li>Find your "categories" table</li>
                  <li>
                    Either:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>
                        <strong>Option 1:</strong> Turn off RLS by toggling the switch (less secure but simpler)
                      </li>
                      <li>
                        <strong>Option 2:</strong> Create a policy that allows all operations (recommended):
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                          <li>Click "New Policy"</li>
                          <li>Select "Create a policy from scratch"</li>
                          <li>Policy name: "Enable all operations for categories"</li>
                          <li>
                            For "Using expression" enter: <code className="bg-gray-100 px-1 py-0.5 rounded">true</code>
                          </li>
                          <li>Check all operations: SELECT, INSERT, UPDATE, DELETE</li>
                          <li>Click "Save Policy"</li>
                        </ol>
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
                <h3 className="text-sm font-medium text-blue-800">Set Up Storage for Image Uploads</h3>
                <p className="text-sm text-blue-700 mt-1">
                  To enable image uploads, you also need to set up a storage bucket:
                </p>
                <ol className="list-decimal pl-5 mt-2 text-sm text-blue-700 space-y-1">
                  <li>Go to the "Storage" section in the sidebar</li>
                  <li>Click "Create a new bucket"</li>
                  <li>Name the bucket "categories"</li>
                  <li>Make sure "Public bucket" is checked</li>
                  <li>Click "Create bucket"</li>
                  <li>Go to "Policies" tab for the bucket</li>
                  <li>
                    Create a policy that allows public access:
                    <ol className="list-decimal pl-5 mt-1 space-y-1">
                      <li>Click "New Policy"</li>
                      <li>Policy name: "Public access"</li>
                      <li>
                        For "Using expression" enter: <code className="bg-gray-100 px-1 py-0.5 rounded">true</code>
                      </li>
                      <li>Check all operations: SELECT, INSERT, UPDATE, DELETE</li>
                      <li>Click "Save Policy"</li>
                    </ol>
                  </li>
                </ol>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                After creating the table and configuring RLS, refresh this page to continue.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => refreshProducts()}>Refresh</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (hasRlsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <ShieldAlert className="h-16 w-16 text-amber-500" />
        <h2 className="text-2xl font-bold">Row Level Security Error</h2>
        <p className="text-center max-w-md text-gray-500">
          Row Level Security is preventing access to the categories table. Please configure RLS policies in your
          Supabase dashboard.
        </p>
        <Button onClick={() => setRlsDialogOpen(true)}>View RLS Instructions</Button>

        <Dialog open={rlsDialogOpen} onOpenChange={setRlsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Row Level Security Configuration Required</DialogTitle>
              <DialogDescription>
                You need to configure Row Level Security (RLS) for the categories table in your Supabase database.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="text-sm font-medium text-amber-800">What is Row Level Security?</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Row Level Security (RLS) is a Supabase feature that restricts which rows can be accessed by different
                  users. By default, when you create a table, RLS is enabled but no policies are defined, which blocks
                  all access.
                </p>
              </div>

              <h3 className="text-base font-medium">Follow these steps to configure RLS:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Log in to your Supabase dashboard at{" "}
                  <a
                    href="https://app.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    https://app.supabase.com
                  </a>
                </li>
                <li>Select your project</li>
                <li>Go to the "Authentication" section in the sidebar</li>
                <li>Click on "Policies"</li>
                <li>Find your "categories" table</li>
                <li>
                  Either:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      <strong>Option 1:</strong> Turn off RLS by toggling the switch (less secure but simpler)
                    </li>
                    <li>
                      <strong>Option 2:</strong> Create a policy that allows all operations (recommended):
                      <ol className="list-decimal pl-5 mt-1 space-y-1">
                        <li>Click "New Policy"</li>
                        <li>Select "Create a policy from scratch"</li>
                        <li>Policy name: "Enable all operations for categories"</li>
                        <li>
                          For "Using expression" enter: <code className="bg-gray-100 px-1 py-0.5 rounded">true</code>
                        </li>
                        <li>Check all operations: SELECT, INSERT, UPDATE, DELETE</li>
                        <li>Click "Save Policy"</li>
                      </ol>
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
            <DialogFooter>
              <Button onClick={checkRlsStatus}>Check RLS Status</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAddCategory} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.count}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(category)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {currentCategory?.id
                ? "Update the details of this category."
                : "Create a new category for your products."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={currentCategory?.name || ""}
                  onChange={handleNameChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={currentCategory?.slug || ""}
                  onChange={(e) => setCurrentCategory((prev) => (prev ? { ...prev, slug: e.target.value } : null))}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="image"
                    name="image"
                    value={currentCategory?.image || ""}
                    onChange={(e) => setCurrentCategory((prev) => (prev ? { ...prev, image: e.target.value } : null))}
                    className="flex-grow"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleImageButtonClick}
                    disabled={isUploading}
                    title="Upload image"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              {currentCategory?.image && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right">Preview</div>
                  <div className="col-span-3">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                      <Image
                        src={currentCategory.image || "/placeholder.svg"}
                        alt="Category preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="count" className="text-right">
                  Product Count
                </Label>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  value={currentCategory?.count || 0}
                  onChange={(e) =>
                    setCurrentCategory((prev) =>
                      prev ? { ...prev, count: Number.parseInt(e.target.value) || 0 } : null,
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentCategory?.description || ""}
                  onChange={(e) =>
                    setCurrentCategory((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={currentCategory?.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setCurrentCategory((prev) => (prev ? { ...prev, isActive: checked } : null))
                    }
                  />
                  <Label htmlFor="isActive">Show this category</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{currentCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
