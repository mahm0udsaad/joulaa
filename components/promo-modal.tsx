"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface PromoModal {
  id: number
  title: string
  subtitle: string
  image_url: string
  button_text: string
  button_link: string
  active: boolean
}

export default function PromoModal() {
  const [promo, setPromo] = useState<PromoModal | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function fetchPromoModal() {
      try {
        const { data, error } = await supabase.from("promo_modals").select("*").eq("active", true).limit(1).single()

        if (error) {
          if (error.code === "PGRST116") {
            // No rows returned
            setPromo(null)
          } else {
            console.error("Error fetching promo modal:", error)
          }
          return
        }

        setPromo(data)

        // Check if the modal has been shown in this session
        const hasShownModal = sessionStorage.getItem("hasShownPromoModal")
        if (!hasShownModal) {
          setTimeout(() => {
            setOpen(true)
            sessionStorage.setItem("hasShownPromoModal", "true")
          }, 2000)
        }
      } catch (error) {
        console.error("Error fetching promo modal:", error)
      }
    }

    fetchPromoModal()
  }, [])

  if (!promo) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-md rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full bg-white/80 text-gray-800"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={promo.image_url || "/placeholder.svg"}
            alt={promo.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{promo.title}</h2>
          <p className="mb-6 text-gray-600">{promo.subtitle}</p>
          <Button asChild className="w-full">
            <Link href={promo.button_link}>{promo.button_text}</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
