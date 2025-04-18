"use client";

import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/product-card";
import type { Product } from "@/contexts/product-context";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeaturedProducts({ title }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const productsPerSlide = 4; // Number of products to show per slide

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("isFeatured", true)
          .order("id", { ascending: false });

        if (error) {
          console.error("Error fetching featured products:", error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  const totalSlides = Math.ceil(products.length / productsPerSlide);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      setCurrentSlide(totalSlides - 1);
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-48 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">{title}</h2>
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No featured products available at the moment. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={prevSlide}
            disabled={totalSlides <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={nextSlide}
            disabled={totalSlides <= 1}
          >
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
            <div
              key={slideIndex}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              style={{ width: "100%" }}
            >
              {products
                .slice(
                  slideIndex * productsPerSlide,
                  slideIndex * productsPerSlide + productsPerSlide,
                )
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
