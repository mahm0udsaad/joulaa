"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  active: boolean;
  order: number;
}

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroSlides() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("active", true)
          .order("order", { ascending: true });

        if (error) {
          console.error("Error fetching hero slides:", error);
          return;
        }

        setSlides(data || []);
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to BeautyShop</h2>
          <p className="text-gray-500 mb-4">
            Discover our amazing beauty products
          </p>
          <Button asChild>
            <Link href="/shop">Shop Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image_url || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="text-white p-8 max-w-md">
              <h2 className="text-3xl font-bold mb-2">{slide.title}</h2>
              <p className="mb-4">{slide.subtitle}</p>
              <Button asChild>
                <Link href={slide.button_link}>{slide.button_text}</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                onClick={() => setCurrentSlide(index)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
