"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/contexts/loading-context";

// Admin email - hardcoded for simplicity
const ADMIN_EMAIL = "ktmtitans@gmail.com";

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const { isLoaded: authLoaded, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const createUser = useMutation(api.users.createUser);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoaded || !userLoaded || !user) return;

    async function setupUser() {
      try {
        setLoading(true);
        const email = user.primaryEmailAddress?.emailAddress;

        console.log("User email:", email);
        
        // Check if admin
        if (email === ADMIN_EMAIL) {
          setIsAdmin(true);
          console.log("Admin user detected!");
        }
        
        // Get token for Convex
        const token = await getToken({ template: "convex" });
        if (!token) {
          setError("Failed to get authentication token");
          setLoading(false);
          return;
        }

        console.log("Got Convex token");
        
        // Create user in Convex
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        await createUser({
          name: fullName || "User",
          email: email || "",
          tokenIdentifier: token,
        });
        
        console.log("User created in Convex");
        
        toast({
          title: "Account setup complete",
          description: "Your account has been successfully created",
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error setting up user:", err);
        setError("Failed to set up your account");
        setLoading(false);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem setting up your account",
        });
      }
    }
    
    setupUser();
  }, [authLoaded, userLoaded, user, getToken, createUser, toast, setLoading]);
  
  const handleContinue = () => {
    if (isAdmin) {
      // Use window.location for consistent navigation
      window.location.href = "/admin";
    } else {
      // Use push for user dashboard
      router.push("/dashboard");
    }
  };

  if (!authLoaded || !userLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registration Successful!</CardTitle>
          <CardDescription>
            {isAdmin ? "Admin account detected" : "Your account has been created"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Setting up your account...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
              {error}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800">
              Your account has been set up successfully!
            </div>
          )}
          
          <Button 
            onClick={handleContinue} 
            disabled={isLoading || !!error}
            className="w-full"
          >
            {isAdmin ? "Go to Admin Dashboard" : "Go to Your Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}