import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

// Import the necessary functions for seeding profit data
import { supabase } from "@/lib/supabase"

// Add a function to seed sample order data with profit information
async function seedSampleProfitData() {
  // Check if we already have orders with cost_price data
  const { count, error: countError } = await supabase
    .from("order_items")
    .select("*", { count: "exact", head: true })
    .not("cost_price", "is", null)

  if (countError) {
    console.error("Error checking for profit data:", countError)
    return
  }

  // If we already have some profit data, don't seed
  if (count && count > 0) {
    return
  }

  console.log("Seeding sample profit data...")

  // Get existing orders that don't have cost_price
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("id, unit_price, quantity")
    .is("cost_price", null)
    .limit(50)

  if (itemsError || !orderItems || orderItems.length === 0) {
    console.error("Error fetching order items or no items found:", itemsError)
    return
  }

  // Update order items with sample cost prices (60-80% of unit price)
  const updates = orderItems.map((item) => {
    const unitPrice = Number.parseFloat(item.unit_price)
    // Random cost between 60-80% of the unit price
    const costPercentage = 0.6 + Math.random() * 0.2
    const costPrice = (unitPrice * costPercentage).toFixed(2)

    return {
      id: item.id,
      cost_price: costPrice,
    }
  })

  // Update in batches of 10
  for (let i = 0; i < updates.length; i += 10) {
    const batch = updates.slice(i, i + 10)
    const { error: updateError } = await supabase.from("order_items").upsert(batch)

    if (updateError) {
      console.error("Error updating order items with cost prices:", updateError)
    }
  }

  console.log("Sample profit data seeded successfully")
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/auth/sign-in?redirect=/admin`)
  }

  // Fetch the user's profile to check their role
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    // Handle the error appropriately, maybe redirect to an error page
    return <div>Error: Could not load user profile</div>
  }

  if (profile?.role !== "admin") {
    redirect("/account")
  }

  // Seed sample profit data when the admin layout loads
  await seedSampleProfitData()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  )
}
