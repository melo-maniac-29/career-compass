"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const userProfile = useQuery(api.users.getMyProfile)
  
  useEffect(() => {
    // Check if user is authenticated
    if (isLoaded && !user) {
      router.push('/login')
      return
    }
  }, [user, isLoaded, router])

  if (!isLoaded || userProfile === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading your profile...</span>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
