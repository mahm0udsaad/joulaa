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

export default function PromoSectionsTab() {
  const [promoSections, setPromoSections] = useState<any[]>([])
  const [isLoadingPromoSections, setIsLoadingPromoSections] = useState(false)
  const [promoSectionDialogOpen, setPromoSectionDialogOpen] = useState(false)
  const [currentPromoSection, setCurrentPromoSection] = useState<any>(null)
  const [showSeedModal, setShowSeedModal] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    fetchPromoSections()
  }, [])

  const fetchPromoSections = async () => {
    setIsLoadingPromoSections(true)
    try {
      const { data, error } = await supabase.from("promo_sections").select("*")

      if (error && error.code === "42P01") {
        // Table doesn't exist
        setPromoSections([])
        setShowSeedModal(true)
      } else if (error) {
        throw error
      } else {
        setPromoSections(data || [])
        if (data.length === 0) {
          setShowSeedModal(true)
        }
      }
    } catch (error) {
      console.error("Error fetching promo sections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch promo sections. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPromoSections(false)
    }
  }

  // Edit promo section
  const editPromoSection = (section: any) => {
    setCurrentPromoSection(section)
    setPromoSectionDialogOpen(true)
  }

  // Add new promo section
  const addNewPromoSection = () => {
    setCurrentPromoSection(null)
    setPromoSectionDialogOpen(true)
  }

  // Save promo section
  const savePromoSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const sectionData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      button_text: formData.get("button_text") as string,
      button_link: formData.get("button_link") as string,
      background_color: formData.get("background_color") as string,
      text_color: formData.get("text_color") as string,
      active: formData.get("active") === "on",
    }

    try {
      if (currentPromoSection) {
        // Update existing section
        const { error } = await supabase.from("promo_sections").update(sectionData).eq("id", currentPromoSection.id)

        if (error) throw error

        setPromoSections(
          promoSections.map((section) =>
            section.id === currentPromoSection.id ? { ...section, ...sectionData } : section,
          ),
        )

        toast({
          title: "Promo section updated",
          description: "The promo section has been updated successfully.",
        })
      } else {
        // Create new section
        const { data, error } = await supabase.from("promo_sections").insert(sectionData).select()

        if (error) throw error

        setPromoSections([...promoSections, data[0]])

        toast({
          title: "Promo section created",
          description: "New promo section has been created successfully.",
        })
      }

      setPromoSectionDialogOpen(false)
    } catch (error) {
      console.error("Error saving promo section:", error)
      toast({
        title: "Error",
        description: "Failed to save promo section. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete promo section
  const deletePromoSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo section?")) return

    try {
      const { error } = await supabase.from("promo_sections").delete().eq("id", id)

      if (error) throw error

      setPromoSections(promoSections.filter((section) => section.id !== id))

      toast({
        title: "Promo section deleted",
        description: "The promo section has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting promo section:", error)
      toast({
        title: "Error",
        description: "Failed to delete promo section. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle promo section active state
  const togglePromoSectionActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from("promo_sections").update({ active }).eq("id", id)

      if (error) throw error

      setPromoSections(promoSections.map((section) => (section.id === id ? { ...section, active } : section)))

      toast({
        title: active ? "Promo section activated" : "Promo section deactivated",
        description: `The promo section has been ${active ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating promo section:", error)
      toast({
        title: "Error",
        description: "Failed to update promo section. Please try again.",
        variant: "destructive",
      })
    }
  }

  const seedPromoSections = async () => {
    setIsSeeding(true)
    try {
      // Create the table first
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS promo_sections (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          subtitle TEXT,
          description TEXT,
          image_url TEXT,
          button_text TEXT,
          button_link TEXT,
          background_color TEXT,
          text_color TEXT,
          active BOOLEAN DEFAULT true,
          order_position INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `

      // Execute the create table SQL
      const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (createError) throw createError

      // Seed initial data
      const seedDataSQL = `
        INSERT INTO promo_sections (title, subtitle, description, image_url, button_text, button_link, background_color, text_color, active)
        VALUES 
          ('Spring Collection', 'New Season, New Look', 'Discover our latest spring collection with fresh colors and innovative formulas.', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Shop Collection', '/collections/spring', 'bg-rose-100', 'text-rose-900', true),
          ('Eco-Friendly Products', 'Beauty that cares', 'Our eco-friendly line is made with sustainable ingredients and packaging.', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Explore', '/collections/eco-friendly', 'bg-green-100', 'text-green-900', true),
          ('Luxury Skincare', 'Treat Your Skin', 'Premium skincare products designed to nourish and rejuvenate.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'View Products', '/category/skincare', 'bg-blue-100', 'text-blue-900', true);
      `

      // Execute the seed data SQL
      const { error: seedError } = await supabase.rpc("exec_sql", { sql: seedDataSQL })

      if (seedError) throw seedError

      toast({
        title: "Success",
        description: "Promo sections table created and seeded successfully.",
      })

      // Refresh the data
      fetchPromoSections()
      setShowSeedModal(false)
    } catch (error) {
      console.error("Error seeding promo sections:", error)
      toast({
        title: "Error",
        description: "Failed to seed promo sections. Please try again.",
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
            <CardTitle>Promo Sections Manager</CardTitle>
            <CardDescription>
              Manage your promotional sections here. You can add, edit, or remove promotional banners and offers.
            </CardDescription>
          </div>
          <Button onClick={addNewPromoSection} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Promo Section
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingPromoSections ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading promo sections...</p>
            </div>
          ) : promoSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No promo sections found. Click "Add Promo Section" to create one.
            </div>
          ) : (
            <div className="space-y-6">
              {promoSections.map((promo) => (
                <div
                  key={promo.id}
                  className={`border rounded-lg overflow-hidden ${promo.background_color || "bg-gray-100"}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className={`font-bold text-xl mb-1 ${promo.text_color || "text-gray-900"}`}>
                            {promo.title}
                          </h3>
                          <p className={`text-lg mb-2 ${promo.text_color || "text-gray-900"}`}>{promo.subtitle}</p>
                          <p className={`text-sm mb-4 line-clamp-3 ${promo.text_color || "text-gray-900"}`}>
                            {promo.description}
                          </p>
                        </div>
                        {promo.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <span className="bg-white/20 px-2 py-1 rounded">{promo.button_text}</span>
                        <span className="text-gray-700">→</span>
                        <span className="text-gray-700 truncate">{promo.button_link}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editPromoSection(promo)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deletePromoSection(promo.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <div className="ml-auto flex items-center gap-2">
                          <Switch
                            id={`active-${promo.id}`}
                            checked={promo.active}
                            onCheckedChange={(checked) => togglePromoSectionActive(promo.id, checked)}
                          />
                          <Label htmlFor={`active-${promo.id}`}>{promo.active ? "Active" : "Inactive"}</Label>
                        </div>
                      </div>
                    </div>
                    <div className="h-64 md:h-auto">
                      <Image
                        src={promo.image_url || "/placeholder.svg?height=400&width=600"}
                        alt={promo.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promo Section Dialog */}
      <Dialog open={promoSectionDialogOpen} onOpenChange={setPromoSectionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentPromoSection ? "Edit Promo Section" : "Add Promo Section"}</DialogTitle>
            <DialogDescription>
              {currentPromoSection
                ? "Update the details of this promotional section."
                : "Create a new promotional section for your homepage."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={savePromoSection} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={currentPromoSection?.title || ""} required />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input id="subtitle" name="subtitle" defaultValue={currentPromoSection?.subtitle || ""} required />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={currentPromoSection?.description || ""}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={currentPromoSection?.image_url || ""}
                    className="flex-grow"
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                {currentPromoSection?.image_url && (
                  <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden border">
                    <Image
                      src={currentPromoSection.image_url || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    name="button_text"
                    defaultValue={currentPromoSection?.button_text || ""}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="button_link">Button Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_link"
                      name="button_link"
                      defaultValue={currentPromoSection?.button_link || ""}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="background_color">Background Color</Label>
                  <Select name="background_color" defaultValue={currentPromoSection?.background_color || "bg-rose-100"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-rose-100">Rose</SelectItem>
                      <SelectItem value="bg-purple-100">Purple</SelectItem>
                      <SelectItem value="bg-pink-100">Pink</SelectItem>
                      <SelectItem value="bg-blue-100">Blue</SelectItem>
                      <SelectItem value="bg-yellow-100">Yellow</SelectItem>
                      <SelectItem value="bg-green-100">Green</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="text_color">Text Color</Label>
                  <Select name="text_color" defaultValue={currentPromoSection?.text_color || "text-rose-900"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-rose-900">Rose</SelectItem>
                      <SelectItem value="text-purple-900">Purple</SelectItem>
                      <SelectItem value="text-pink-900">Pink</SelectItem>
                      <SelectItem value="text-blue-900">Blue</SelectItem>
                      <SelectItem value="text-yellow-900">Yellow</SelectItem>
                      <SelectItem value="text-green-900">Green</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="active" name="active" defaultChecked={currentPromoSection?.active ?? true} />
                <Label htmlFor="active">Show this section</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPromoSectionDialogOpen(false)}>
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
            <DialogTitle>Promo Sections Table Setup</DialogTitle>
            <DialogDescription>
              The promo_sections table doesn't exist or is empty. Would you like to create it and seed some initial
              data?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-sm font-medium mb-2">Create Table SQL</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`CREATE TABLE IF NOT EXISTS promo_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  background_color TEXT,
  text_color TEXT,
  active BOOLEAN DEFAULT true,
  order_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
              </pre>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-sm font-medium mb-2">Seed Data SQL</h3>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`INSERT INTO promo_sections (title, subtitle, description, image_url, button_text, button_link, background_color, text_color, active)
VALUES 
  ('Spring Collection', 'New Season, New Look', 'Discover our latest spring collection with fresh colors and innovative formulas.', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Shop Collection', '/collections/spring', 'bg-rose-100', 'text-rose-900', true),
  ('Eco-Friendly Products', 'Beauty that cares', 'Our eco-friendly line is made with sustainable ingredients and packaging.', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'Explore', '/collections/eco-friendly', 'bg-green-100', 'text-green-900', true),
  ('Luxury Skincare', 'Treat Your Skin', 'Premium skincare products designed to nourish and rejuvenate.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80', 'View Products', '/category/skincare', 'bg-blue-100', 'text-blue-900', true);`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSeedModal(false)}>
              Cancel
            </Button>
            <Button onClick={seedPromoSections} disabled={isSeeding} className="flex items-center gap-2">
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
