import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not configured in environment variables",
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be a positive number." },
        { status: 400 },
      );
    }

    // Convert amount to cents and ensure it's at least 50 cents (Stripe minimum)
    const amountInCents = Math.max(Math.round(amount * 100), 50);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderTime: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while processing your payment." },
      { status: 500 },
    );
  }
}
