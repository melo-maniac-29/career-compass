"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignIn } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Admin email constant
const ADMIN_EMAIL = "ktmtitans@gmail.com"

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Add these Convex functions
  const getUser = useQuery(api.users.getUser, { tokenIdentifier: "" });
  const createUser = useMutation(api.users.createUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setFormError("")

    try {
      setIsLoading(true)
      
      // Log the data we're sending to help debug
      console.log("Trying to sign in with:", { email, password: "***" })
      
      const result = await signIn.create({
        identifier: email,
        password,
      })

      console.log("Sign in result:", result)

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Improved admin check with clear logging
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          console.log("Admin user detected, redirecting to admin dashboard");
          // Force a direct navigation to admin page
          window.location.href = "/admin";
        } else {
          console.log("Regular user detected, redirecting to user dashboard");
          router.push("/dashboard");
        }
      } else {
        // Handle other statuses if needed
        console.log("Sign in requires more steps:", result.status)
        setFormError(`Additional verification required: ${result.status}`)
      }
    } catch (err: any) {
      console.error("Full sign in error:", err)
      console.error("Error details:", err.errors)
      console.error("Full error details:", JSON.stringify(err.errors, null, 2));
      
      // Set a more specific error message
      const errorMessage = err.errors?.[0]?.message || "Invalid email or password. Please try again."
      setFormError(errorMessage)
      
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 flex items-center">
      <div className="container max-w-[400px] mx-auto px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to sign in to your account
            </CardDescription>
          </CardHeader>
          
          {formError && (
            <div className="px-6 py-2">
              <p className="text-sm font-medium text-red-500">{formError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}