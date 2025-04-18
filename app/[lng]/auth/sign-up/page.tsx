"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import LoadingSpinner from "@/components/loading-spinner"
import { CheckCircle2, Mail, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [rateLimitError, setRateLimitError] = useState(false)
  const [lastAttempt, setLastAttempt] = useState(0)

  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/account"
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) newErrors.firstName = "First name is required"
    if (!lastName.trim()) newErrors.lastName = "Last name is required"

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Check if we're trying too frequently
    const now = Date.now()
    if (now - lastAttempt < 5000) {
      // 5 seconds cooldown
      toast({
        title: "Please wait",
        description: "Please wait a few seconds before trying again",
        variant: "destructive",
      })
      return
    }

    setLastAttempt(now)
    setIsSubmitting(true)
    setRateLimitError(false)

    try {
      const { error, success } = await signUp(email, password, { firstName, lastName })

      if (error) {
        // Check if it's a rate limit error
        if (error.message?.includes("429") || error.status === 429) {
          setRateLimitError(true)
          toast({
            title: "Too many attempts",
            description: "Please wait a few minutes before trying again",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to create account",
            variant: "destructive",
          })
        }
        return
      }

      if (success) {
        setIsSuccess(true)
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        })
      }
    } catch (err: any) {
      // Catch any unexpected errors
      console.error("Signup error:", err)

      // Check if it's a rate limit error
      if (err.message?.includes("429") || err.status === 429) {
        setRateLimitError(true)
        toast({
          title: "Too many attempts",
          description: "Please wait a few minutes before trying again",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container max-w-md py-12">
        <Card className="border-green-100 bg-green-50">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Account Created!</CardTitle>
            <CardDescription className="text-center text-base">
              We've sent a verification email to <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="bg-white rounded-lg p-4 border border-green-100 mb-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Next Steps</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please check your email and click the verification link to activate your account. If you don't see
                    the email, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={() => router.push("/auth/sign-in?redirect=" + encodeURIComponent(redirectUrl))}
              className="w-full"
            >
              Continue to Sign In
            </Button>
            <p className="text-sm text-center text-gray-500">
              Didn't receive the email?{" "}
              <button onClick={() => setIsSuccess(false)} className="text-primary hover:underline">
                Try again
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {rateLimitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Rate limit exceeded</AlertTitle>
                <AlertDescription>
                  Too many signup attempts. Please wait a few minutes before trying again or try with a different email
                  address.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Create account"}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link
                href={`/auth/sign-in${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
