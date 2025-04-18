"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Minus, Plus, Share2, Star, Truck } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import ProductCard from "@/components/product-card"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"
import type { Product } from "@/contexts/product-context"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const inWishlist = product ? isInWishlist(product.id) : false

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)

        // Check if the products table exists
        const { error: tableError } = await supabase.from("products").select("id").limit(1)

        if (tableError) {
          console.error("Error checking products table:", tableError)
          setError("Unable to fetch product. Please try again later.")
          return
        }

        // Fetch the product by ID
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single()

        if (error) {
          console.error("Error fetching product:", error)
          setError("Product not found or an error occurred.")
          return
        }

        if (!data) {
          setError("Product not found.")
          return
        }

        setProduct(data)

        // Fetch similar products (same category, different ID)
        const { data: similarData, error: similarError } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", data.category_id)
          .neq("id", productId)
          .limit(4)

        if (similarError) {
          console.error("Error fetching similar products:", similarError)
        } else {
          setSimilarProducts(similarData || [])
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.discount > 0 ? (product.price * (100 - product.discount)) / 100 : product.price,
      image: product.image_urls?.[0] || "/placeholder.svg",
      quantity: quantity,
      originalPrice: product.price,
    })

    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`,
      duration: 2000,
    })
  }

  const handleToggleWishlist = () => {
    if (!product) return

    if (inWishlist) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
        duration: 2000,
      })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.discount > 0 ? (product.price * (100 - product.discount)) / 100 : product.price,
        image: product.image_urls?.[0] || "/placeholder.svg",
        originalPrice: product.price,
      })
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
        duration: 2000,
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-red-500 mb-6">{error || "This product could not be found."}</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    )
  }

  const discountedPrice = product.discount > 0 ? (product.price * (100 - product.discount)) / 100 : product.price

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.image_urls?.[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain"
            />
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {product.image_urls?.map((image, index) => (
              <button
                key={index}
                className={`relative h-20 w-20 rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold">${discountedPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <span className="text-xl text-muted-foreground line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-700">{product.description}</p>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded-md">
              <button
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="w-16 text-center border-0"
              />
              <button
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} className="flex-1">
              Add to Cart
            </Button>
            <Button
              variant={inWishlist ? "default" : "outline"}
              size="icon"
              onClick={handleToggleWishlist}
              className="rounded-full"
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-white" : ""}`} />
              <span className="sr-only">{inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Truck className="h-4 w-4 mr-2" />
            <span>Free shipping on orders over $50</span>
          </div>

          {product.stock_status && (
            <div className={`text-sm ${product.stock_status === "In Stock" ? "text-green-600" : "text-red-600"}`}>
              {product.stock_status}
            </div>
          )}
        </div>
      </div>

      {/* Product Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-4 border rounded-md mt-2">
          <div className="prose max-w-none">
            <p>{product.description}</p>
            <ul className="mt-4">
              <li>Dermatologically tested</li>
              <li>Suitable for all skin types</li>
              <li>Cruelty-free and vegan</li>
              <li>Free from parabens and sulfates</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="details" className="p-4 border rounded-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Product Details</h3>
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">Brand:</span> {product.brand}
                </li>
                <li>
                  <span className="font-medium">Weight:</span> {product.weight || "N/A"}
                </li>
                <li>
                  <span className="font-medium">Dimensions:</span> {product.dimensions || "N/A"}
                </li>
                <li>
                  <span className="font-medium">SKU:</span> {product.sku || product.id}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Ingredients</h3>
              <p className="text-sm text-gray-600">{product.ingredients || "Ingredients information not available."}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Customer Reviews</h3>
              <Button variant="outline" size="sm">
                Write a Review
              </Button>
            </div>

            {product.reviews > 0 ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">Jane Doe</span>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">2 weeks ago</span>
                  </div>
                  <p className="text-sm">
                    This product is amazing! I've been using it for two weeks and already see results. The texture is
                    smooth and it absorbs quickly without leaving any greasy residue.
                  </p>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">John Smith</span>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">1 month ago</span>
                  </div>
                  <p className="text-sm">
                    Good product overall. The scent is a bit strong for my liking, but the results are great. Would
                    recommend for those looking for quick results.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
