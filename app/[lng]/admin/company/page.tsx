"use client"

import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"

import { Input } from "@/components/ui/input"

import { CardContent } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"

export default function CompanyProfilePage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "JULIA Cosmetics",
    email: "info@juliacosmetics.com",
    phone: "+1 (555) 123-4567",
    address: "123 Beauty Lane, Makeup City, MC 12345",
    description: "JULIA Cosmetics is a premium beauty brand offering high-quality makeup and skincare products.",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompanyInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated info to your backend
    console.log("Updated company info:", companyInfo)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Company Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <Input id="name" name="name" value={companyInfo.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={companyInfo.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input id="phone" name="phone" value={companyInfo.phone} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <Input id="address" name="address" value={companyInfo.address} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={companyInfo.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
