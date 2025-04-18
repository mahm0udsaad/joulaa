import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { sendOrderConfirmationEmail } from "@/lib/email-service"

export async function createOrder(
  userId: string | undefined,
  items: any[],
  shippingAddress: string,
  billingAddress: string,
  totalAmount: number,
  shippingCost: number,
  taxAmount: number,
  discountAmount: number,
  paymentIntentId: string,
  paymentStatus = "pending",
) {
  try {
    // Validate items first
    if (!items || items.length === 0) {
      throw new Error("No items provided for order")
    }
    console.log(items[0])
    // Validate each item has required fields
    items.forEach((item, index) => {
      if (!item.product_id) {
        throw new Error(`Item at index ${index} is missing an id`)
      }
    })

    const supabase = createClientComponentClient()

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId || null,
        total_amount: totalAmount,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        status: "processing",
        payment_status: paymentStatus,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_intent_id: paymentIntentId,
      })
      .select()
      .single()

    if (orderError) throw new Error(`Error creating order: ${orderError.message}`)

    // Create order items with validated data
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name || "Unknown Product",
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      cost_price: item.cost_price,
      subtotal: item.subtotal,
      color: item.selectedColor || null,
      shade: item.selectedShade || null,
      image_url: item.image_url || null,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) throw new Error(`Error creating order items: ${itemsError.message}`)

    // If we have a user ID, send an order confirmation email
    if (userId) {
      try {
        // Get user information
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("email, first_name, last_name")
          .eq("id", userId)
          .single()

        if (!userError && userData) {
          const userName = userData.first_name || userData.email.split("@")[0]
          const orderDate = new Date().toLocaleDateString()
          const orderTotal = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(totalAmount)

          // Send order confirmation email
          await sendOrderConfirmationEmail(userData.email, userName, order.id, orderDate, orderTotal, items)
        }
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError)
        // We don't fail the order creation if the email fails
      }
    }

    return order
  } catch (error) {
    console.error("Error in createOrder:", error)
    throw error
  }
}

export async function getOrderById(orderId: string) {
  try {
    const supabase = createClientComponentClient()

    // Get the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single()

    if (orderError) throw new Error(`Error fetching order: ${orderError.message}`)

    return order
  } catch (error) {
    console.error("Error in getOrderById:", error)
    throw error
  }
}

// Keep the original function name for backward compatibility
export async function getUserOrders(userId: string) {
  try {
    const supabase = createClientComponentClient()

    // Get all orders for the user with their order items
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`)

    return orders
  } catch (error) {
    console.error("Error in getUserOrders:", error)
    throw error
  }
}

// New function name (can be used in future code)
export async function getOrdersByUser(userId: string) {
  return getUserOrders(userId)
}

export async function getAllOrders() {
  try {
    const supabase = createClientComponentClient()

    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        users:user_id (email, first_name, last_name)
      `)
      .order("created_at", { ascending: false })

    if (ordersError) throw new Error(`Error fetching orders: ${ordersError.message}`)

    return orders
  } catch (error) {
    console.error("Error in getAllOrders:", error)
    throw error
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = createClientComponentClient()

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (error) throw new Error(`Error updating order status: ${error.message}`)

    return { success: true }
  } catch (error) {
    console.error("Error in updateOrderStatus:", error)
    return { success: false, error: error.message }
  }
}
