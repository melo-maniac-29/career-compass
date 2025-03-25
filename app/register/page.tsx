"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast" // Update the path if needed
import Link from "next/link"
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function RegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [formError, setFormError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const createUser = useMutation(api.users.createUser);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    
    // Add stronger validation
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number");
      return false;
    }
    
    setPasswordError("");
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    
    setFormError("")
    
    if (!validatePassword(password)) return

    try {
      setIsLoading(true)
      const result = await signUp.create({
        emailAddress: email,
        password,
      })

      console.log("Sign up result:", result)

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        
        try {
          await createUser({
            name: name,
            email: email,
            tokenIdentifier: result.createdUserId,
          });
          
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
          
          router.push("/");
        } catch (err) {
          console.error("Error creating user in database:", err);
          console.error("Full error details:", JSON.stringify(err.errors, null, 2));
          toast({
            variant: "destructive",
            title: "Error",
            description: "Account created but profile setup failed. Please contact support."
          });
        }
      } else if (result.status === "missing_requirements") {
        // Check if email verification is needed
        if (result.unverifiedFields.includes("email_address")) {
          // Start the verification process
          await signUp.prepareEmailAddressVerification();
          
          // Inform the user and redirect to verification page
          toast({
            title: "Verification needed",
            description: "We've sent a verification code to your email address.",
          });
          
          // Store necessary info and redirect to verify page
          router.push(`/verify?userId=${signUp.id}&email=${encodeURIComponent(email)}`);
        } else {
          // Handle other missing requirements
          setFormError(`Registration requires additional information: ${result.requiredFields.join(", ")}`);
        }
      } else if (result.status === "needs_verification") {
        router.push(`/verify?userId=${result.createdUserId}&email=${encodeURIComponent(email)}`);
      } else {
        console.log("Additional steps required:", result.status);
      }
    } catch (err: any) {
      console.error("Full error object:", err)
      console.error("Error details:", err.errors)
      console.error("Full error details:", JSON.stringify(err.errors, null, 2));
      
      setFormError(err.errors?.[0]?.message || "Something went wrong. Please try again.")
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.errors?.[0]?.message || "Something went wrong. Please try again.",
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create your account
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  required
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}