import { ShoppingBag, Users, DollarSign, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PromoCodeGenerator } from "@/components/admin/promo-code-generator"
import { supabase } from "@/lib/supabase"
import { calculateProfitSummary } from "@/lib/profit-calculator"

async function getOrdersCount() {
  const { count, error } = await supabase.from("orders").select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error fetching orders count:", error)
    return 0
  }

  return count || 0
}

async function getCustomersCount() {
  const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })

  if (error) {
    console.error("Error fetching customers count:", error)
    return 0
  }

  return count || 0
}

async function getAbandonedCartsCount() {
  const { count, error } = await supabase
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("status", "abandoned")

  if (error) {
    console.error("Error fetching abandoned carts count:", error)
    return 0
  }

  return count || 0
}

async function getRecentOrders() {
  // Modified query to not rely on the relationship
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error fetching recent orders:", error)
    return []
  }

  // For each order, fetch the user details separately
  const ordersWithUserDetails = await Promise.all(
    orders.map(async (order) => {
      if (!order.user_id) {
        return {
          id: order.id,
          customer: "Guest",
          total: `$${Number.parseFloat(order.total_amount).toFixed(2)}`,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        }
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email, first_name, last_name")
        .eq("id", order.user_id)
        .single()

      if (userError || !userData) {
        console.error("Error fetching user for order:", userError)
        return {
          id: order.id,
          customer: "Unknown",
          total: `$${Number.parseFloat(order.total_amount).toFixed(2)}`,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        }
      }

      return {
        id: order.id,
        customer: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || userData.email,
        total: `$${Number.parseFloat(order.total_amount).toFixed(2)}`,
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      }
    }),
  )

  return ordersWithUserDetails
}

async function getRecentCustomers() {
  // Fetch recent users
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, created_at")
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("Error fetching recent customers:", error)
    return []
  }

  // For each user, count their orders separately
  const usersWithOrderCounts = await Promise.all(
    users.map(async (user) => {
      const { count, error: orderError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (orderError) {
        console.error("Error counting orders for user:", orderError)
        return {
          id: user.id,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
          email: user.email,
          orders: 0,
        }
      }

      return {
        id: user.id,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A",
        email: user.email,
        orders: count || 0,
      }
    }),
  )

  return usersWithOrderCounts
}

export default async function AdminDashboard() {
  const [ordersCount, customersCount, abandonedCartsCount, recentOrders, recentCustomers, profitSummary] =
    await Promise.all([
      getOrdersCount(),
      getCustomersCount(),
      getAbandonedCartsCount(),
      getRecentOrders(),
      getRecentCustomers(),
      calculateProfitSummary(),
    ])

  const totalRevenue = profitSummary?.totalRevenue || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandoned Carts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abandonedCartsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <ul className="space-y-2">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex justify-between items-center">
                    <span>
                      #{order.id} - {order.customer}
                    </span>
                    <span>
                      {order.total} ({order.status})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No orders yet</p>
            )}
            <Link href="/admin/orders" className="text-sm text-primary hover:underline mt-4 inline-block">
              View all orders
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCustomers.length > 0 ? (
              <ul className="space-y-2">
                {recentCustomers.map((customer) => (
                  <li key={customer.id} className="flex justify-between items-center">
                    <span>{customer.name || customer.email}</span>
                    <span>{customer.orders} orders</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No customers yet</p>
            )}
            <Link href="/admin/customers" className="text-sm text-primary hover:underline mt-4 inline-block">
              View all customers
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <PromoCodeGenerator />
      </div>
    </div>
  )
}
