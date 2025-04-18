"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ShoppingCart,
  Building2,
  Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

export default function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: isActive("/admin") && pathname === "/admin",
    },
    {
      label: "Products",
      icon: ShoppingBag,
      href: "/admin/products",
      active: isActive("/admin/products"),
    },
    {
      label: "Categories",
      icon: Tag,
      href: "/admin/categories",
      active: isActive("/admin/categories"),
    },
    {
      label: "Customers",
      icon: Users,
      href: "/admin/customers",
      active: isActive("/admin/customers"),
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
      active: isActive("/admin/orders"),
    },
    {
      label: "Abandoned Carts",
      icon: ShoppingCart,
      href: "/admin/abandoned-carts",
      active: isActive("/admin/abandoned-carts"),
    },
    {
      label: "Homepage",
      icon: Home,
      href: "/admin/homepage",
      active: isActive("/admin/homepage"),
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "/admin/reports",
      active: isActive("/admin/reports"),
    },
    {
      label: "Profits",
      icon: Percent,
      href: "/admin/profits",
      active: isActive("/admin/profits"),
    },
    {
      label: "Company",
      icon: Building2,
      href: "/admin/company",
      active: isActive("/admin/company"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: isActive("/admin/settings"),
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <div className="px-3 py-2">
            <div className="mb-2 flex items-center px-2">
              <Link href="/" className="flex items-center">
                <Image src="/joulaa-logo.svg" alt="Joulaa" width={120} height={40} className="h-8 w-auto" />
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="space-y-1 py-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                    route.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <route.icon className={`mr-2 h-5 w-5 ${route.active ? "text-primary-foreground" : ""}`} />
                  {route.label}
                </Link>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <Link href="/">
                <Button variant="outline" className="w-full justify-start">
                  <LogOut className="mr-2 h-5 w-5" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className={`hidden h-screen border-r bg-background md:flex md:w-[240px] md:flex-col ${className}`}>
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center">
            <Image src="/joulaa-logo.svg" alt="Joulaa" width={120} height={40} className="h-8 w-auto" />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  route.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <route.icon className={`h-5 w-5 ${route.active ? "text-primary-foreground" : ""}`} />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="mr-2 h-5 w-5" />
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
