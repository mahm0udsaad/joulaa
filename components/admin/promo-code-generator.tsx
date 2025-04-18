"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export function PromoCodeGenerator() {
  const [promoCode, setPromoCode] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [expirationDate, setExpirationDate] = useState("")

  const generatePromoCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setPromoCode(code)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log({
      promoCode,
      discountType,
      discountValue,
      expirationDate,
    })
    toast({
      title: "Promo Code Generated",
      description: `Code: ${promoCode}, ${discountType} discount of ${discountValue}, expires on ${expirationDate}`,
    })
    // Reset form
    setPromoCode("")
    setDiscountValue("")
    setExpirationDate("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Promo Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="promoCode">Promo Code</Label>
            <div className="flex space-x-2">
              <Input
                id="promoCode"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter or generate code"
              />
              <Button type="button" onClick={generatePromoCode}>
                Generate
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select value={discountType} onValueChange={setDiscountType}>
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountValue">Discount Value</Label>
            <Input
              id="discountValue"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
            />
          </div>
          <div>
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <Button type="submit">Create Promo Code</Button>
        </form>
      </CardContent>
    </Card>
  )
}
