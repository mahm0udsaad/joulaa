"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top smoothly when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Using "instant" instead of "smooth" to prevent visual jarring
    })
  }, []) // Removed pathname as dependency

  return null
}
