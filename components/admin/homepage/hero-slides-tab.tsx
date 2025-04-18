"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Trash2, Loader2, ImageIcon, LinkIcon } from "lucide-react"
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
import type { HeroSlide } from "@/lib/types"

export default function HeroSlidesTab() {
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [isLoadingHeroSlides, setIsLoadingHeroSlides] = useState(false)
  const [heroDialogOpen, setHeroDialogOpen] = useState(false)
  const [currentHero, setCurrentHero] = useState<HeroSlide | null>(null)

  useEffect(() => {
    fetchHeroSlides()
  }, [])

  const fetchHeroSlides = async () => {
    setIsLoadingHeroSlides(true)
    try {
      const { data, error } = await supabase.from("hero_slides").select("*").order("order", { ascending: true })

      if (error) throw error
      setHeroSlides(data || [])
    } catch (error) {
      console.error("Error fetching hero slides:", error)
      toast({
        title: "Error",
        description: "Failed to fetch hero slides. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHeroSlides(false)
    }
  }

  // Edit hero slide
  const editHeroSlide = (slide: HeroSlide) => {
    setCurrentHero(slide)
    setHeroDialogOpen(true)
  }

  // Add new hero slide
  const addNewHeroSlide = () => {
    setCurrentHero(null)
    setHeroDialogOpen(true)
  }

  // Save hero slide
  const saveHeroSlide = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const slideData = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      button_text: formData.get("buttonText") as string,
      button_link: formData.get("buttonLink") as string,
      image_url: formData.get("image") as string,
      order: currentHero?.order || heroSlides.length + 1,
      active: formData.get("active") === "on",
    }

    try {
      if (currentHero) {
        // Update existing slide
        const { error } = await supabase.from("hero_slides").update(slideData).eq("id", currentHero.id)

        if (error) throw error

        setHeroSlides(heroSlides.map((slide) => (slide.id === currentHero.id ? { ...slide, ...slideData } : slide)))

        toast({
          title: "Slide updated",
          description: "Hero slide has been updated successfully.",
        })
      } else {
        // Create new slide
        const { data, error } = await supabase.from("hero_slides").insert(slideData).select()

        if (error) throw error

        setHeroSlides([...heroSlides, data[0]])

        toast({
          title: "Slide added",
          description: "New hero slide has been added successfully.",
        })
      }

      setHeroDialogOpen(false)
    } catch (error) {
      console.error("Error saving hero slide:", error)
      toast({
        title: "Error",
        description: "Failed to save hero slide. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete hero slide
  const deleteHeroSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero slide?")) return

    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id)

      if (error) throw error

      setHeroSlides(heroSlides.filter((slide) => slide.id !== id))

      toast({
        title: "Slide deleted",
        description: "Hero slide has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting hero slide:", error)
      toast({
        title: "Error",
        description: "Failed to delete hero slide. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle hero slide active state
  const toggleHeroSlideActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from("hero_slides").update({ active }).eq("id", id)

      if (error) throw error

      setHeroSlides(heroSlides.map((slide) => (slide.id === id ? { ...slide, active } : slide)))

      toast({
        title: active ? "Slide activated" : "Slide deactivated",
        description: `The hero slide has been ${active ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating hero slide:", error)
      toast({
        title: "Error",
        description: "Failed to update hero slide. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Hero Slides Manager</CardTitle>
            <CardDescription>Manage your hero slides here. You can add, edit, or remove slides.</CardDescription>
          </div>
          <Button onClick={addNewHeroSlide} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Hero Slide
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingHeroSlides ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading hero slides...</p>
            </div>
          ) : heroSlides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hero slides found. Click "Add Hero Slide" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroSlides.map((slide) => (
                <div key={slide.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={slide.image_url || "/placeholder.svg?height=400&width=600"}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{slide.title}</h3>
                        <p className="text-gray-600 text-sm">{slide.subtitle}</p>
                      </div>
                      <div className="flex items-center">
                        {slide.active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Active</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">{slide.button_text}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-500 truncate">{slide.button_link}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => editHeroSlide(slide)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteHeroSlide(slide.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`active-${slide.id}`}
                          checked={slide.active}
                          onCheckedChange={(checked) => toggleHeroSlideActive(slide.id, checked)}
                        />
                        <Label htmlFor={`active-${slide.id}`}>{slide.active ? "Active" : "Inactive"}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hero Slide Dialog */}
      <Dialog open={heroDialogOpen} onOpenChange={setHeroDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentHero ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
            <DialogDescription>
              {currentHero ? "Update the details of this hero slide." : "Create a new hero slide for your homepage."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveHeroSlide}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={currentHero?.title || ""}
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
                  defaultValue={currentHero?.subtitle || ""}
                  className="col-span-3"
                  required
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
                    defaultValue={currentHero?.image_url || ""}
                    className="flex-grow"
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonText" className="text-right">
                  Button Text
                </Label>
                <Input
                  id="buttonText"
                  name="buttonText"
                  defaultValue={currentHero?.button_text || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonLink" className="text-right">
                  Button Link
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="buttonLink"
                    name="buttonLink"
                    defaultValue={currentHero?.button_link || ""}
                    className="flex-grow"
                    required
                  />
                  <Button type="button" variant="outline" size="icon">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <div className="flex items-center gap-2">
                  <Switch id="active" name="active" defaultChecked={currentHero?.active ?? true} />
                  <Label htmlFor="active">Show this slide</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHeroDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
