"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: any; success: boolean }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string },
  ) => Promise<{ error: any; success: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any; success: boolean }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }

      setIsLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          status: error instanceof Response ? error.status : undefined,
        },
        success: false,
      };
    }
  };

  // Update the signUp function to use our custom email sending
  const signUp = async (
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string },
  ) => {
    try {
      // Set emailRedirectTo to the current origin for verification links
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: metadata?.firstName || "",
            last_name: metadata?.lastName || "",
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        return { error, success: false };
      }

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            first_name: metadata?.firstName || "",
            last_name: metadata?.lastName || "",
            email: email,
          },
        ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // We don't return an error here because the auth was successful
        }

        // If we have a session and confirmation URL, send our own email
        if (data.session && data.user.confirmation_sent_at) {
          try {
            // Get the verification URL from Supabase
            const { data: verificationData } = await supabase.auth.resend({
              type: "signup",
              email,
              options: {
                emailRedirectTo: `${origin}/auth/callback`,
              },
            });

          } catch (emailError) {
            console.error(
              "Error sending custom verification email:",
              emailError,
            );
            // We don't fail the signup if the email fails
          }
        }
      }

      return { error: null, success: true };
    } catch (error: any) {
      console.error("Sign up error:", error);

      // Check if it's a rate limit error (429)
      const status =
        error.status || (error.message?.includes("429") ? 429 : undefined);

      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          status,
        },
        success: false,
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) {
        return { error: { message: "Not authenticated" }, success: false };
      }

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });

      if (authError) {
        return { error: authError, success: false };
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("users")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        })
        .eq("id", user.id);

      if (profileError) {
        return { error: profileError, success: false };
      }

      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(updatedProfile);

      return { error: null, success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
        success: false,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
