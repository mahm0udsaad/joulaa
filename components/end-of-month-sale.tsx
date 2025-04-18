"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface SaleSection {
  id: number
  title: string
  subtitle: string
  image_url: string
  button_text: string
  button_link: string
  discount_text: string
  active: boolean
  end_date: string
}

export default function EndOfMonthSale() {
  const [sale, setSale] = useState<SaleSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    async function fetchSaleSection() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("sale_sections").select("*").eq("active", true).limit(1).single()

        if (error) {
          if (error.code === "PGRST116") {
            // No rows returned
            setSale(null)
          } else {
            console.error("Error fetching sale section:", error)
          }
          return
        }

        setSale(data)
      } catch (error) {
        console.error("Error fetching sale section:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSaleSection()
  }, [])

  useEffect(() => {
    if (!sale) return

    const calculateTimeLeft = () => {
      const endDate = new Date(sale.end_date)
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [sale])

  if (loading) {
    return (
      <div className="w-full rounded-lg overflow-hidden">
        <Skeleton className="w-full h-[300px]" />
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="w-full rounded-lg overflow-hidden bg-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">No Active Sales</h2>
        <p className="text-gray-500 mb-4">Check back later for our upcoming sales and promotions</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      <Image
        src={sale.image_url || "/placeholder.svg"}
        alt={sale.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        loading="lazy" // Add lazy loading
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-white text-center p-8 max-w-2xl">
          <div className="bg-primary/80 inline-block px-4 py-2 rounded-full mb-4">
            <span className="font-bold">{sale.discount_text}</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">{sale.title}</h2>
          <p className="mb-6 text-lg">{sale.subtitle}</p>

          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-black/30 p-3 rounded-lg w-20 text-center">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs uppercase">Days</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg w-20 text-center">
              <div className="text-2xl font-bold">{timeLeft.hours}</div>
              <div className="text-xs uppercase">Hours</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg w-20 text-center">
              <div className="text-2xl font-bold">{timeLeft.minutes}</div>
              <div className="text-xs uppercase">Minutes</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg w-20 text-center">
              <div className="text-2xl font-bold">{timeLeft.seconds}</div>
              <div className="text-xs uppercase">Seconds</div>
            </div>
          </div>

          <Button size="lg" asChild>
            <Link href={sale.button_link}>{sale.button_text}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
