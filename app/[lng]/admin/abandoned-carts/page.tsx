"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search } from "lucide-react"

// Mock data for abandoned carts
const mockAbandonedCarts = [
  {
    id: "AC001",
    customerName: "John Doe",
    products: ["Lipstick", "Eyeshadow"],
    totalValue: 59.99,
    lastUpdated: "2023-05-15",
    status: "Open",
  },
  {
    id: "AC002",
    customerName: "Jane Smith",
    products: ["Foundation", "Blush", "Mascara"],
    totalValue: 89.97,
    lastUpdated: "2023-05-14",
    status: "Open",
  },
  {
    id: "AC003",
    customerName: "Guest",
    products: ["Nail Polish", "Makeup Remover"],
    totalValue: 24.98,
    lastUpdated: "2023-05-13",
    status: "Expired",
  },
  // Add more mock data as needed
]

export default function AbandonedCartsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("lastUpdated")
  const [carts, setCarts] = useState(mockAbandonedCarts)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    // Implement search logic here
  }

  const handleSort = (value: string) => {
    setSortBy(value)
    // Implement sort logic here
  }

  const handleAction = (action: string, cartId: string) => {
    console.log(`Action ${action} for cart ${cartId}`)
    // Implement action logic here
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Abandoned Carts</h1>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search carts..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-64"
          />
        </div>
        <Select onValueChange={handleSort} defaultValue={sortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastUpdated">Last Updated</SelectItem>
            <SelectItem value="customerName">Customer Name</SelectItem>
            <SelectItem value="totalValue">Cart Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cart ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.map((cart) => (
            <TableRow key={cart.id}>
              <TableCell>{cart.id}</TableCell>
              <TableCell>{cart.customerName}</TableCell>
              <TableCell>{cart.products.join(", ")}</TableCell>
              <TableCell>${cart.totalValue.toFixed(2)}</TableCell>
              <TableCell>{cart.lastUpdated}</TableCell>
              <TableCell>{cart.status}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleAction("sendEmail", cart.id)}>
                      Send Reminder Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("applyDiscount", cart.id)}>
                      Apply Discount Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("recoverCart", cart.id)}>
                      Recover Cart
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction("deleteCart", cart.id)}>Delete Cart</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
