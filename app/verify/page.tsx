"use client"

import { useState, useEffect } from "react" // Add useEffect
import { useSignUp } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react" // Add icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Add Alert component

export default function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState(60) // 60 second countdown
  const [canResend, setCanResend] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp, setActive } = useSignUp()
  const { toast } = useToast()
  const createUser = useMutation(api.users.createUser)
  
  // Get user ID from URL
  const userId = searchParams.get("userId")
  const email = searchParams.get("email") || ""
  const decodedEmail = email ? decodeURIComponent(email) : ""
  
  // Set up countdown timer for resending code
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }
    
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)
    
    return () => clearInterval(intervalId)
  }, [timeLeft])
  
  // Handle resend verification code
  const handleResendCode = async () => {
    if (!signUp || resending || !canResend) return
    
    try {
      setResending(true)
      setFormError("")
      
      await signUp.prepareEmailAddressVerification({ 
        strategy: "email_code" 
      })
      
      toast({
        title: "Verification code resent",
        description: "Please check your inbox for the new code",
      })
      
      setSuccessMessage("A new verification code has been sent to your email.")
      setCanResend(false)
      setTimeLeft(60) // Reset countdown
    } catch (err: any) {
      console.error("Failed to resend verification code:", err)
      setFormError(err.errors?.[0]?.message || "Failed to resend verification code")
      
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: err.errors?.[0]?.message || "Please try again later",
      })
    } finally {
      setResending(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUp) return
    setFormError("")
    setSuccessMessage("")
    
    try {
      setIsLoading(true)
      
      // Attempt to verify the email
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })
      
      console.log("Verification result:", result)
      
      if (result.status === "complete") {
        // Show success message first
        setSuccessMessage("Email verified successfully! Setting up your account...")
        
        // Set the user as active
        await setActive({ session: result.createdSessionId })
        
        // Create user in your database
        try {
          await createUser({
            name: result.username || result.emailAddress?.split('@')[0] || "User",
            email: result.emailAddress || decodedEmail || "",
            tokenIdentifier: result.createdUserId || "",
          })
          
          toast({
            title: "Verification complete!",
            description: "Your account has been verified successfully.",
          })
          
          router.push("/dashboard")
        } catch (err) {
          console.error("Error creating user in database:", err)
          
          // Continue to home page even if database creation fails
          toast({
            variant: "destructive",
            title: "Error",
            description: "Account verified but profile setup failed. Please contact support."
          })
          router.push("/")
        }
      } else {
        setFormError("Verification failed. Please check your code and try again.")
      }
    } catch (err: any) {
      console.error("Verification error:", err)
      setFormError(err.errors?.[0]?.message || "Failed to verify your email. Please try again.")
      
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: err.errors?.[0]?.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // If no userId or signUp is provided, show error
  if (!userId || !signUp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Invalid verification link</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/register")} className="w-full">
              Back to Registration
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background py-12 flex items-center">
      <div className="container max-w-[400px] mx-auto px-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              {decodedEmail ? 
                `Enter the verification code sent to ${decodedEmail}` : 
                "Enter the verification code sent to your email"}
            </CardDescription>
          </CardHeader>
          
          {formError && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            </div>
          )}
          
          {successMessage && (
            <div className="px-6 py-2">
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="code"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  autoFocus
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  aria-label="Verification code"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {canResend ? 
                    "Didn't receive the code?" : 
                    `You can request a new code in ${timeLeft} seconds`}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || verificationCode.length < 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : "Verify Email"}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={handleResendCode}
                disabled={resending || !canResend}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : "Resend Code"}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={() => router.push("/register")}
                className="w-full"
              >
                Back to Registration
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}