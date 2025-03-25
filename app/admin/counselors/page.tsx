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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, AlertCircle } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

// Define types for counselor data
type Counselor = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  bio?: string;
  availability: string;
}

export default function ManageCounselorsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [experience, setExperience] = useState("")
  const [bio, setBio] = useState("")
  const [availability, setAvailability] = useState("full-time")
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  
  const router = useRouter()
  const { toast } = useToast()
  
  // You would need to create these mutations in your Convex backend
  const addCounselor = useMutation(api.counselors.addCounselor)
  const deleteCounselor = useMutation(api.counselors.deleteCounselor)
  
  // Improved query handling
  const counselorsQuery = useQuery(api.counselors.getAllCounselors)
  const isCounselorsLoading = counselorsQuery === undefined
  const counselors = counselorsQuery || []
  
  // Define function to handle errors separately - don't call during render
  const handleQueryError = () => {
    return counselorsQuery === undefined && !isCounselorsLoading
  }
  
  const counselorsError = handleQueryError()
  
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!name.trim()) errors.name = "Name is required"
    if (!email.trim()) errors.email = "Email is required"
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email is required"
    if (experience && isNaN(Number(experience))) errors.experience = "Experience must be a number"
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors."
      })
      return
    }
    
    const submitAvailability = availability || "full-time"
    console.log("Submitting with availability:", submitAvailability)
    
    setIsLoading(true)
    
    try {
      const result = await addCounselor({
        name,
        email,
        phone,
        specialization,
        experience: experience ? parseInt(experience) : 0,
        bio,
        availability: submitAvailability
      })
      
      toast({
        title: "Counselor added",
        description: "The counselor has been added successfully."
      })
      
      // Clear the form
      setName("")
      setEmail("")
      setPhone("")
      setSpecialization("")
      setExperience("")
      setBio("")
      setAvailability("full-time")
      
    } catch (error) {
      console.error("Error adding counselor:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : "Failed to add the counselor. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    try {
      // Fix the type casting for the ID
      await deleteCounselor({ id: id as Id<"counselors"> })
      toast({
        title: "Counselor removed",
        description: "The counselor has been removed successfully."
      })
    } catch (error) {
      console.error("Error deleting counselor:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : "Failed to delete the counselor."
      })
    }
  }

  // Make extra sure the availability value is never empty
  const safeAvailability = (value: string | undefined) => {
    return value || "full-time";
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Counselors</h1>
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
            <CardTitle>Add New Counselor</CardTitle>
            <CardDescription>
              Enter the details of the counselor to add them to the platform
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter counselor's name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="counselor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="E.g. College Admissions, Career Guidance"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="Years of experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={validationErrors.experience ? "border-red-500" : ""}
                />
                {validationErrors.experience && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {validationErrors.experience}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={safeAvailability(availability)} 
                  onValueChange={(value) => {
                    console.log("Selected availability:", value);
                    setAvailability(safeAvailability(value));
                  }}
                  defaultValue="full-time"
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="weekends">Weekends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Counselor Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Enter counselor's biography and expertise"
                  className="min-h-32"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Counselor...
                  </>
                ) : (
                  "Add Counselor"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Counselor List</CardTitle>
            <CardDescription>
              All counselors currently available on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Boolean(counselorsError) ? (
              <div className="border rounded-md p-4 bg-red-50">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p>Error loading counselors. Please refresh the page.</p>
                </div>
              </div>
            ) : isCounselorsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading counselors...</span>
              </div>
            ) : counselors.length === 0 ? (
              <div className="border rounded-md p-4">
                <p className="text-center text-muted-foreground">
                  No counselors added yet
                </p>
              </div>
            ) : (
              <div className="border rounded-md divide-y">
                {counselors.map((counselor: Counselor) => (
                  <div key={counselor._id} className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{counselor.name}</h3>
                      <p className="text-sm text-muted-foreground">{counselor.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Specialization: {counselor.specialization || "Not specified"}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(counselor._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
