"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Package, Truck, CreditCard, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getOrderById } from "@/lib/order-service"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/sign-in?redirect=/account/orders")
      return
    }

    async function fetchOrder() {
      try {
        const orderData = await getOrderById(params.id)

        // Verify this order belongs to the current user
        if (orderData.user_id !== user.id) {
          router.push("/account/orders")
          return
        }

        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order:", error)
        router.push("/account/orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [user, authLoading, router, params.id])

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner message="Loading order details..." />
      </div>
    )
  }

  if (!user || !order) {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      case "failed":
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
        <Link href="/account/orders" className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id.substring(0, 8)}</h1>
            <p className="text-muted-foreground mt-2">Placed on {formatDate(order.created_at)}</p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 py-3 border-b last:border-0">
                    <div className="relative h-20 w-20 rounded overflow-hidden bg-muted flex-shrink-0">
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
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      {item.color && <p className="text-sm text-muted-foreground">Color: {item.color}</p>}
                      {item.shade && <p className="text-sm text-muted-foreground">Shade: {item.shade}</p>}
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="font-medium">${Number.parseFloat(item.unit_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader className="flex flex-row items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shipping_address.firstName} {order.shipping_address.lastName}
                </p>
                <p>{order.shipping_address.address}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
                </p>
                <p>{order.shipping_address.country}</p>
                <p className="text-sm text-muted-foreground mt-2">Email: {order.shipping_address.email}</p>
                <p className="text-sm text-muted-foreground">Phone: {order.shipping_address.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information (if available) */}
          {order.tracking_number && (
            <Card>
              <CardHeader className="flex flex-row items-center">
                <Truck className="h-5 w-5 mr-2" />
                <CardTitle>Tracking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Tracking Number: {order.tracking_number}</p>
                  <Button variant="outline" size="sm">
                    Track Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      $
                      {(
                        Number.parseFloat(order.total_amount) -
                        Number.parseFloat(order.shipping_cost) -
                        Number.parseFloat(order.tax_amount)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {Number.parseFloat(order.shipping_cost) === 0
                        ? "Free"
                        : `${Number.parseFloat(order.shipping_cost).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${Number.parseFloat(order.tax_amount).toFixed(2)}</span>
                  </div>
                  {Number.parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span>-${Number.parseFloat(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${Number.parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Payment Information</span>
                  </div>
                  <p className="text-sm">
                    Payment Status:{" "}
                    <Badge variant="outline" className={`ml-1 ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </p>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Need Help?
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
