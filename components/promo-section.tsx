"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PromoSectionProps {
  className?: string;
  title: string;
}

interface PromoSectionData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  background_color: string;
  text_color: string;
  active: boolean;
}

export default function PromoSection({ className, title }: PromoSectionProps) {
  const [promoSections, setPromoSections] = useState<PromoSectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromoSections = async () => {
      try {
        const { data, error } = await supabase
          .from("promo_sections")
          .select("*")
          .eq("active", true);

        if (error && error.code !== "42P01") {
          console.error("Error fetching promo sections:", error);
        } else {
          setPromoSections(data || []);
        }
      } catch (error) {
        console.error("Error fetching promo sections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromoSections();
  }, []);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        Loading promo sections...
      </div>
    );
  }

  if (promoSections.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-8 py-8 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      </div>
      {promoSections.map((promo) => (
        <div
          key={promo.id}
          className={`rounded-lg overflow-hidden shadow-sm ${promo.background_color || "bg-rose-100"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-8 flex flex-col justify-center">
              <h2
                className={`text-2xl md:text-3xl font-bold mb-2 ${promo.text_color || "text-rose-900"}`}
              >
                {promo.title}
              </h2>
              <p
                className={`text-lg md:text-xl font-medium mb-2 ${promo.text_color || "text-rose-900"}`}
              >
                {promo.subtitle}
              </p>
              <p
                className={`mb-6 ${promo.text_color || "text-rose-900"} opacity-90`}
              >
                {promo.description}
              </p>
              <div>
                <Link
                  href={promo.button_link}
                  className={`inline-flex items-center px-6 py-3 rounded-md bg-white/80 hover:bg-white transition-colors ${
                    promo.text_color || "text-rose-900"
                  } font-medium`}
                >
                  {promo.button_text}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="h-64 md:h-auto relative">
              <Image
                src={promo.image_url || "/placeholder.svg?height=600&width=800"}
                alt={promo.title}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
