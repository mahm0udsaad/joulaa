"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  clientSecret: string
  total: number
  onSuccess: () => void
  shippingDetails: any
  cartItems: any[]
  shippingCost: number
  subtotal: number
  userId?: string
  saveAddress: boolean
}

export function PaymentForm({
  clientSecret,
  total,
  onSuccess,
  shippingDetails,
  cartItems,
  shippingCost,
  subtotal,
  userId,
  saveAddress,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("")
  const router = useRouter()

  // Check if payment is complete on page load (for redirect returns)
  useEffect(() => {
    if (!stripe) {
      return
    }

    // Retrieve the PaymentIntent to check its status
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return

      switch (paymentIntent.status) {
        case "succeeded":
          setPaymentStatus("succeeded")
          // Create order after successful payment
          createOrder(paymentIntent.id)
          break
        case "processing":
          setPaymentStatus("processing")
          setError("Your payment is processing.")
          break
        case "requires_payment_method":
          setPaymentStatus("failed")
          setError("Your payment was not successful, please try again.")
          break
        default:
          setPaymentStatus("failed")
          setError("Something went wrong.")
          break
      }
    })
  }, [stripe])

  const createOrder = async (paymentIntentId: string) => {
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId,
          userId,
          cartItems,
          shippingDetails,
          totalAmount: total,
          shippingCost,
          saveAddress,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      // Call the onSuccess callback to clear cart and redirect
      onSuccess()
    } catch (error) {
      console.error("Error creating order:", error)
      setError("Payment was successful, but we couldn't create your order. Please contact support.")
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    // Use confirmPayment to handle the payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.href, // Return to the same page
        payment_method_data: {
          billing_details: {
            name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
            email: shippingDetails.email,
            phone: shippingDetails.phone,
            address: {
              line1: shippingDetails.address,
              city: shippingDetails.city,
              state: shippingDetails.state,
              postal_code: shippingDetails.postalCode,
              country: shippingDetails.country,
            },
          },
        },
      },
    })

    if (error) {
      console.error("Payment confirmation error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment succeeded, create order
      await createOrder(paymentIntent.id)
    }
  }

  // If payment already succeeded (after redirect), show success message
  if (paymentStatus === "succeeded") {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">Your order is being processed.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PaymentElement id="payment-element" />

      <Button type="submit" className="w-full" disabled={!stripe || processing}>
        {processing ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : (
          <>
            Pay {total.toFixed(2)} AED
            <CheckCircle2 className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
