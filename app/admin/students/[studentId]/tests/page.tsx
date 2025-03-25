"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  FileText,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

export default function StudentTestsPage({ params }: { params: { studentId: string } }) {
  const router = useRouter()
  const studentId = params.studentId as Id<"users">
  
  // Get student data
  const student = useQuery(api.users.getStudentById, { studentId })
  
  // Get student test responses
  const testResponses = useQuery(api.aptitudeTests.getStudentTestResponses, { studentId }) || []
  
  // Sort test responses by date
  const sortedResponses = [...testResponses].sort((a, b) => b.startedAt - a.startedAt)
  
  // Loading state
  if (student === undefined || testResponses === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading student test data...</span>
      </div>
    )
  }
  
  // Handle no student found
  if (student === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Student not found</h1>
          <p className="text-muted-foreground mb-8">The student you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/admin/students')}>
            Back to Students List
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Test History: {student.name}</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{testResponses.length}</div>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{testResponses.filter(r => r.completed).length}</div>
            <p className="text-sm text-muted-foreground">Completed Tests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{testResponses.filter(r => !r.completed).length}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {testResponses.length > 0 ? 
                new Date(Math.max(...testResponses.map(r => r.startedAt))).toLocaleDateString() : 
                "-"}
            </div>
            <p className="text-sm text-muted-foreground">Last Activity</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>
            All tests taken by {student.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedResponses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">No tests taken yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResponses.map(response => (
                  <TableRow key={response._id}>
                    <TableCell className="font-medium">{response.testTitle}</TableCell>
                    <TableCell>
                      {response.completed ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-amber-600 mr-1" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(response.startedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {response.completedAt ? 
                        new Date(response.completedAt).toLocaleString() : 
                        "-"}
                    </TableCell>
                    <TableCell>
                      {response.completed && response.score !== undefined ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          {response.score}%
                        </Badge>
                      ) : response.completed ? (
                        <Badge variant="outline">Aptitude</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/aptitude-test/${response.testId}/results?responseId=${response._id}`} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Results
                        </Link>
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
  )
}
