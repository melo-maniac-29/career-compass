"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from "@/contexts/loading-context"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// No need to create a separate component and extract getToken
// ConvexProviderWithClerk handles this automatically with useAuth
export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LoadingProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </LoadingProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}