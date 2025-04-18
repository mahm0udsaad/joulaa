"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getOrdersByUser } from "@/lib/order-service"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/sign-in?redirect=/account/orders")
      return
    }

    async function fetchOrders() {
      try {
        const ordersData = await getOrdersByUser(user.id)
        setOrders(ordersData || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner message="Loading your orders..." />
      </div>
    )
  }

  if (!user) {
    return null // Redirect handled in useEffect
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "canceled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/account" className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Account
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <p className="text-muted-foreground mt-2">View and track your order history</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                    <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    {order.order_items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-16 w-16 rounded overflow-hidden bg-muted">
                          {item.image_url ? (
                            <Image
                              src={item.image_url || "/placeholder.svg"}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ${Number.parseFloat(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="flex items-center">
                        <Badge variant="outline">+{order.order_items.length - 3} more items</Badge>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
