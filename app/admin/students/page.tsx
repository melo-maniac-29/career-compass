"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Loader2, 
  Search, 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  EyeIcon,
  Trash2,
  FileText,
  CheckCircle,
  BookOpen
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/link"

export default function AdminStudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState<Id<"users"> | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Get all students
  const students = useQuery(api.users.getAllStudents) || []
  
  // Get selected student details
  const selectedStudent = useQuery(
    api.users.getStudentById, 
    selectedStudentId ? { studentId: selectedStudentId } : "skip"
  )
  
  // Get student test responses
  const studentTestResponses = useQuery(
    api.aptitudeTests.getStudentTestResponses,
    selectedStudentId ? { studentId: selectedStudentId } : "skip"
  ) || []
  
  // Delete student mutation
  const deleteStudent = useMutation(api.users.deleteUser)
  
  // Filter students
  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Handle delete confirmation
  const handleDeleteStudent = async () => {
    if (!selectedStudentId) return
    
    setIsLoading(true)
    try {
      await deleteStudent({ userId: selectedStudentId })
      toast({
        title: "Student deleted",
        description: "Student account has been successfully deleted."
      })
      setSelectedStudentId(null)
    } catch (error) {
      console.error("Failed to delete student:", error)
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete student account. Please try again."
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Student Management</h1>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Student List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                View and manage student accounts
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {students === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(student => (
                      <TableRow 
                        key={student._id}
                        className={selectedStudentId === student._id ? "bg-muted" : ""}
                      >
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student._creationTime ? 
                            new Date(student._creationTime).toLocaleDateString() : 
                            "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedStudentId(student._id)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Student Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
              <CardDescription>
                {selectedStudent ? 
                  "Viewing detailed information" : 
                  "Select a student to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedStudent ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto opacity-20 mb-3" />
                  <p>Select a student from the list</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Profile Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Name:</span>
                        <span className="ml-2">{selectedStudent.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Joined:</span>
                        <span className="ml-2">
                          {selectedStudent._creationTime ? 
                            new Date(selectedStudent._creationTime).toLocaleDateString() : 
                            "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-lg">Test Activity</h3>
                    {studentTestResponses.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        No tests completed yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total tests:</span>
                          <Badge variant="secondary">
                            {studentTestResponses.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Completed tests:</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {studentTestResponses.filter(r => r.completed).length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Last test:</span>
                          <Badge variant="outline">
                            {new Date(
                              Math.max(...studentTestResponses.map(r => r.startedAt))
                            ).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {studentTestResponses.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Latest tests:</h4>
                        <div className="space-y-2">
                          {studentTestResponses
                            .sort((a, b) => b.startedAt - a.startedAt)
                            .slice(0, 3)
                            .map(response => (
                              <div key={response._id} className="flex justify-between items-center text-sm p-2 border rounded-md">
                                <div className="flex items-center">
                                  {response.completed ? (
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 mr-2 text-amber-600" />
                                  )}
                                  <span className="line-clamp-1">
                                    {response.testTitle || "Aptitude Test"}
                                  </span>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/aptitude-test/${response.testId}/results?responseId=${response._id}`}>
                                    <EyeIcon className="h-3 w-3 mr-1" />
                                    View
                                  </Link>
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-lg">Actions</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/admin/students/${selectedStudent._id}/tests`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Test History
                        </Link>
                      </Button>
                      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Student
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Student Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this student account? This will remove all their data including test responses and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteStudent}
                              className="bg-destructive text-destructive-foreground"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
