"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  ClipboardList, 
  Clock, 
  Briefcase
} from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

// Define categories and difficulties - simplify to just the two needed types
const categories = [
  "Skills Assessment", 
  "Aptitude"
]

const difficulties = ["Easy", "Medium", "Hard"]

export default function ManageAptitudeTestsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for new test form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [difficulty, setDifficulty] = useState(difficulties[0])
  const [timeLimit, setTimeLimit] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [active, setActive] = useState(false)
  const [careerFields, setCareerFields] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // State for selected test
  const [selectedTestId, setSelectedTestId] = useState<Id<"aptitudeTests"> | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Query for fetching all tests
  const tests = useQuery(api.aptitudeTests.getAllTests) 
  const safeTests = tests || []
  
  // Handle API errors
  useEffect(() => {
    if (tests === null) {
      setError("Failed to load tests. Please try refreshing the page.")
    } else {
      setError(null)
    }
  }, [tests])
  
  // Get questions for selected test
  const questions = useQuery(
    api.aptitudeTests.getTestQuestions, 
    selectedTestId ? { testId: selectedTestId } : "skip"
  ) || []
  
  // Get the selected test
  const selectedTest = useQuery(
    api.aptitudeTests.getTestById, 
    selectedTestId ? { testId: selectedTestId } : "skip"
  )
  
  // Mutations
  const createTest = useMutation(api.aptitudeTests.createTest)
  const deleteTest = useMutation(api.aptitudeTests.deleteTest)
  const updateTest = useMutation(api.aptitudeTests.updateTest)
  
  // Set first test as selected when tests load
  useEffect(() => {
    if (safeTests.length > 0 && !selectedTestId) {
      setSelectedTestId(safeTests[0]._id)
    }
  }, [safeTests, selectedTestId])
  
  const handleCreateTest = async () => {
    // More robust form validation
    const errors = [];
    if (!title.trim()) errors.push("Test title is required");
    if (!description.trim()) errors.push("Test description is required");
    if (!category) errors.push("Category is required");
    
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: errors.join(", ")
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Validate timeLimit is a positive number
      const timeLimitValue = timeLimit ? parseInt(timeLimit) : undefined;
      if (timeLimit && (isNaN(timeLimitValue!) || timeLimitValue! <= 0)) {
        throw new Error("Time limit must be a positive number");
      }
      
      const fields = careerFields.split(",").map(field => field.trim()).filter(Boolean)
      
      const newTestId = await createTest({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        timeLimit: timeLimitValue,
        imageUrl: imageUrl.trim() || undefined,
        active,
        careerFields: fields,
      })
      
      if (!newTestId) {
        throw new Error("Failed to create test - no ID returned");
      }
      
      toast({
        title: "Test created",
        description: "The aptitude test has been created successfully."
      })
      
      // Clear the form
      setTitle("")
      setDescription("")
      setCategory(categories[0])
      setDifficulty(difficulties[0])
      setTimeLimit("")
      setImageUrl("")
      setActive(false)
      setCareerFields("")
      
      // Select the new test
      setSelectedTestId(newTestId)
      
    } catch (error) {
      console.error("Error creating test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create the test. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteTest = async () => {
    if (!selectedTestId) return
    
    try {
      await deleteTest({ testId: selectedTestId })
      
      toast({
        title: "Test deleted",
        description: "The aptitude test has been deleted successfully."
      })
      
      setSelectedTestId(null)
    } catch (error) {
      console.error("Error deleting test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the test. Please try again."
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }
  
  const handleToggleActive = async (testId: Id<"aptitudeTests">, currentActive: boolean) => {
    try {
      await updateTest({
        testId,
        active: !currentActive
      })
      
      toast({
        title: `Test ${!currentActive ? "activated" : "deactivated"}`,
        description: `The test is now ${!currentActive ? "visible" : "hidden"} to students.`
      })
    } catch (error) {
      console.error("Error updating test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the test status."
      })
    }
  }
  
  const handleEditQuestions = (testId: Id<"aptitudeTests">) => {
    router.push(`/admin/tests/${testId}/questions`)
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Aptitude Tests</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push("/admin")}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs defaultValue="tests" className="mb-6">
        <TabsList>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="create">Create New Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Aptitude Tests</CardTitle>
              <CardDescription>
                All available aptitude tests in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-10">
                  <div className="text-red-500 mb-4">Error: {error}</div>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              ) : tests === undefined ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading tests...</span>
                </div>
              ) : safeTests.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No aptitude tests created yet. Use the "Create New Test" tab to add one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeTests.map((test) => (
                      <TableRow 
                        key={test._id} 
                        className={selectedTestId === test._id ? "bg-muted/50" : ""}
                        onClick={() => setSelectedTestId(test._id)}
                      >
                        <TableCell className="font-medium">{test.title}</TableCell>
                        <TableCell>{test.category}</TableCell>
                        <TableCell>{test.difficulty}</TableCell>
                        <TableCell>
                          {test.active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggleActive(test._id, test.active)}
                            >
                              {test.active ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestions(test._id);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Questions
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {selectedTest && (
              <CardFooter className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {questions.length} questions | {selectedTest.timeLimit ? `${selectedTest.timeLimit} min` : 'No time limit'}
                  </p>
                </div>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Test
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the test "{selectedTest.title}" and all associated questions and responses.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTest}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Aptitude Test</CardTitle>
              <CardDescription>
                Fill in the details to create a new aptitude test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  placeholder="Enter test title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter test description"
                  className="min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">
                    Time Limit (minutes, optional)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    placeholder="Enter time limit in minutes"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="careerFields">
                    Related Career Fields (comma-separated)
                  </Label>
                  <div className="space-y-1">
                    <Input
                      id="careerFields"
                      placeholder="E.g., Engineering, Medicine, Business"
                      value={careerFields}
                      onChange={(e) => setCareerFields(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      These fields will be used for interest analysis based on question responses.
                      Add all relevant career fields that this test can help identify.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="Enter image URL for the test"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="active"
                  checked={active}
                  onCheckedChange={setActive}
                />
                <Label htmlFor="active">
                  Make test active and available to students
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleCreateTest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Test...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Aptitude Test
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Add new info section about career analysis */}
          <div className="mt-8 p-4 border rounded-md bg-muted/20">
            <h3 className="text-lg font-medium mb-2">Test Types Explained</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-md border border-green-100">
                <h4 className="font-medium text-green-800 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Skills Assessment
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Tests knowledge with questions that have correct answers. Results show a score based on number of correct answers.
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium text-green-700">Key features:</span>
                  <ul className="list-disc pl-5 text-green-700 mt-1">
                    <li>Questions have specific correct answers</li>
                    <li>Results show percentage of correct answers</li>
                    <li>Tests factual knowledge and skills</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <h4 className="font-medium text-blue-800 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Aptitude
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Analyzes preferences without correct answers. Each response contributes to career field interest scores.
                </p>
                <div className="mt-2 text-sm">
                  <span className="font-medium text-blue-700">Key features:</span>
                  <ul className="list-disc pl-5 text-blue-700 mt-1">
                    <li>No "right or wrong" answers</li>
                    <li>Options linked to career fields with point values</li>
                    <li>Results show career field interest distribution</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-sm font-medium text-amber-800">Important:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700 mt-1">
                <li>For <span className="font-medium">Aptitude tests</span>: Always select "No correct answer" when adding questions</li>
                <li>For <span className="font-medium">Skills Assessment tests</span>: Always specify the correct answer</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
