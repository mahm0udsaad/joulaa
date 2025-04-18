"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Verifying your email...")
  const [error, setError] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setError("Verification token is missing")
        return
      }

      try {
        const supabase = createClientComponentClient()

        // Verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage("Email verified successfully! Redirecting...")

          // Redirect to home page after successful verification
          setTimeout(() => {
            router.push("/")
          }, 2000)
        }
      } catch (err) {
        console.error("Verification error:", err)
        setError("An error occurred during verification")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Email Verification</h1>

          {!error ? (
            <div className="mt-4 flex flex-col items-center space-y-4">
              <LoadingSpinner size="lg" />
              <p>{message}</p>
            </div>
          ) : (
            <div className="mt-4 text-red-500">
              <p>{error}</p>
              <button
                onClick={() => router.push("/auth/sign-in")}
                className="mt-4 rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
