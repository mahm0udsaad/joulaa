"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true)

        // First, get all users
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, email, first_name, last_name, created_at, phone, city, country")

        if (usersError) throw new Error(`Error fetching users: ${usersError.message}`)

        // For each user, get their orders
        const customersWithOrders = await Promise.all(
          users.map(async (user) => {
            const { data: orders, error: ordersError } = await supabase
              .from("orders")
              .select("id, total_amount, order_date, status")
              .eq("user_id", user.id)

            if (ordersError) {
              console.error(`Error fetching orders for user ${user.id}:`, ordersError)
              return {
                ...user,
                orders: [],
                totalSpent: 0,
                lastOrderDate: null,
              }
            }

            // Calculate total spent
            const totalSpent = orders?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount || 0), 0) || 0

            // Get last order date
            const lastOrder = orders?.sort(
              (a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime(),
            )[0]

            return {
              ...user,
              orders: orders || [],
              totalSpent,
              lastOrderDate: lastOrder?.order_date || null,
              orderCount: orders?.length || 0,
            }
          }),
        )

        setCustomers(customersWithOrders)
      } catch (error) {
        console.error("Error fetching customers:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [supabase])

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const searchString = searchTerm.toLowerCase()
    const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.toLowerCase()
    const email = (customer.email || "").toLowerCase()
    const location = `${customer.city || ""} ${customer.country || ""}`.toLowerCase()

    return fullName.includes(searchString) || email.includes(searchString) || location.includes(searchString)
  })

  // Get initials for avatar
  const getInitials = (customer) => {
    const firstName = customer.first_name || ""
    const lastName = customer.last_name || ""

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    } else if (firstName) {
      return firstName[0].toUpperCase()
    } else if (customer.email) {
      return customer.email[0].toUpperCase()
    } else {
      return "U"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Customers</h2>
        <p className="text-gray-700">{error}</p>
        <p className="mt-4 text-sm text-gray-500">Please check your database connection and try again.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>Export</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(customer)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {customer.first_name && customer.last_name
                                ? `${customer.first_name} ${customer.last_name}`
                                : customer.email.split("@")[0]}
                            </p>
                            <p className="text-sm text-gray-500">Since {formatDate(customer.created_at)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        {customer.city && customer.country
                          ? `${customer.city}, ${customer.country}`
                          : customer.city || customer.country || "N/A"}
                      </TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                      <TableCell>
                        <Badge variant={customer.orderCount > 0 ? "success" : "secondary"}>
                          {customer.orderCount > 0 ? "Active" : "New"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? "No customers match your search." : "No customers found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
