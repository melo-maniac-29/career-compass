"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Calendar, 
  Loader2, 
  Save,
  BookOpen,
  GraduationCap
} from "lucide-react"

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
  const userProfile = useQuery(api.users.getMyProfile)
  const isAdmin = useQuery(api.users.isAdmin)
  const updateUserMutation = useMutation(api.users.updateUser)
  const { toast } = useToast()
  
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResponses, setTestResponses] = useState<any[]>([])
  
  // Get user's test responses
  const userTestResponses = useQuery(api.aptitudeTests.getUserTestResponses) || []
  
  // Populate form with user data when loaded
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "")
      setEmail(userProfile.email || "")
    }
  }, [userProfile])
  
  useEffect(() => {
    if (userTestResponses) {
      setTestResponses(userTestResponses)
    }
  }, [userTestResponses])
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?._id) return
    
    setIsLoading(true)
    
    try {
      await updateUserMutation({
        userId: userProfile._id,
        name,
        email
      })
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!isClerkLoaded || userProfile === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading your profile...</span>
      </div>
    )
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="tests">Test History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="bg-muted p-3 rounded-md">
                    <span className="capitalize">{userProfile?.role || "Student"}</span>
                    {isAdmin && <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded">Admin</span>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="joined">Joined</Label>
                  <div className="bg-muted p-3 rounded-md flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {userProfile?._creationTime ? new Date(userProfile._creationTime).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {isAdmin && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">Administrator Account</CardTitle>
                <CardDescription className="text-amber-700">
                  You have administrator privileges in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">
                  As an administrator, you have access to additional system management features.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" asChild>
                  <a href="/admin">Go to Admin Dashboard</a>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Test History
              </CardTitle>
              <CardDescription>
                Your completed aptitude tests and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResponses.length > 0 ? (
                <div className="space-y-4">
                  {testResponses.map((response) => (
                    <div 
                      key={response._id} 
                      className="border rounded-md p-4 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-medium">{response.testTitle || "Aptitude Test"}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(response.completedAt || response.startedAt).toLocaleString()}
                        </p>
                        <div className="mt-1">
                          {response.completed ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Completed
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <a href={`/aptitude-test/${response.testId}/results?responseId=${response._id}`}>
                          View Results
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">You haven't taken any tests yet</p>
                  <Button className="mt-4" asChild>
                    <a href="/aptitude-test">Take an Aptitude Test</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Educational Preferences
              </CardTitle>
              <CardDescription>
                Set your educational and career preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 text-center border-2 border-dashed rounded-md">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Preferences Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  This feature is under development. Soon, you'll be able to set your educational
                  preferences to get more personalized recommendations.
                </p>
                
                <Button className="mt-4" variant="outline">Get Notified When Available</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
