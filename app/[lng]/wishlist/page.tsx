"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Trash2, ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"
import { getDiscountedPrice } from "@/lib/data"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState<number[]>([])
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  console.log(wishlist[0])
  const handleAddToCart = (product: any) => {
    const quantity = quantities[product.id] || 1
    addToCart(product, quantity)
    setAddedToCart((prev) => [...prev, product.id])
    setTimeout(() => {
      setAddedToCart((prev) => prev.filter((id) => id !== product.id))
    }, 2000)
  }

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, value) }))
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-8 mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">My Wishlist</h1>
          <p className="text-lg text-gray-600 mb-6">
            Keep track of all your favorite items in one place. Easily add them to your cart when you're ready to
            purchase.
          </p>
          <div className="flex justify-center">
            <Heart className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-4">
            Add items you love to your wishlist. Review them anytime and easily move them to the cart.
          </p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((product) => {
            // Ensure we have valid product data with fallbacks
            const price = product?.price || 0
            const discount = product?.discount || 0
            const discountedPrice = getDiscountedPrice(price, discount)

            // Check if product has all required properties
            if (!product || !product.id) {
              return null // Skip rendering invalid products
            }

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link href={`/product/${product.id}`}>
                  <div className="relative h-64">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name || "Product"}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                      {product.name || "Unnamed Product"}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">{product.brand || "No Brand"}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="font-bold text-lg">${discountedPrice}</span>
                      {discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through ml-2">${price.toFixed(2)}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded">
                        {Math.round(discount * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value))}
                      className="w-16 mx-2 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlist(product.id)}
                      className="flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={addedToCart.includes(product.id)}
                      className="flex items-center"
                    >
                      {addedToCart.includes(product.id) ? (
                        "Added to Cart"
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
