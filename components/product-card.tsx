"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/contexts/product-context"
import { useCart } from "./cart-provider"
import { useWishlist } from "./wishlist-provider"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/data"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const { toast } = useToast()

  const discountedPrice = product.discount > 0 ? (product.price * (100 - product.discount)) / 100 : product.price
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAddingToCart(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: discountedPrice,
        image: product.image_urls?.[0] || "/placeholder.svg",
        quantity: 1,
        originalPrice: product.price,
      })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        duration: 2000,
      })

      setIsAddingToCart(false)
    }, 300)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsTogglingWishlist(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
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
          price: discountedPrice,
          image: product.image_urls?.[0] || "/placeholder.svg",
          originalPrice: product.price,
        })
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
          duration: 2000,
        })
      }

      setIsTogglingWishlist(false)
    }, 300)
  }

  return (
    <div className="group relative">
      <div className="relative h-60 w-full overflow-hidden rounded-lg bg-gray-100">
        {product.image_urls && product.image_urls.length > 0 ? (
          <Image
            src={product.image_urls?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex justify-center space-x-2">
            <Button
              size="sm"
              variant={inWishlist ? "default" : "secondary"}
              className="rounded-full w-10 h-10 p-0"
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-white" : ""}`} />
              <span className="sr-only">{inWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
            </Button>
            <Button
              size="sm"
              className="rounded-full w-10 h-10 p-0"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{product.brand}</p>
          <div className="mt-1 flex items-center">
            <p className="font-medium text-gray-900">{formatCurrency(discountedPrice)}</p>
            {product.discount > 0 && (
              <p className="ml-2 text-sm text-gray-500 line-through">{formatCurrency(product.price)}</p>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
