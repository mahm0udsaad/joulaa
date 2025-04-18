"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/contexts/product-context"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DailyDeals() {
  const [deals, setDeals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDailyDeals()
  }, [])

  async function fetchDailyDeals() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("isDailyOffer", true)
        .order("id", { ascending: false })

      if (error) {
        console.error("Error fetching daily deals:", error)
        return
      }

      setDeals(data || [])
    } catch (error) {
      console.error("Error fetching daily deals:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalSlides = Math.ceil(deals.length / 2)

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      setCurrentSlide(0)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      setCurrentSlide(totalSlides - 1)
    }
  }

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${(currentSlide * 100) / totalSlides}%)`
    }
  }, [currentSlide, totalSlides])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-32 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm h-full">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">Daily Deals</h3>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-[calc(100%-60px)]">
          <p className="text-gray-500 text-center">No daily deals available at the moment. Check back soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">Daily Deals</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={prevSlide}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={nextSlide}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-300 ease-in-out"
          style={{ width: `${totalSlides * 100}%` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="p-4 space-y-4" style={{ width: `${100 / totalSlides}%` }}>
              {deals.slice(slideIndex * 2, slideIndex * 2 + 2).map((deal) => (
                <Link href={`/product/${deal.id}`} key={deal.id} className="block group">
                  <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
                    {deal.image_urls && deal.image_urls.length > 0 ? (
                      <Image
                        src={deal.image_urls[0] || "/placeholder.svg"}
                        alt={deal.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 300px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    {deal.compareAtPrice && deal.compareAtPrice > deal.price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((deal.compareAtPrice - deal.price) / deal.compareAtPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1">{deal.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm">${deal.price.toFixed(2)}</span>
                    {deal.compareAtPrice && deal.compareAtPrice > deal.price && (
                      <span className="text-gray-400 text-xs line-through">${deal.compareAtPrice.toFixed(2)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
