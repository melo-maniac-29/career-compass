"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { 
  Loader2, 
  ArrowLeft,
  FileCheck, 
  Users, 
  School,
  BookOpen,
  Activity,
  Briefcase,
  Search,
  Calendar,
  FilterX
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

// Current date for default date range
const today = new Date()
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(today.getDate() - 30)

export default function ActivityLogsPage() {
  const router = useRouter()
  
  // Filtering and pagination state
  const [searchQuery, setSearchQuery] = useState("")
  const [eventType, setEventType] = useState("all")
  const [startDate, setStartDate] = useState(format(thirtyDaysAgo, "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"))
  const [page, setPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Get all system events - in a real implementation, you'd want to paginate from the API
  const allEvents = useQuery(api.systemEvents.getAllEvents) || []
  
  // Get event types for filtering
  const eventTypes = ["all", ...Array.from(new Set(allEvents.map(e => e.type)))]
  
  // Apply filters
  const filteredEvents = allEvents.filter(event => {
    // Filter by search query (user email or entity name)
    const matchesSearch = !searchQuery || 
      (event.userEmail && event.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.entityName && event.entityName.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Filter by event type
    const matchesType = eventType === "all" || event.type === eventType
    
    // Filter by date range
    const eventDate = new Date(event.timestamp)
    const isInDateRange = 
      (!startDate || eventDate >= new Date(startDate)) && 
      (!endDate || eventDate <= new Date(`${endDate}T23:59:59`))
    
    return matchesSearch && matchesType && isInDateRange
  })
  
  // Sort by timestamp (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => b.timestamp - a.timestamp)
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage)
  const paginatedEvents = sortedEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )
  
  // Helper function to get event icon and color
  const getEventDisplay = (type: string, status: string) => {
    switch (type) {
      case "test_completed":
        return { 
          icon: <FileCheck className="h-4 w-4 mr-2 text-green-600" />,
          badgeColor: "bg-green-100 text-green-800"
        };
      case "test_created":
        return { 
          icon: <BookOpen className="h-4 w-4 mr-2 text-blue-600" />,
          badgeColor: "bg-blue-100 text-blue-800"
        };
      case "college_added":
        return { 
          icon: <School className="h-4 w-4 mr-2 text-blue-600" />,
          badgeColor: "bg-blue-100 text-blue-800"
        };
      case "counselor_added":
        return { 
          icon: <Briefcase className="h-4 w-4 mr-2 text-indigo-600" />,
          badgeColor: "bg-indigo-100 text-indigo-800"
        };
      case "user_registered":
        return { 
          icon: <Users className="h-4 w-4 mr-2 text-violet-600" />,
          badgeColor: "bg-violet-100 text-violet-800"
        };
      default:
        return { 
          icon: <Activity className="h-4 w-4 mr-2 text-gray-600" />,
          badgeColor: "bg-gray-100 text-gray-800"
        };
    }
  };
  
  // Clear filters
  const resetFilters = () => {
    setSearchQuery("")
    setEventType("all")
    setStartDate(format(thirtyDaysAgo, "yyyy-MM-dd"))
    setEndDate(format(today, "yyyy-MM-dd"))
    setPage(1)
  }
  
  if (allEvents === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading activity logs...</span>
      </div>
    )
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
          <h1 className="text-3xl font-bold">System Activity Logs</h1>
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Activity</CardTitle>
          <CardDescription>
            Refine the logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or entity..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? "All Events" : type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2 space-y-1">
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="w-1/2 space-y-1">
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}  
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Activity Logs</CardTitle>
            <Badge variant="outline">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No activity logs found matching your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map(event => {
                  const { icon, badgeColor } = getEventDisplay(event.type, event.status)
                  const displayType = event.type.replace(/_/g, ' ')
                  
                  return (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {icon}
                          <span className="capitalize">{displayType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{event.userEmail || "System"}</TableCell>
                      <TableCell>{event.entityName || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span title={new Date(event.timestamp).toLocaleString()}>
                            {new Date(event.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={badgeColor}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={event.details || ""}>
                        {event.details || "-"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show 5 pages max with current page in the middle when possible
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      const leftOffset = Math.min(Math.max(0, page - 3), totalPages - 5)
                      pageNum = i + 1 + leftOffset
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === page}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
