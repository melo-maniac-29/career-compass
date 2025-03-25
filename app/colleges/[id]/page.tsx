"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, GraduationCap, Building2, Users, ArrowLeft, Calendar, Clock, DollarSign, BookOpen, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

// Fallback mock data
const mockColleges = [
  {
    id: 1,
    name: "Tech Institute of Excellence",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066",
    fields: ["Computer Science", "Engineering", "Data Science"],
    rating: 4.8,
    students: "15,000+",
    courses: 45,
    description: "Leading technology institute offering cutting-edge programs in computer science and engineering.",
    featured: true,
    tuition: "$45,000/year",
    applicationDeadline: "April 15, 2024",
    programDuration: "4 years",
    facilities: ["Modern Labs", "Research Centers", "Innovation Hub", "Digital Library"],
    admissionRequirements: ["High School Diploma", "SAT/ACT Scores", "Letters of Recommendation", "Personal Statement"],
    overview: "The Tech Institute of Excellence is a leading institution in technology education, known for its innovative approach to learning and strong industry connections. Our programs are designed to prepare students for the rapidly evolving tech landscape.",
  },
  {
    id: 2,
    name: "Medical Sciences University",
    location: "Boston, MA",
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=2089",
    fields: ["Medicine", "Pharmacy", "Biotechnology"],
    rating: 4.9,
    students: "12,000+",
    courses: 38,
    description: "Premier medical institution known for excellence in healthcare education and research.",
    featured: true,
    tuition: "$52,000/year",
    applicationDeadline: "March 1, 2024",
    programDuration: "4-6 years",
    facilities: ["Teaching Hospital", "Research Labs", "Simulation Centers", "Medical Library"],
    admissionRequirements: ["Bachelor's Degree", "MCAT Scores", "Clinical Experience", "Letters of Recommendation"],
    overview: "Medical Sciences University is dedicated to advancing healthcare through exceptional education, groundbreaking research, and compassionate patient care. Our programs combine rigorous academic training with hands-on clinical experience.",
  },
  {
    id: 3,
    name: "Business School of Management",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070",
    fields: ["Business Administration", "Finance", "Marketing"],
    rating: 4.7,
    students: "10,000+",
    courses: 32,
    description: "Top-ranked business school preparing future leaders in global business.",
    featured: false,
    tuition: "$48,000/year",
    applicationDeadline: "May 1, 2024",
    programDuration: "2-4 years",
    facilities: ["Trading Floor", "Business Incubator", "Conference Center", "Career Center"],
    admissionRequirements: ["Bachelor's Degree", "GMAT/GRE Scores", "Work Experience", "Essays"],
    overview: "The Business School of Management is committed to developing the next generation of business leaders. Our curriculum combines theoretical knowledge with practical experience, preparing students for success in the global marketplace.",
  },
]

export default function CollegePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  
  // Better ID handling for both database IDs and mock data
  const isNumericId = !isNaN(Number(params.id))
  
  // Fix the query by making it conditional
  const collegeId = isNumericId ? undefined : params.id
  const collegeData = useQuery(
    api.colleges.getCollegeById, 
    collegeId ? { id: collegeId as Id<"colleges"> } : "skip"
  )
  
  useEffect(() => {
    // Only show loading for real database queries, use mock data immediately for numeric IDs
    if (collegeData !== undefined || isNumericId) {
      setIsLoading(false)
    }
  }, [collegeData, isNumericId])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading college details...</span>
      </div>
    )
  }
  
  // Use API data or fallback to mock data
  const college = collegeData ? {
    id: collegeData._id,
    name: collegeData.name,
    location: collegeData.location,
    image: collegeData.image || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066",
    fields: collegeData.fields || [],
    rating: collegeData.rating,
    students: collegeData.students,
    courses: collegeData.courses,
    description: collegeData.description || "",
    featured: collegeData.featured || false,
    tuition: collegeData.tuition || "$0",
    applicationDeadline: collegeData.applicationDeadline || "Not specified",
    programDuration: collegeData.programDuration || "Not specified",
    facilities: collegeData.facilities || [],
    admissionRequirements: collegeData.admissionRequirements || [],
    overview: collegeData.overview || "",
    website: collegeData.website || "#"
  } : mockColleges.find((c) => c.id === parseInt(params.id) || c.id.toString() === params.id)

  if (!college) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="group">
            <Link href="/colleges">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Colleges
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-12">
          <Image
            src={college.image}
            alt={college.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex gap-2 mb-4">
                  {college.fields.map((field) => (
                    <Badge key={field} variant="secondary">
                      {field}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">{college.name}</h1>
                <div className="flex items-center text-white/80">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{college.location}</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg">★ {college.rating}</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{college.overview}</CardDescription>
              </CardContent>
            </Card>

            {/* Key Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">{college.students}</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">{college.courses}</div>
                  <div className="text-sm text-muted-foreground">Courses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">{college.fields?.length || 0}+</div>
                  <div className="text-sm text-muted-foreground">Programs</div>
                </CardContent>
              </Card>
            </div>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Campus Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {college.facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admission Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Admission Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {college.admissionRequirements.map((requirement) => (
                    <div key={requirement} className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Tuition Fee</div>
                    <div className="text-sm text-muted-foreground">{college.tuition}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Application Deadline</div>
                    <div className="text-sm text-muted-foreground">{college.applicationDeadline}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Program Duration</div>
                    <div className="text-sm text-muted-foreground">{college.programDuration}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button className="w-full" size="lg">
                Apply Now
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                Download Brochure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}