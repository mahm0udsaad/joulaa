import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createOrder } from "@/lib/order-service"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured in environment variables")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { paymentIntentId, userId, cartItems, shippingDetails, totalAmount, shippingCost, saveAddress } = body

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 })
    }

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: `Payment not successful. Status: ${paymentIntent.status}`,
        },
        { status: 400 },
      )
    }

    // Format order items
    const orderItems = cartItems.map((item: any) => {
      const unitPrice = Number.parseFloat(item.price)
      const discountedPrice = item.discount ? unitPrice * (1 - Number.parseFloat(item.discount) / 100) : unitPrice

      return {
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: discountedPrice,
        cost_price: unitPrice * 0.6, // Assuming 40% margin
        subtotal: discountedPrice * item.quantity,
        color: item.selectedColor || null,
        shade: item.selectedShade || null,
        image_url: item.image_urls?.[0] || item.image || null,
      }
    })

    // Use shipping address as billing address if not provided separately
    const shippingAddressStr = JSON.stringify(shippingDetails)
    const billingAddressStr = shippingAddressStr // Use same address for billing

    // Create the order in the database
    const order = await createOrder(
      userId,
      orderItems,
      shippingAddressStr,
      billingAddressStr,
      totalAmount,
      shippingCost,
      0, // tax amount
      0, // discount amount
      paymentIntentId,
      "paid", // Explicitly set payment status to "paid"
    )

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        error: "An error occurred while creating the order",
      },
      { status: 500 },
    )
  }
}
