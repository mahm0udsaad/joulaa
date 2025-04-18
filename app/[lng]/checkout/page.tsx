"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useCart } from "@/components/cart-provider"
import { getDiscountedPrice } from "@/lib/data"
import { PaymentForm } from "@/components/payment-form"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not configured in environment variables")
}

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const [clientSecret, setClientSecret] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
    country: "",
    phone: "",
  })
  const [hasShippingInfo, setHasShippingInfo] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [saveAddress, setSaveAddress] = useState(true)
  const router = useRouter()

  const { user } = useAuth()

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      // Fetch user profile from Supabase
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

          if (error) {
            console.error("Error fetching user profile:", error)
            return
          }

          if (data) {
            // Check if user has shipping information
            const hasInfo = !!(data.address && data.city && data.state && data.zip_code && data.country && data.phone)

            setHasShippingInfo(hasInfo)
            setEditingAddress(!hasInfo) // Only edit if no shipping info exists

            setShippingDetails({
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: user.email || "",
              address: data.address || "",
              city: data.city || "",
              postalCode: data.zip_code || "",
              state: data.state || "",
              country: data.country || "",
              phone: data.phone || "",
            })
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
        }
      }

      fetchUserProfile()
    }
  }, [user])

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const fieldName = id.includes("-") ? id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : id

    setShippingDetails((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handlePaymentSuccess = () => {
    clearCart()
    router.push("/order-confirmation")
  }

  // Helper function to get a valid image URL
  const getImageUrl = (item: any) => {
    // Check for image_urls array first
    if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
      return item.image_urls[0]
    }
    // Then check for direct image property
    if (item.image) {
      return item.image
    }
    return "/placeholder.svg"
  }

  useEffect(() => {
    if (total > 0) {
      setLoading(true)
      setError("")

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: total }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || "Failed to create payment intent")
          }
          return res.json()
        })
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            throw new Error("No client secret received")
          }
        })
        .catch((err) => {
          console.error("Payment initialization error:", err)
          setError(err.message || "Failed to initialize payment. Please try again.")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [total, user])

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          You don't have any items in your cart yet. Start shopping to add products.
        </p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  // Validate shipping details before allowing payment
  const isShippingValid = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "postalCode",
      "state",
      "country",
      "phone",
    ]

    return requiredFields.every((field) => shippingDetails[field as keyof typeof shippingDetails]?.trim())
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-8">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Continue Shopping
      </Link>

      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          {/* Shipping Information */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shipping Information</h2>
              {hasShippingInfo && !editingAddress && (
                <Button variant="outline" size="sm" onClick={() => setEditingAddress(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Change
                </Button>
              )}
            </div>

            {hasShippingInfo && !editingAddress ? (
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span className="font-medium">
                        {shippingDetails.firstName} {shippingDetails.lastName}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="font-medium">{shippingDetails.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="font-medium">{shippingDetails.phone}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="font-medium">{shippingDetails.address}</span>
                      <span className="font-medium">
                        {shippingDetails.city}, {shippingDetails.state} {shippingDetails.postalCode}
                      </span>
                      <span className="font-medium">{shippingDetails.country}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    required
                    value={shippingDetails.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    required
                    value={shippingDetails.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your street address"
                    required
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter your city"
                    required
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="Enter your postal code"
                    required
                    value={shippingDetails.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="Enter your state"
                    required
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Enter your country"
                    required
                    value={shippingDetails.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    required
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {user && (
                  <div className="sm:col-span-2 flex items-center space-x-2">
                    <Switch id="save-address" checked={saveAddress} onCheckedChange={setSaveAddress} />
                    <Label htmlFor="save-address">Save this address for future orders</Label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !isShippingValid() ? (
              <Alert>
                <AlertDescription>
                  Please complete all shipping information fields before proceeding to payment.
                </AlertDescription>
              </Alert>
            ) : (
              clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#dc2626",
                      },
                    },
                    loader: "auto",
                  }}
                >
                  <PaymentForm
                    clientSecret={clientSecret}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                    shippingDetails={shippingDetails}
                    cartItems={cart}
                    shippingCost={shipping}
                    subtotal={subtotal}
                    userId={user?.id}
                    saveAddress={saveAddress}
                  />
                </Elements>
              )
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg border sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="max-h-80 overflow-y-auto mb-4">
              {cart.map((item) => {
                const discountedPrice = getDiscountedPrice(item.price, item.discount)
                const imageUrl = getImageUrl(item)

                return (
                  <div
                    key={`${item.id}-${item.selectedColor || ""}-${item.selectedShade || ""}`}
                    className="flex py-3 border-b last:border-b-0"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                      <Image src={imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-sm">{item.name}</h3>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                      )}
                      {item.selectedShade && (
                        <p className="text-xs text-muted-foreground">Shade: {item.selectedShade}</p>
                      )}
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <span className="font-medium">
                          {(Number.parseFloat(discountedPrice) * item.quantity).toFixed(2)} AED
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `${shipping.toFixed(2)} AED`}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} AED</span>
              </div>
              <p className="text-xs text-muted-foreground">Estimated delivery: 3-5 business days</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
