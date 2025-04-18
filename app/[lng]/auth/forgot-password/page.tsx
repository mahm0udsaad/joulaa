"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setIsSubmitting(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset password email",
        variant: "destructive",
      })
      return
    }

    setIsSubmitted(true)
    toast({
      title: "Success",
      description: "Password reset email sent. Please check your inbox.",
    })
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
          <CardDescription>Enter your email to reset your password</CardDescription>
        </CardHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : "Send reset link"}
              </Button>
              <p className="text-sm text-center text-gray-500">
                Remember your password?{" "}
                <Link href="/auth/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 text-green-800 rounded-md">
              <p>Password reset email sent to {email}.</p>
              <p className="mt-2">Please check your inbox and follow the instructions to reset your password.</p>
            </div>
            <div className="text-center mt-4">
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                Return to sign in
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
