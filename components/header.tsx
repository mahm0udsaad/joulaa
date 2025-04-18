"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import HeaderCategoriesDropdown from "@/components/header-categories-dropdown"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import Image from "next/image"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const cart = useCart()
  const wishlist = useWishlist()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/"
                    className={`text-lg font-medium ${isActive("/") ? "text-primary" : "text-gray-700"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop"
                    className={`text-lg font-medium ${isActive("/shop") ? "text-primary" : "text-gray-700"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/about"
                    className={`text-lg font-medium ${isActive("/about") ? "text-primary" : "text-gray-700"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className={`text-lg font-medium ${isActive("/contact") ? "text-primary" : "text-gray-700"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/joulaa-logo.svg" alt="joulaa" width={120} height={40} className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium ${isActive("/") ? "text-primary" : "text-gray-700 hover:text-gray-900"}`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`text-sm font-medium ${
                isActive("/shop") ? "text-primary" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Shop
            </Link>
            <HeaderCategoriesDropdown />
            <Link
              href="/about"
              className={`text-sm font-medium ${
                isActive("/about") ? "text-primary" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium ${
                isActive("/contact") ? "text-primary" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Search, cart, wishlist, account */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative w-full max-w-xs">
              <Input
                type="search"
                placeholder="Search products..."
                className="pr-10 rounded-full bg-gray-100 border-0 focus-visible:ring-1"
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-full">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>

            <Link href="/wishlist" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
              {wishlist.items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {wishlist.items.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cart.items.length}
                </span>
              )}
            </Link>

            <Link href="/account">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="pb-4 md:hidden">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search products..."
              className="pr-10 rounded-full bg-gray-100 border-0 focus-visible:ring-1"
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-full">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
