import { cache } from "react"
import { supabase } from "./supabase"

export const getNewArrivals = cache(async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("isNewArrival", true)
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching new arrivals:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching new arrivals:", error)
    return []
  }
})

export const getBestSellers = cache(async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("isBestSeller", true)
      .order("id", { ascending: false })

    if (error) {
      console.error("Error fetching best sellers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching best sellers:", error)
    return []
  }
})

export const getTrendingProducts = cache(async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or("isBestSeller.eq.true,isFeatured.eq.true")
      .order("rating", { ascending: false })

    if (error) {
      console.error("Error fetching trending products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return []
  }
})
