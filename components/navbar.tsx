"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu, X, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

const Navbar = () => {
  const { user } = useUser()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check if the current route is active
  const isActive = (path: string) => {
    return pathname === path
  }

  // Check if the user is an admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "ktmtitans@gmail.com"

  // Define public navigation links (visible to all)
  const publicLinks = [
    { name: "Home", path: "/" },
  ]
  
  // Define navigation links visible only to authenticated users
  const authLinks = [
    { name: "Colleges", path: "/colleges" },
    { name: "Aptitude Tests", path: "/aptitude-test" },
    { name: "Counselors", path: "/counselors" },
  ]

  // Additional links for authenticated users
  const authenticatedLinks = [
    { name: isAdmin ? "Admin Dashboard" : "Dashboard", path: isAdmin ? "/admin" : "/dashboard" },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-lg">CareerGuide</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Sign in message for public users */}
            <SignedOut>
              <div className="ml-2 flex items-center text-sm text-muted-foreground">
                <Lock className="h-3 w-3 mr-1" />
                <span>Sign in to access all features</span>
              </div>
            </SignedOut>
            
            <SignedIn>
              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </SignedIn>
          </nav>

          {/* User Authentication */}
          <div className="flex items-center space-x-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <div className="hidden md:block">
                <Button variant="ghost" asChild className="mr-2">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </SignedOut>
            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile sign in message */}
            <SignedOut>
              <div className="px-3 py-2 text-sm text-muted-foreground flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                <span>Sign in to access all features</span>
              </div>
            </SignedOut>
            
            <SignedIn>
              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </SignedIn>
            <SignedOut>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Button variant="outline" asChild className="w-full mb-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar