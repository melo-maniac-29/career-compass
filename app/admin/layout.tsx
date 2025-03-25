"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Loader2, ShieldAlert } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const isAdmin = useQuery(api.users.isAdmin)
  
  useEffect(() => {
    if (isAdmin === false) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  if (isAdmin === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Verifying admin access...</span>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ShieldAlert className="h-8 w-8 text-red-500 mr-2" />
        <span>Not authorized. Redirecting...</span>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}