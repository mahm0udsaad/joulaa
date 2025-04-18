"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/loading-spinner"
import { supabase } from "@/lib/supabase"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    console.log("User:", user)
    console.log("Profile:", profile)

    const fetchUserRole = async () => {
      if (user) {
        try {
          const { data, error } = await supabase.from("users").select("role").eq("id", user.id).single()

          if (error) {
            console.error("Error fetching user role:", error)
          } else {
            setUserRole(data?.role || null)
            console.log("User Role:", data?.role)
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        } finally {
          setLoadingRole(false)
        }
      } else {
        setLoadingRole(false)
      }
    }

    fetchUserRole()
  }, [user])

  useEffect(() => {
    if (!isLoading && !loadingRole) {
      if (!user) {
        router.push("/auth/sign-in")
      } else if (adminOnly && userRole !== "admin") {
        router.push("/account")
      }
    }
  }, [user, isLoading, router, adminOnly, userRole, loadingRole])

  if (isLoading || loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || (adminOnly && userRole !== "admin")) {
    return null
  }

  return <>{children}</>
}

