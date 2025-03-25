"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, GraduationCap, Building2, Users, ArrowRight, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { debounce } from "lodash"

export default function CollegesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedField, setSelectedField] = useState("All Fields")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [priceRange, setPriceRange] = useState([0])
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  
  // Fetch dynamic fields and locations from the database
  const fieldsData = useQuery(api.colleges.getAllFields) || ["All Fields"]
  const locationsData = useQuery(api.colleges.getAllLocations) || ["All Locations"]
  
  // Set up debounced search
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    handler();
    return () => {
      handler.cancel();
    };
  }, [searchQuery]);
  
  // Fetch filtered colleges from backend
  const filteredColleges = useQuery(api.colleges.getFilteredColleges, {
    searchQuery: debouncedSearchQuery || undefined,
    field: selectedField === "All Fields" ? undefined : selectedField,
    location: selectedLocation === "All Locations" ? undefined : selectedLocation,
    maxPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
  }) || [];
  
  // Feature colleges - those marked as featured
  const featuredColleges = filteredColleges.filter(college => college.featured);
  
  // Show loading state while colleges are being fetched
  const isLoading = filteredColleges === undefined;
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading colleges...</span>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Your Perfect College</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore top colleges and universities across various fields. Find the institution that aligns with your career goals and aspirations.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl p-6 shadow-lg mb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fieldsData.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationsData.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tuition Range</label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100000}
                step={1000}
                className="py-2"
              />
              <div className="text-sm text-muted-foreground">
                Up to ${priceRange[0].toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Colleges */}
        {featuredColleges.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Colleges</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredColleges.map((college) => (
                <CollegeCard key={college._id} college={college} />
              ))}
            </div>
          </div>
        )}

        {/* All Colleges */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Colleges</h2>
          {filteredColleges.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredColleges.map((college) => (
                <CollegeCard key={college._id} college={college} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-md">
              <p className="text-muted-foreground">No colleges match your search criteria</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                setSelectedField("All Fields");
                setSelectedLocation("All Locations");
                setPriceRange([0]);
              }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Extract college card component for reuse
function CollegeCard({ college }: { college: any }) {
  return (
    <Card key={college._id} className="group overflow-hidden">
      <div className="relative h-48">
        <Image
          src={college.image}
          alt={college.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          {college.fields.map((field: string) => (
            <Badge key={field} variant="secondary" className="mr-2">
              {field}
            </Badge>
          ))}
        </div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="mb-2">{college.name}</CardTitle>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{college.location}</span>
            </div>
          </div>
          <Badge variant="secondary">★ {college.rating}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{college.description}</CardDescription>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-sm font-medium">{college.students}</div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>
          <div className="text-center">
            <Building2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-sm font-medium">{college.courses}</div>
            <div className="text-xs text-muted-foreground">Courses</div>
          </div>
          <div className="text-center">
            <GraduationCap className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-sm font-medium">{college.admissionRequirements?.length || "4+"}</div>
            <div className="text-xs text-muted-foreground">Requirements</div>
          </div>
        </div>
        <Button className="w-full group" asChild>
          <Link href={`/colleges/${college._id}`}>
            View Details
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}