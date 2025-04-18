"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type CartItem = {
  id: number
  name: string
  price: number
  discount: number
  image_urls: string[]
  quantity: number
  selectedColor?: string
  selectedShade?: string
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: any, quantity?: number, selectedColor?: string, selectedShade?: string) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: any, quantity = 1, selectedColor?: string, selectedShade?: string) => {
    console.log(product)
    setCart((prevCart) => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.id === product.id && item.selectedColor === selectedColor && item.selectedShade === selectedShade,
      )
      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += quantity
        return updatedCart
      } else {
        // Add new item if product doesn't exist
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price || 0, // Ensure price is a number
            discount: product.discount || 0, // Ensure discount is a number
            image_urls: product.image ? [product.image] : [],
            quantity,
            selectedColor,
            selectedShade,
          },
        ]
      }
    })
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      // Ensure we're working with numbers
      const price = typeof item.price === "number" ? item.price : 0
      const discount = typeof item.discount === "number" ? item.discount : 0
      const quantity = typeof item.quantity === "number" ? item.quantity : 0

      const discountedPrice = price * (1 - discount)
      return total + discountedPrice * quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
