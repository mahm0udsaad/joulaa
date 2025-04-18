"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Trash2, Loader2, ImageIcon, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SectionCardItem } from "@/lib/types"

export default function SectionCardsTab() {
  const [sectionCards, setSectionCards] = useState<any[]>([])
  const [isLoadingSectionCards, setIsLoadingSectionCards] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [currentCard, setCurrentCard] = useState<SectionCardItem | null>(null)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    fetchSectionCards()
  }, [])

  const fetchSectionCards = async () => {
    setIsLoadingSectionCards(true)
    try {
      const { data, error } = await supabase.from("section_cards").select("*")

      if (error && error.code === "42P01") {
        // Table doesn't exist
        setSectionCards([])
        setShowSeedModal(true)
      } else if (error) {
        throw error
      } else {
        setSectionCards(data || [])
        if (data.length === 0) {
          setShowSeedModal(true)
        }
      }
    } catch (error) {
      console.error("Error fetching section cards:", error)
      toast({
        title: "Error",
        description: "Failed to fetch section cards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSectionCards(false)
    }
  }

  // Edit section card
  const editSectionCard = (card: SectionCardItem) => {
    setCurrentCard(card)
    setCardDialogOpen(true)
  }

  // Add new section card
  const addNewSectionCard = () => {
    setCurrentCard(null)
    setCardDialogOpen(true)
  }

  // Save section card
  const saveSectionCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const cardData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image") as string,
      button_text: formData.get("buttonText") as string,
      button_link: formData.get("buttonLink") as string,
      position: formData.get("position") as string,
      card_type: formData.get("cardType") as string,
      active: formData.get("active") === "on",
    }

    try {
      if (currentCard) {
        // Update existing card
        const { error } = await supabase.from("section_cards").update(cardData).eq("id", currentCard.id)

        if (error) throw error

        setSectionCards(sectionCards.map((card) => (card.id === currentCard.id ? { ...card, ...cardData } : card)))

        toast({
          title: "Card updated",
          description: "Section card has been updated successfully.",
        })
      } else {
        // Create new card
        const { data, error } = await supabase.from("section_cards").insert(cardData).select()

        if (error) throw error

        setSectionCards([...sectionCards, data[0]])

        toast({
          title: "Card added",
          description: "New section card has been added successfully.",
        })
      }

      setCardDialogOpen(false)
    } catch (error) {
      console.error("Error saving section card:", error)
      toast({
        title: "Error",
        description: "Failed to save section card. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete section card
  const deleteSectionCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section card?")) return

    try {
      const { error } = await supabase.from("section_cards").delete().eq("id", id)

      if (error) throw error

      setSectionCards(sectionCards.filter((card) => card.id !== id))

      toast({
        title: "Card deleted",
        description: "Section card has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting section card:", error)
      toast({
        title: "Error",
        description: "Failed to delete section card. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle section card active state
  const toggleSectionCardActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from("section_cards").update({ active }).eq("id", id)

      if (error) throw error

      setSectionCards(sectionCards.map((card) => (card.id === id ? { ...card, active } : card)))

      toast({
        title: active ? "Card activated" : "Card deactivated",
        description: `The section card has been ${active ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating section card:", error)
      toast({
        title: "Error",
        description: "Failed to update section card. Please try again.",
        variant: "destructive",
      })
    }
  }

  const seedSectionCards = async () => {
    setIsSeeding(true)
    try {
      // Create the table first
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS section_cards (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          subtitle TEXT,
          description TEXT,
          image_url TEXT,
          button_text TEXT,
          button_link TEXT,
          active BOOLEAN DEFAULT true,
          position TEXT,
          card_type TEXT,
          end_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      // Execute the create table SQL
      const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (createError) throw createError

      // Seed initial data
      const seedDataSQL = `
        INSERT INTO section_cards (title, subtitle, description, image_url, button_text, button_link, active, position, card_type)
        VALUES 
          ('Summer Sale', 'Up to 40% off', null, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Shop Now', '/category/summer-sale', true, 'trending', 'promo'),
          ('New Arrivals', 'Fresh looks for spring', 'Discover our latest collection of makeup products', 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Explore', '/new-arrivals', true, 'new-arrivals', 'category'),
          ('Best Sellers', 'Customer favorites', 'Our most popular products that everyone loves', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'View All', '/best-sellers', true, 'best-sellers', 'product');
      `

      // Execute the seed data SQL
      const { error: seedError } = await supabase.rpc("exec_sql", { sql: seedDataSQL })

      if (seedError) throw seedError

      toast({
        title: "Success",
        description: "Section cards table created and seeded successfully.",
      })

      // Refresh the data
      fetchSectionCards()
      setShowSeedModal(false)
    } catch (error) {
      console.error("Error seeding section cards:", error)
      toast({
        title: "Error",
        description: "Failed to seed section cards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Section Cards Manager</CardTitle>
            <CardDescription>
              Manage your promotional section cards here. You can add, edit, or remove cards.
            </CardDescription>
          </div>
          <Button onClick={addNewSectionCard} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Section Card
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingSectionCards ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading section cards...</p>
            </div>
          ) : sectionCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No section cards found. Click "Add Section Card" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectionCards.map((card) => (
                <div key={card.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={card.image_url || "/placeholder.svg?height=400&width=600"}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{card.title}</h3>
                        {card.subtitle && <p className="text-gray-600 text-sm">{card.subtitle}</p>}
                        {card.description && <p className="text-gray-600 text-sm line-clamp-2">{card.description}</p>}
                      </div>
                      <div className="flex items-center">
                        {card.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Active</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">{card.position}</span>
                      {card.card_type && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{card.card_type}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">{card.button_text}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-500 truncate">{card.button_link}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editSectionCard(card)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteSectionCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${card.id}`}
                          checked={card.active}
                          onCheckedChange={(checked) => toggleSectionCardActive(card.id, checked)}
                        />
                        <Label htmlFor={`active-${card.id}`}>{card.active ? "Active" : "Inactive"}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Card Dialog */}
      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentCard ? "Edit Section Card" : "Add Section Card"}</DialogTitle>
            <DialogDescription>
              {currentCard
                ? "Update the details of this section card."
                : "Create a new section card for your homepage."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveSectionCard}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={currentCard?.title || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subtitle" className="text-right">
                  Subtitle
                </Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  defaultValue={currentCard?.subtitle || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={currentCard?.description || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Image URL
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="image"
                    name="image"
                    defaultValue={currentCard?.image_url || ""}
                    className="flex-grow"
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Position
                </Label>
                <Select name="position" defaultValue={currentCard?.position || "trending"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending Products</SelectItem>
                    <SelectItem value="featured">Featured Products</SelectItem>
                    <SelectItem value="new-arrivals">New Arrivals</SelectItem>
                    <SelectItem value="best-sellers">Best Sellers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cardType" className="text-right">
                  Card Type
                </Label>
                <Select name="cardType" defaultValue={currentCard?.card_type || "promo"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promo">Promotional</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonText" className="text-right">
                  Button Text
                </Label>
                <Input
                  id="buttonText"
                  name="buttonText"
                  defaultValue={currentCard?.button_text || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonLink" className="text-right">
                  Button Link
                </Label>
                <Input
                  id="buttonLink"
                  name="buttonLink"
                  defaultValue={currentCard?.button_link || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <div className="flex items-center gap-2">
                  <Switch id="active" name="active" defaultChecked={currentCard?.active ?? true} />
                  <Label htmlFor="active">Show this card</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCardDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Seed Data Modal */}
      <Dialog open={showSeedModal} onOpenChange={setShowSeedModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Section Cards Table Setup</DialogTitle>
            <DialogDescription>
              The section_cards table doesn't exist or is empty. Would you like to create it and seed some initial data?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-sm font-medium mb-2">Create Table SQL</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`CREATE TABLE IF NOT EXISTS section_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  active BOOLEAN DEFAULT true,
  position TEXT,
  card_type TEXT,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
              </pre>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-sm font-medium mb-2">Seed Data SQL</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`INSERT INTO section_cards (title, subtitle, description, image_url, button_text, button_link, active, position, card_type)
VALUES 
  ('Summer Sale', 'Up to 40% off', null, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Shop Now', '/category/summer-sale', true, 'trending', 'promo'),
  ('New Arrivals', 'Fresh looks for spring', 'Discover our latest collection of makeup products', 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Explore', '/new-arrivals', true, 'new-arrivals', 'category'),
  ('Best Sellers', 'Customer favorites', 'Our most popular products that everyone loves', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'View All', '/best-sellers', true, 'best-sellers', 'product');`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSeedModal(false)}>
              Cancel
            </Button>
            <Button onClick={seedSectionCards} disabled={isSeeding} className="flex items-center gap-2">
              {isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Create Table & Seed Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
