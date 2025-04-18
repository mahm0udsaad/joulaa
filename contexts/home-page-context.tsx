"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { HomePageState, HeroSlide, CategoryShowcaseItem, SectionCardItem, HomePageSection } from "@/lib/types"
import { supabase } from "@/lib/supabase"

// Initial state with sample data for sections that aren't from Supabase yet
const initialState: HomePageState = {
  sections: [
    { id: "1", type: "hero", title: "Hero Slider", visible: true, order: 1 },
    { id: "2", type: "category-showcase", title: "Shop by Category", visible: true, order: 5 },
    { id: "3", type: "trending", title: "Trending Products", visible: true, order: 2 },
    { id: "4", type: "featured", title: "Featured Products", visible: true, order: 3 },
    { id: "5", type: "new-arrivals", title: "New Arrivals", visible: true, order: 4 },
    { id: "6", type: "best-sellers", title: "Best Sellers", visible: true, order: 6 },
    { id: "7", type: "end-of-month-sale", title: "End of Month Sale", visible: true, order: 7 },
    { id: "8", type: "promo", title: "Promotions", visible: true, order: 8 },
  ],
  heroSlides: [
    {
      id: "1",
      title: "New Collection SS-2021",
      subtitle: "Luxury Beauty Essentials for Every Skin Type",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      image:
        "https://img.freepik.com/free-photo/woman-applying-makeup-hand_23-2148601691.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 1,
      active: true,
    },
    {
      id: "2",
      title: "Premium Skincare",
      subtitle: "Discover the Secret to Radiant Skin",
      buttonText: "Explore Now",
      buttonLink: "/category/skincare",
      image:
        "https://img.freepik.com/free-photo/cosmetic-products-arrangement-with-copy-space_23-2148602699.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 2,
      active: true,
    },
    {
      id: "3",
      title: "Organic Beauty",
      subtitle: "Clean, Vegan & Cruelty-Free Products",
      buttonText: "Shop Organic",
      buttonLink: "/category/organic",
      image:
        "https://img.freepik.com/free-photo/flat-lay-natural-cosmetic-products-arrangement_23-2148593339.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 3,
      active: true,
    },
  ],
  categoryItems: [
    {
      id: "1",
      name: "Beauty",
      icon: "Sparkles",
      color: "from-rose-400 to-rose-200",
      href: "/category/beauty",
      image:
        "https://img.freepik.com/free-photo/woman-applying-makeup-hand_23-2148601691.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 1,
      active: true,
    },
    {
      id: "2",
      name: "Makeup",
      icon: "Palette",
      color: "from-purple-400 to-purple-200",
      href: "/category/makeup",
      image:
        "https://img.freepik.com/free-photo/cosmetic-products-arrangement-with-copy-space_23-2148602699.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 2,
      active: true,
    },
    {
      id: "3",
      name: "Lipstick",
      icon: "Lipstick",
      color: "from-pink-400 to-pink-200",
      href: "/category/lipstick",
      image:
        "https://img.freepik.com/free-photo/flat-lay-natural-cosmetic-products-arrangement_23-2148593339.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 3,
      active: true,
    },
    {
      id: "4",
      name: "Nails",
      icon: "Scissors",
      color: "from-blue-400 to-blue-200",
      href: "/category/nails",
      image:
        "https://img.freepik.com/free-photo/woman-getting-her-nails-done-nail-salon_23-2149229787.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 4,
      active: true,
    },
    {
      id: "5",
      name: "Perfume",
      icon: "Spray",
      color: "from-yellow-400 to-yellow-200",
      href: "/category/perfume",
      image:
        "https://img.freepik.com/free-photo/perfume-bottle-with-flowers_23-2148575433.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 5,
      active: true,
    },
    {
      id: "6",
      name: "Eyes Care",
      icon: "Eye",
      color: "from-green-400 to-green-200",
      href: "/category/eyes",
      image:
        "https://img.freepik.com/free-photo/woman-applying-makeup-eye_23-2148601698.jpg?w=1380&t=st=1710817890~exp=1710818490~hmac=2ad7658d74912ef88bee3f829d480905471fff671fc22655c6423ed769def55f",
      order: 6,
      active: true,
    },
  ],
  sectionCards: [], // Initialize as empty, will be populated from Supabase
  isLoading: false,
  error: null,
}

// Define the context type
interface HomePageContextType extends HomePageState {
  // Hero slides CRUD
  addHeroSlide: (slide: Omit<HeroSlide, "id">) => void
  updateHeroSlide: (slide: HeroSlide) => void
  deleteHeroSlide: (id: string) => void
  reorderHeroSlides: (slides: HeroSlide[]) => void

  // Category items CRUD
  addCategoryItem: (item: Omit<CategoryShowcaseItem, "id">) => void
  updateCategoryItem: (item: CategoryShowcaseItem) => void
  deleteCategoryItem: (id: string) => void
  reorderCategoryItems: (items: CategoryShowcaseItem[]) => void

  // Section cards CRUD
  addSectionCard: (card: Omit<SectionCardItem, "id">) => Promise<void>
  updateSectionCard: (card: SectionCardItem) => Promise<void>
  deleteSectionCard: (id: string) => Promise<void>

  // Sections CRUD
  updateSectionVisibility: (id: string, visible: boolean) => void
  reorderSections: (sections: HomePageSection[]) => void

  // Save all changes
  saveChanges: () => Promise<void>

  // Refresh data
  refreshSectionCards: () => Promise<void>
}

// Create the context
const HomePageContext = createContext<HomePageContextType | undefined>(undefined)

// Create a provider component
export function HomePageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HomePageState>(initialState)

  // Function to fetch section cards from Supabase
  const fetchSectionCards = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Check if the table exists first
      const { error: checkError } = await supabase.from("section_cards").select("id").limit(1)

      if (checkError && checkError.message.includes("does not exist")) {
        console.log("section_cards table does not exist yet")
        setState((prev) => ({
          ...prev,
          isLoading: false,
          sectionCards: [], // Empty array if table doesn't exist
        }))
        return
      }

      // Fetch all section cards
      const { data, error } = await supabase.from("section_cards").select("*")

      if (error) throw error

      // Map the Supabase data to our SectionCardItem format
      const formattedCards = data.map((card) => ({
        id: card.id.toString(),
        title: card.title,
        subtitle: card.subtitle || "",
        image: card.image_url, // Map from image_url in DB to image in our state
        link: card.button_link, // Map from button_link in DB to link in our state
        linkText: card.button_text, // Map from button_text in DB to linkText in our state
        position: card.position,
        order: card.order || 1, // Default to 1 if order is not present
        active: card.active,
      }))

      setState((prev) => ({
        ...prev,
        sectionCards: formattedCards,
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error fetching section cards:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to fetch section cards",
        isLoading: false,
      }))
    }
  }

  // Load data on mount
  useEffect(() => {
    // Fetch section cards from Supabase
    fetchSectionCards()

    // Load other data from localStorage (for now)
    const savedData = localStorage.getItem("homepageData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Keep the section cards from Supabase, but use localStorage for other data
        setState((prev) => ({
          ...parsedData,
          sectionCards: prev.sectionCards,
          isLoading: prev.isLoading,
          error: prev.error,
        }))
      } catch (error) {
        console.error("Failed to parse homepage data:", error)
      }
    }
  }, [])

  // Hero slides CRUD
  const addHeroSlide = (slide: Omit<HeroSlide, "id">) => {
    const newSlide: HeroSlide = {
      ...slide,
      id: Date.now().toString(),
    }
    setState((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }))
  }

  const updateHeroSlide = (slide: HeroSlide) => {
    setState((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) => (s.id === slide.id ? slide : s)),
    }))
  }

  const deleteHeroSlide = (id: string) => {
    setState((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }))
  }

  const reorderHeroSlides = (slides: HeroSlide[]) => {
    setState((prev) => ({
      ...prev,
      heroSlides: slides,
    }))
  }

  // Category items CRUD
  const addCategoryItem = (item: Omit<CategoryShowcaseItem, "id">) => {
    const newItem: CategoryShowcaseItem = {
      ...item,
      id: Date.now().toString(),
    }
    setState((prev) => ({
      ...prev,
      categoryItems: [...prev.categoryItems, newItem],
    }))
  }

  const updateCategoryItem = (item: CategoryShowcaseItem) => {
    setState((prev) => ({
      ...prev,
      categoryItems: prev.categoryItems.map((i) => (i.id === item.id ? item : i)),
    }))
  }

  const deleteCategoryItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      categoryItems: prev.categoryItems.filter((i) => i.id !== id),
    }))
  }

  const reorderCategoryItems = (items: CategoryShowcaseItem[]) => {
    setState((prev) => ({
      ...prev,
      categoryItems: items,
    }))
  }

  // Section cards CRUD - Now using Supabase
  const addSectionCard = async (card: Omit<SectionCardItem, "id">) => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Map our state format to the database format
      const dbCard = {
        title: card.title,
        description: card.description,
        image_url: card.image, // Map from image in our state to image_url in DB
        button_text: card.linkText, // Map from linkText in our state to button_text in DB
        button_link: card.link, // Map from link in our state to button_link in DB
        position: card.position,
        order: card.order || 1,
        active: card.active,
      }

      // Insert into Supabase
      const { data, error } = await supabase.from("section_cards").insert(dbCard).select()

      if (error) throw error

      // Get the inserted card with its new ID
      const newCard: SectionCardItem = {
        id: data[0].id.toString(),
        title: data[0].title,
        description: data[0].description || "",
        image: data[0].image_url,
        link: data[0].button_link,
        linkText: data[0].button_text,
        position: data[0].position,
        order: data[0].order || 1,
        active: data[0].active,
      }

      // Update state with the new card
      setState((prev) => ({
        ...prev,
        sectionCards: [...prev.sectionCards, newCard],
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error adding section card:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to add section card",
        isLoading: false,
      }))
    }
  }

  const updateSectionCard = async (card: SectionCardItem) => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Map our state format to the database format
      const dbCard = {
        title: card.title,
        description: card.description,
        image_url: card.image, // Map from image in our state to image_url in DB
        button_text: card.linkText, // Map from linkText in our state to button_text in DB
        button_link: card.link, // Map from link in our state to button_link in DB
        position: card.position,
        order: card.order || 1,
        active: card.active,
      }

      // Update in Supabase
      const { error } = await supabase.from("section_cards").update(dbCard).eq("id", card.id)

      if (error) throw error

      // Update state
      setState((prev) => ({
        ...prev,
        sectionCards: prev.sectionCards.map((c) => (c.id === card.id ? card : c)),
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error updating section card:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to update section card",
        isLoading: false,
      }))
    }
  }

  const deleteSectionCard = async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Delete from Supabase
      const { error } = await supabase.from("section_cards").delete().eq("id", id)

      if (error) throw error

      // Update state
      setState((prev) => ({
        ...prev,
        sectionCards: prev.sectionCards.filter((c) => c.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error deleting section card:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to delete section card",
        isLoading: false,
      }))
    }
  }

  // Function to refresh section cards data
  const refreshSectionCards = async () => {
    await fetchSectionCards()
  }

  // Sections CRUD
  const updateSectionVisibility = (id: string, visible: boolean) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, visible } : s)),
    }))
  }

  const reorderSections = (sections: HomePageSection[]) => {
    setState((prev) => ({
      ...prev,
      sections,
    }))
  }

  // Save all changes
  const saveChanges = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // For now, we're only saving section cards to Supabase
      // Other data still goes to localStorage

      // Save non-section-card data to localStorage
      const localStorageData = {
        ...state,
        // Don't include section cards as they're in Supabase
        sectionCards: [],
      }

      localStorage.setItem("homepageData", JSON.stringify(localStorageData))

      // Simulate API delay for other data
      await new Promise((resolve) => setTimeout(resolve, 500))

      setState((prev) => ({ ...prev, isLoading: false }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to save changes",
      }))
    }
  }

  return (
    <HomePageContext.Provider
      value={{
        ...state,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        reorderHeroSlides,
        addCategoryItem,
        updateCategoryItem,
        deleteCategoryItem,
        reorderCategoryItems,
        addSectionCard,
        updateSectionCard,
        deleteSectionCard,
        updateSectionVisibility,
        reorderSections,
        saveChanges,
        refreshSectionCards,
      }}
    >
      {children}
    </HomePageContext.Provider>
  )
}

// Custom hook to use the context
export function useHomePage() {
  const context = useContext(HomePageContext)
  if (context === undefined) {
    throw new Error("useHomePage must be used within a HomePageProvider")
  }
  return context
}
