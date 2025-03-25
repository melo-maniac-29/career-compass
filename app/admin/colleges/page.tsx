"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

export default function ManageCollegesPage() {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [description, setDescription] = useState("")
  const [ranking, setRanking] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  
  const [image, setImage] = useState("https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066")
  const [fields, setFields] = useState<string[]>(["General"])
  const [rating, setRating] = useState(4.0)
  const [students, setStudents] = useState("0")
  const [courses, setCourses] = useState(0)
  const [featured, setFeatured] = useState(false)
  const [tuition, setTuition] = useState("$0/year")
  const [applicationDeadline, setApplicationDeadline] = useState("Not specified")
  const [programDuration, setProgramDuration] = useState("Not specified")
  const [facilities, setFacilities] = useState<string[]>(["Campus"])
  const [admissionRequirements, setAdmissionRequirements] = useState<string[]>(["Application"])
  const [overview, setOverview] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()
  
  const addCollege = useMutation(api.colleges.addCollege)
  const deleteCollege = useMutation(api.colleges.deleteCollege)
  const colleges = useQuery(api.colleges.getAllColleges) || []
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !location) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in at least the college name and location."
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      await addCollege({
        name,
        location,
        image,
        fields,
        rating,
        students,
        courses,
        description,
        featured,
        tuition,
        applicationDeadline,
        programDuration,
        facilities,
        admissionRequirements,
        overview,
        website: website || undefined,
      })
      
      toast({
        title: "College added",
        description: "The college has been added successfully."
      })
      
      // Clear the form
      setName("")
      setLocation("")
      setWebsite("")
      setDescription("")
      setRanking(undefined)
      
    } catch (error) {
      console.error("Error adding college:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add the college. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (collegeId: string) => {
    if (!confirm("Are you sure you want to delete this college?")) {
      return
    }
    
    try {
      // Fix the type casting for the ID
      await deleteCollege({ id: collegeId as Id<"colleges"> })
      toast({
        title: "College deleted",
        description: "The college has been deleted successfully."
      })
    } catch (error) {
      console.error("Error deleting college:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the college. Please try again."
      })
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Colleges</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin")}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New College</CardTitle>
            <CardDescription>
              Enter the details of the college to add it to the database
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input
                  id="name"
                  placeholder="Enter college name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://example.edu"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter details about the college"
                  className="min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ranking">Ranking (optional)</Label>
                <Input
                  id="ranking"
                  type="number"
                  placeholder="College ranking (e.g., 1-100)"
                  value={ranking === undefined ? "" : ranking}
                  onChange={(e) => setRanking(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  placeholder="Enter image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fields">Fields of Study</Label>
                <Input
                  id="fields"
                  placeholder="Enter fields of study"
                  value={fields.join(", ")}
                  onChange={(e) => setFields(e.target.value.split(", "))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  placeholder="Enter rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="students">Number of Students</Label>
                <Input
                  id="students"
                  placeholder="Enter number of students"
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courses">Number of Courses</Label>
                <Input
                  id="courses"
                  type="number"
                  placeholder="Enter number of courses"
                  value={courses}
                  onChange={(e) => setCourses(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured">Featured</Label>
                <Input
                  id="featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tuition">Tuition</Label>
                <Input
                  id="tuition"
                  placeholder="Enter tuition"
                  value={tuition}
                  onChange={(e) => setTuition(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                <Input
                  id="applicationDeadline"
                  placeholder="Enter application deadline"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programDuration">Program Duration</Label>
                <Input
                  id="programDuration"
                  placeholder="Enter program duration"
                  value={programDuration}
                  onChange={(e) => setProgramDuration(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities</Label>
                <Input
                  id="facilities"
                  placeholder="Enter facilities"
                  value={facilities.join(", ")}
                  onChange={(e) => setFacilities(e.target.value.split(", "))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionRequirements">Admission Requirements</Label>
                <Input
                  id="admissionRequirements"
                  placeholder="Enter admission requirements"
                  value={admissionRequirements.join(", ")}
                  onChange={(e) => setAdmissionRequirements(e.target.value.split(", "))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  placeholder="Enter overview"
                  className="min-h-32"
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Adding College..." : "Add College"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>College List</CardTitle>
            <CardDescription>
              All colleges in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {colleges.length === 0 ? (
              <div className="border rounded-md p-4">
                <p className="text-center text-muted-foreground">
                  No colleges added yet
                </p>
              </div>
            ) : (
              <div className="border rounded-md divide-y">
                {colleges.map((college) => (
                  <div key={college._id} className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{college.name}</h3>
                      <p className="text-sm text-muted-foreground">{college.location}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(college._id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}