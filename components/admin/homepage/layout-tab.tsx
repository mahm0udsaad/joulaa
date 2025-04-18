"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function LayoutTab() {
  const [homepageLayout, setHomepageLayout] = useState<any[]>([])
  const [isLoadingHomepageLayout, setIsLoadingHomepageLayout] = useState(false)

  useEffect(() => {
    fetchHomepageLayout()
  }, [])

  const fetchHomepageLayout = async () => {
    setIsLoadingHomepageLayout(true)
    try {
      const { data, error } = await supabase.from("homepage_layout").select("*").order("order", { ascending: true })

      if (error) throw error
      setHomepageLayout(data || [])
    } catch (error) {
      console.error("Error fetching homepage layout:", error)
      toast({
        title: "Error",
        description: "Failed to fetch homepage layout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHomepageLayout(false)
    }
  }

  const toggleSectionActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from("homepage_layout").update({ active }).eq("id", id)

      if (error) throw error

      setHomepageLayout(homepageLayout.map((section) => (section.id === id ? { ...section, active } : section)))

      toast({
        title: active ? "Section activated" : "Section deactivated",
        description: `The section has been ${active ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating section:", error)
      toast({
        title: "Error",
        description: "Failed to update section. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Layout Manager</CardTitle>
          <CardDescription>
            Manage the layout of your homepage sections here. You can reorder sections and toggle their visibility.
          </CardDescription>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingHomepageLayout ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading homepage layout...</p>
          </div>
        ) : homepageLayout.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No layout sections found. Click "Add Section" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {homepageLayout.map((section, index) => (
              <div key={section.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-md p-2 text-gray-500 w-8 h-8 flex items-center justify-center">
                    {section.order}
                  </div>
                  <div>
                    <h3 className="font-medium">{section.section_name}</h3>
                    <p className="text-sm text-gray-500">{section.component}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`active-${section.id}`}
                    checked={section.active}
                    onCheckedChange={(checked) => toggleSectionActive(section.id, checked)}
                  />
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
