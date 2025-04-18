"use client"

import { useState } from "react"
import { useProduct } from "@/contexts/product-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Search, Star, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { getDiscountedPrice } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ProductsPage() {
  const {
    products,
    deleteProduct,
    setDailyOffer,
    setFeatured,
    setNewArrival,
    setBestSeller,
  } = useProduct()

  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentProductId, setCurrentProductId] = useState<number | null>(null)
  const router = useRouter()

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    setCurrentProductId(id)
    setDeleteDialogOpen(true)
  }

  // Handle product deletion
  const handleDelete = async () => {
    if (currentProductId !== null) {
      await deleteProduct(currentProductId)
      setDeleteDialogOpen(false)
    }
  }

  // Handle edit button click
  const handleEdit = (id: number) => {
    router.push(`/admin/products/manage?id=${id}`)
  }

  // Handle daily offer toggle
  const handleDailyOfferToggle = async (id: number, currentStatus: boolean) => {
    await setDailyOffer(id, !currentStatus)
  }

  // Handle featured toggle
  const handleFeaturedToggle = async (id: number, currentStatus: boolean) => {
    await setFeatured(id, !currentStatus)
  }

  // Handle new arrival toggle
  const handleNewArrivalToggle = async (id: number, currentStatus: boolean) => {
    await setNewArrival(id, !currentStatus)
  }

  // Handle best seller toggle
  const handleBestSellerToggle = async (id: number, currentStatus: boolean) => {
    await setBestSeller(id, !currentStatus)
  }

  return (
   <div className="space-y-6">
     <div className="flex justify-between items-center">
       <h1 className="text-3xl font-bold">Products</h1>
       <Link href="/admin/products/add">
         <Button className="flex items-center gap-2">
           <Plus className="h-4 w-4" />
           Add New Product
         </Button>
       </Link>
     </div>

     <div className="flex items-center mb-6">
       <Search className="h-5 w-5 text-gray-400 mr-2" />
       <Input
         type="text"
         placeholder="Search products..."
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         className="max-w-sm"
       />
     </div>

     <div className="bg-white shadow-md rounded-lg overflow-hidden">
       <Table>
         <TableHeader>
           <TableRow>
             <TableHead>Image</TableHead>
             <TableHead>Name</TableHead>
             <TableHead>Category</TableHead>
             <TableHead>Price</TableHead>
             <TableHead>Stock</TableHead>
             <TableHead>Status</TableHead>
             <TableHead>Actions</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody>
           {filteredProducts.length === 0 ? (
             <TableRow>
               <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                 No products found
               </TableCell>
             </TableRow>
           ) : (
             filteredProducts.map((product) => {
               const discountedPrice = getDiscountedPrice(product.price, product.discount)
               return (
                 <TableRow key={product.id}>
                   <TableCell>
                     <div className="relative h-10 w-10 rounded-md overflow-hidden">
                       <Image
                          src={product.image_urls?.[0] || "/placeholder.svg"}
                         alt={product.name}
                         fill
                         className="object-cover"
                       />
                     </div>
                   </TableCell>
                   <TableCell className="font-medium">{product.name}</TableCell>
                   <TableCell>{product.category}</TableCell>
                   <TableCell>
                     {product.discount > 0 ? (
                       <div className="flex flex-col">
                         <span>${discountedPrice}</span>
                         <span className="text-sm text-muted-foreground line-through">
                           ${product.price.toFixed(2)}
                         </span>
                       </div>
                     ) : (
                       <span>${product.price.toFixed(2)}</span>
                     )}
                   </TableCell>
                   <TableCell>{product.stock_quantity}</TableCell>
                   <TableCell>
                     <div className="flex flex-wrap gap-1">
                       {product.isDailyOffer && (
                         <Badge variant="default" className="bg-amber-500">
                           Daily Offer
                         </Badge>
                       )}
                       {product.isFeatured && <Badge variant="outline">Featured</Badge>}
                       {product.isNewArrival && <Badge variant="outline">New</Badge>}
                       {product.isBestSeller && (
                         <Badge variant="outline" className="flex items-center gap-1">
                           <Star className="h-3 w-3" /> Best Seller
                         </Badge>
                       )}
                     </div>
                   </TableCell>
                   <TableCell>
                     <div className="flex space-x-2">
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleDailyOfferToggle(product.id, product.isDailyOffer || false)}
                               className={`h-8 w-8 p-0 ${product.isDailyOffer ? "bg-amber-100" : ""}`}
                             >
                               <Star className={`h-4 w-4 ${product.isDailyOffer ? "fill-amber-500 text-amber-500" : ""}`} />
                               <span className="sr-only">
                                 {product.isDailyOffer ? "Remove from daily offers" : "Set as daily offer"}
                               </span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             {product.isDailyOffer ? "Remove from daily offers" : "Set as daily offer"}
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>

                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleFeaturedToggle(product.id, product.isFeatured || false)}
                               className={`h-8 w-8 p-0 ${product.isFeatured ? "bg-blue-100" : ""}`}
                             >
                               <Star className={`h-4 w-4 ${product.isFeatured ? "fill-blue-500 text-blue-500" : ""}`} />
                               <span className="sr-only">
                                 {product.isFeatured ? "Remove from featured" : "Set as featured"}
                               </span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             {product.isFeatured ? "Remove from featured" : "Set as featured"}
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>

                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleNewArrivalToggle(product.id, product.isNewArrival || false)}
                               className={`h-8 w-8 p-0 ${product.isNewArrival ? "bg-green-100" : ""}`}
                             >
                               <Plus className={`h-4 w-4 ${product.isNewArrival ? "fill-green-500 text-green-500" : ""}`} />
                               <span className="sr-only">
                                 {product.isNewArrival ? "Remove from new arrivals" : "Set as new arrival"}
                               </span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             {product.isNewArrival ? "Remove from new arrivals" : "Set as new arrival"}
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>

                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleBestSellerToggle(product.id, product.isBestSeller || false)}
                               className={`h-8 w-8 p-0 ${product.isBestSeller ? "bg-purple-100" : ""}`}
                             >
                               <ShoppingBag className={`h-4 w-4 ${product.isBestSeller ? "fill-purple-500 text-purple-500" : ""}`} />
                               <span className="sr-only">
                                 {product.isBestSeller ? "Remove from best sellers" : "Set as best seller"}
                               </span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             {product.isBestSeller ? "Remove from best sellers" : "Set as best seller"}
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>

                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEdit(product.id)}
                               className="h-8 w-8 p-0"
                             >
                               <Pencil className="h-4 w-4" />
                               <span className="sr-only">Edit</span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>Edit product</TooltipContent>
                         </Tooltip>
                       </TooltipProvider>

                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleDeleteClick(product.id)}
                               className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                             >
                               <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Delete</span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>Delete product</TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                   </TableCell>
                 </TableRow>
               )
              })
            )}
           </TableBody>
         </Table>
     </div>

     {/* Delete Confirmation Dialog */}
     <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>Delete Product</DialogTitle>
           <DialogDescription>
             Are you sure you want to delete this product? This action cannot be undone.
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
