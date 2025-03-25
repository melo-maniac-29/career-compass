"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Loader2, Mail, Phone, Clock, Calendar, ArrowLeft, Star, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function CounselorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [sessionTopic, setSessionTopic] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get counselor data
  const counselor = useQuery(api.counselors.getCounselorById, { id: params.id as Id<"counselors"> })
  
  // Sample available dates for demo
  const availableDates = [
    { date: "2024-07-15", times: ["09:00", "13:00", "15:30"] },
    { date: "2024-07-16", times: ["10:00", "14:00"] },
    { date: "2024-07-17", times: ["09:30", "11:00", "16:00"] },
    { date: "2024-07-18", times: ["13:00", "15:00", "17:30"] }
  ]
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || !sessionTopic.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Session requested",
        description: `Your session with ${counselor?.name} has been requested for ${selectedDate} at ${selectedTime}.`,
      })
      setIsSubmitting(false)
    }, 1500)
  }
  
  if (counselor === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading counselor information...</span>
      </div>
    )
  }
  
  if (counselor === null) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Counselor not found</h1>
          <p className="text-muted-foreground mb-6">The counselor you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/counselors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Counselors
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" className="mb-6" onClick={() => router.push('/counselors')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Counselors
      </Button>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${counselor.name}`} />
                </Avatar>
                <CardTitle>{counselor.name}</CardTitle>
                <CardDescription>{counselor.specialization}</CardDescription>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
                <Badge className="mt-3">{counselor.experience} Years Experience</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{counselor.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                <span>{counselor.phone}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="capitalize">{counselor.availability}</span>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Separator className="my-2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">Session Fee</div>
                  <div className="font-medium">$75 / hour</div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="schedule">Schedule a Session</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {counselor.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Bio</h3>
                    <p className="text-muted-foreground">{counselor.bio}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{counselor.specialization}</Badge>
                      <Badge variant="outline">Career Guidance</Badge>
                      <Badge variant="outline">Student Counseling</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Expertise</h3>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      <li>Educational pathway planning</li>
                      <li>College admissions counseling</li>
                      <li>Career assessment and guidance</li>
                      <li>Major selection and course planning</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <span className="font-medium">Extremely helpful</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "{counselor.name} provided excellent guidance for my college applications. 
                      Their advice was invaluable in helping me get accepted to my top-choice school."
                    </p>
                    <p className="text-xs mt-2">Sarah T. - 2 months ago</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <span className="font-medium">Insightful career guidance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "I was uncertain about my career path, but after my sessions with {counselor.name}, 
                      I gained clarity on my strengths and interests. Highly recommend!"
                    </p>
                    <p className="text-xs mt-2">Michael R. - 1 month ago</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Session with {counselor.name}</CardTitle>
                  <CardDescription>
                    Choose a date and time for your counseling session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="date">Select Date</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availableDates.map((dateObj) => (
                          <div 
                            key={dateObj.date} 
                            className={`border rounded-md p-3 text-center cursor-pointer transition-colors
                              ${selectedDate === dateObj.date ? 'bg-primary/10 border-primary' : 'hover:border-primary'}`}
                            onClick={() => setSelectedDate(dateObj.date)}
                          >
                            <p className="text-sm font-medium">
                              {new Date(dateObj.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedDate && (
                      <div className="space-y-2">
                        <Label htmlFor="time">Select Time</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {availableDates
                            .find(d => d.date === selectedDate)?.times
                            .map((time) => (
                              <div 
                                key={time} 
                                className={`border rounded-md p-2 text-center cursor-pointer transition-colors
                                  ${selectedTime === time ? 'bg-primary/10 border-primary' : 'hover:border-primary'}`}
                                onClick={() => setSelectedTime(time)}
                              >
                                <p className="text-sm">{time}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="topic">Session Topic</Label>
                      <Textarea 
                        id="topic" 
                        placeholder="Briefly describe what you'd like to discuss in the session"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                      />
                    </div>
                    
                    <div className="p-4 bg-muted rounded-md">
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Session Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Counselor:</span>
                          <span className="font-medium">{counselor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {selectedDate ? 
                              new Date(selectedDate).toLocaleDateString('en-US', 
                                { weekday: 'long', month: 'long', day: 'numeric' }) : 
                              'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{selectedTime || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">1 hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fee:</span>
                          <span className="font-medium">$75</span>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={!selectedDate || !selectedTime || !sessionTopic.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Session
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
