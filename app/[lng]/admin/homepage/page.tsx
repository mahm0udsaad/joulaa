"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LayoutTab from "@/components/admin/homepage/layout-tab"
import HeroSlidesTab from "@/components/admin/homepage/hero-slides-tab"
import CategoriesTab from "@/components/admin/homepage/categories-tab"
import SectionCardsTab from "@/components/admin/homepage/section-cards-tab"
import PromoSectionsTab from "@/components/admin/homepage/promo-sections-tab"
import PromoModalTab from "@/components/admin/homepage/promo-modal-tab"

export default function HomePageManager() {
  const [activeTab, setActiveTab] = useState("layout")
  const [showSetupModal, setShowSetupModal] = useState(true)
  const [isSettingUp, setIsSettingUp] = useState(false)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Homepage Manager</h1>

      <Tabs defaultValue="layout" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="hero-slides">Hero Slides</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="section-cards">Section Cards</TabsTrigger>
          <TabsTrigger value="promo-sections">Promo Sections</TabsTrigger>
          <TabsTrigger value="promo-modal">Promo Modal</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="p-4 border rounded-md mt-4">
          <LayoutTab />
        </TabsContent>

        <TabsContent value="hero-slides" className="p-4 border rounded-md mt-4">
          <HeroSlidesTab />
        </TabsContent>

        <TabsContent value="categories" className="p-4 border rounded-md mt-4">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="section-cards" className="p-4 border rounded-md mt-4">
          <SectionCardsTab />
        </TabsContent>

        <TabsContent value="promo-sections" className="p-4 border rounded-md mt-4">
          <PromoSectionsTab />
        </TabsContent>

        <TabsContent value="promo-modal" className="p-4 border rounded-md mt-4">
          <PromoModalTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
