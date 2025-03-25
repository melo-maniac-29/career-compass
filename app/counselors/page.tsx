"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Loader2, Search, Mail, Phone, Calendar, Clock, Star, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function CounselorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("All")
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null)
  const { toast } = useToast()
  
  // Fetch all counselors
  const counselors = useQuery(api.counselors.getAllCounselors)
  
  // Extract unique specializations
  const specializations = counselors ? 
    ["All", ...Array.from(new Set(counselors.map(c => c.specialization)))] :
    ["All"]
  
  // Filter counselors
  const filteredCounselors = counselors ? 
    counselors.filter(counselor => {
      const matchesSearch = searchQuery ?
        counselor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        counselor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) :
        true
      
      const matchesSpecialization = selectedSpecialization === "All" || 
                                  counselor.specialization === selectedSpecialization
      
      return matchesSearch && matchesSpecialization
    }) : []
  
  const handleRequestSession = (counselor: any) => {
    toast({
      title: "Session Requested",
      description: `Your counseling session with ${counselor.name} has been requested. We'll contact you soon to confirm.`,
    })
  }
  
  // Show loading state
  if (counselors === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading counselors...</span>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Counseling Experts</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with experienced counselors who can guide you through your educational journey and career decisions.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-card rounded-xl p-6 shadow-lg mb-12">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search counselors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Counselors List */}
        {filteredCounselors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCounselors.map((counselor) => (
              <Card key={counselor._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border">
                        <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${counselor.name}`} />
                      </Avatar>
                      <div>
                        <CardTitle>{counselor.name}</CardTitle>
                        <CardDescription>{counselor.specialization}</CardDescription>
                      </div>
                    </div>
                    <Badge>{counselor.experience} yrs</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{counselor.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{counselor.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="capitalize">{counselor.availability}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-24 overflow-hidden text-sm text-muted-foreground">
                    <p className="line-clamp-4">{counselor.bio}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedCounselor(counselor)}>Schedule Session</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule a Session with {selectedCounselor?.name}</DialogTitle>
                        <DialogDescription>
                          Fill in the details below to request a counseling session.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="session-details">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="session-details">Session Details</TabsTrigger>
                          <TabsTrigger value="counselor-info">Counselor Info</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="session-details" className="space-y-4 py-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Select Date and Time</h4>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                                <p className="text-sm font-medium">Today</p>
                                <p className="text-xs text-muted-foreground">3:00 PM</p>
                              </div>
                              <div className="border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                                <p className="text-sm font-medium">Tomorrow</p>
                                <p className="text-xs text-muted-foreground">10:00 AM</p>
                              </div>
                              <div className="border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                                <p className="text-sm font-medium">Friday</p>
                                <p className="text-xs text-muted-foreground">1:00 PM</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Session Type</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                                <Calendar className="h-5 w-5 mx-auto mb-1" />
                                <p className="text-sm">In Person</p>
                              </div>
                              <div className="border rounded-md p-2 text-center cursor-pointer hover:border-primary">
                                <Calendar className="h-5 w-5 mx-auto mb-1" />
                                <p className="text-sm">Virtual</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Session Topic</h4>
                            <Input placeholder="Brief description of what you'd like to discuss" />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="counselor-info" className="space-y-4 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border">
                              <AvatarFallback>{selectedCounselor?.name.charAt(0)}</AvatarFallback>
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedCounselor?.name}`} />
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{selectedCounselor?.name}</h3>
                              <p className="text-sm text-muted-foreground">{selectedCounselor?.specialization}</p>
                              <div className="flex items-center mt-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs ml-1 text-muted-foreground">({selectedCounselor?.experience} years exp.)</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Bio</h4>
                            <p className="text-sm">{selectedCounselor?.bio}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-medium text-muted-foreground">Email</h4>
                              <p className="text-sm">{selectedCounselor?.email}</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-medium text-muted-foreground">Phone</h4>
                              <p className="text-sm">{selectedCounselor?.phone}</p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={() => handleRequestSession(selectedCounselor)}>
                          Request Session
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-md">
            <p className="text-muted-foreground mb-4">No counselors match your search criteria</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedSpecialization("All");
            }}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
