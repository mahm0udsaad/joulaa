"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  LollipopIcon as Lipstick,
  Scissors,
  SprayCanIcon as Spray,
  Eye,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  href: string;
  image: string;
  active: boolean;
  order: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Lipstick: <Lipstick className="h-6 w-6" />,
  Scissors: <Scissors className="h-6 w-6" />,
  Spray: <Spray className="h-6 w-6" />,
  Eye: <Eye className="h-6 w-6" />,
};

export default function CategoryShowcase({ title }: { title: string }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("category_showcase")
        .select("*")
        .eq("active", true)
        .order("order", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">No categories found</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="grid justify-center grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative flex flex-col items-center"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`}
              ></div>
              <img
                src={
                  category.image ||
                  `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(category.name)}`
                }
                alt={category.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-medium text-center text-white text-lg px-2 py-1 bg-black/30 rounded backdrop-blur-sm">
                  {category.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
