"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import SectionCard from "@/components/section-card"

interface SectionCardData {
  id: string
  title: string
  subtitle: string
  description: string
  image_url: string
  button_text: string
  button_link: string
  position: string
  active: boolean
}

export default function SectionCards({ position }: { position: string }) {
  const [cards, setCards] = useState<SectionCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkTableExists() {
      try {
        // First check if the table exists by making a small query
        const { error } = await supabase.from("section_cards").select("id").limit(1)

        if (error && error.message.includes("does not exist")) {
          console.error("section_cards table does not exist")
          setError("Section cards table not set up. Please visit the admin homepage manager to set up the table.")
          setIsLoading(false)
          return false
        }

        return true
      } catch (err) {
        console.error("Error checking if section_cards table exists:", err)
        setIsLoading(false)
        return false
      }
    }

    async function fetchSectionCards() {
      try {
        const { data, error } = await supabase
          .from("section_cards")
          .select("*")
          .eq("position", position)
          .eq("active", true)

        if (error) throw error

        setCards(data || [])
      } catch (err) {
        console.error(`Error fetching ${position} section cards:`, err)
        setError(`Failed to load ${position} section cards`)
      } finally {
        setIsLoading(false)
      }
    }

    async function initializeData() {
      const tableExists = await checkTableExists()
      if (tableExists) {
        fetchSectionCards()
      }
    }

    initializeData()
  }, [position])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>
  }

  if (cards.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <SectionCard
          key={card.id}
          title={card.title}
          description={card.description || ""}
          image={card.image_url}
          link={card.button_link}
          linkText={card.button_text}
        />
      ))}
    </div>
  )
}
