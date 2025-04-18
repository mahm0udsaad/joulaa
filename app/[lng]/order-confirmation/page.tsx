"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const paymentIntent = searchParams.get("payment_intent")
  const paymentStatus = searchParams.get("redirect_status")

  useEffect(() => {
    // You could send this to your backend to update order status
    if (paymentIntent && paymentStatus === "succeeded") {
      console.log("Payment successful:", paymentIntent)
    }
  }, [paymentIntent, paymentStatus])

  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Thank You for Your Order!</h1>
        <p className="text-muted-foreground mb-8">
          Your payment has been processed successfully. We'll send you an email confirmation with your order details and
          tracking information once your order ships.
        </p>
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
          <Link href="/account">
            <Button variant="outline" className="w-full">
              View Order History
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
