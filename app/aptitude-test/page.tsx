"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  ArrowRight, 
  Clock, 
  FileCheck, 
  BrainCircuit,
  Search,
  Dices,
  FileQuestion
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, GraduationCap } from "lucide-react"

export default function AptitudeTestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [error, setError] = useState<string | null>(null)
  
  // Get all available tests for students
  const tests = useQuery(api.aptitudeTests.getActiveTests) 
  
  // Get user's test responses to show progress
  const testResponses = useQuery(api.aptitudeTests.getUserTestResponses)
  
  // Handle API errors
  useEffect(() => {
    if (tests === undefined || testResponses === undefined) {
      // Still loading
      return
    }
    
    // Reset error when data loads successfully
    setError(null)
  }, [tests, testResponses])
  
  // Handle API errors with the useQuery error callback
  useEffect(() => {
    if (tests === null) {
      setError("Failed to load tests. Please try again later.")
    }
  }, [tests])
  
  // Build a map of completed tests for quick lookup
  const completedTestsMap = new Map(
    (testResponses || [])
      .filter(response => response.completed)
      .map(response => [response.testId, response])
  )

  // Extract all unique categories
  const allCategories = ["all", ...new Set((tests || []).map(test => test.category.toLowerCase()))]

  // Apply filters
  const filteredTests = (tests || []).filter(test => {
    // Filter by search query
    const matchesSearch = 
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by category
    const matchesCategory = selectedCategory === "all" || test.category.toLowerCase() === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  const isLoading = tests === undefined || testResponses === undefined
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading aptitude tests...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Aptitude Tests & Assessments</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your strengths, interests, and potential career paths through our specialized assessment tools.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-xl p-6 shadow-lg mb-12">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search aptitude tests..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-auto pb-2">
              {allCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Category filter tabs */}
        <Tabs 
          defaultValue="all" 
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mb-8"
        >
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            {allCategories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Aptitude Tests Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tests found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find more results.
              </p>
            </div>
          ) : (
            filteredTests.map(test => {
              const isCompleted = completedTestsMap.has(test._id)
              const responseId = completedTestsMap.get(test._id)
              
              return (
                <Card key={test._id} className="overflow-hidden flex flex-col">
                  <div className="relative h-40">
                    <Image
                      src={test.imageUrl || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070"}
                      alt={test.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary">
                        {test.category}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{test.title}</CardTitle>
                      <Badge variant="outline">
                        {test.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {test.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4 mr-2" />
                      {test.timeLimit ? `${test.timeLimit} minutes` : "No time limit"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {test.careerFields.slice(0, 3).map((field, index) => (
                        <Badge key={index} variant="outline">
                          {field}
                        </Badge>
                      ))}
                      {test.careerFields.length > 3 && (
                        <Badge variant="outline">
                          +{test.careerFields.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isCompleted ? (
                      <Button className="w-full" asChild>
                        <Link href={`/aptitude-test/${test._id}/results?responseId=${responseId}`}>
                          View Results
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full group" asChild>
                        <Link href={`/aptitude-test/${test._id}`}>
                          Take Test
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>

        {/* Information section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Take An Aptitude Test?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Discover Your Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Uncover career paths that align with your natural abilities, interests, and personality traits.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive detailed analysis of your strengths, preferences, and potential areas for development.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Informed Decisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Make confident educational and career choices based on objective assessment data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
