"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import Image from "next/image"
import { products } from "@/lib/data"

export default function OffersTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [newOffer, setNewOffer] = useState({
    discountPercentage: "",
    startDate: "",
    endDate: "",
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewOffer((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log("New offer:", { ...newOffer, productId: selectedProduct.id })
    // Reset form
    setNewOffer({
      discountPercentage: "",
      startDate: "",
      endDate: "",
    })
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={product.image_urls[0] || "/placeholder.svg"}
                alt={product.name}
                layout="fill"
                objectFit="cover"
              />
              {product.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                  {(product.discount * 100).toFixed(0)}% OFF
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedProduct(product)}>
                    {product.discount > 0 ? "Update Offer" : "Add Offer"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{product.discount > 0 ? "Update Offer" : "Add Offer"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="discountPercentage">Discount Percentage</Label>
                      <Input
                        id="discountPercentage"
                        name="discountPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={newOffer.discountPercentage}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={newOffer.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={newOffer.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit">Save Offer</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
