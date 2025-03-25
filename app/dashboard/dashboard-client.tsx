"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
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
import { Progress } from "@/components/ui/progress"
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar, 
  ChevronRight, 
  BookMarked, 
  Settings, 
  BarChart3,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock
} from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function DashboardClient() {
  const { user, isLoaded } = useUser()
  const userProfile = useQuery(api.users.getMyProfile)
  const isAdmin = useQuery(api.users.isAdmin)
  
  // Get all data needed for a comprehensive dashboard
  const testResponses = useQuery(api.aptitudeTests.getUserTestResponses) || []
  const allColleges = useQuery(api.colleges.getAllColleges) || []
  const allCounselors = useQuery(api.counselors.getAllCounselors) || []
  
  // Get upcoming events (assuming there would be an events collection)
  // For now, we'll just show available counselors as "events"
  const upcomingEvents = useMemo(() => {
    return allCounselors.filter(c => c.availability === 'weekends' || c.availability === 'full-time')
      .slice(0, 2);
  }, [allCounselors]);

  const completedTests = testResponses.filter(test => test.completed).length
  const latestResponse = testResponses.length > 0 ? 
    testResponses.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))[0] : null
  
  // Calculate profile completion percentage
  const [profileCompletionData, setProfileCompletionData] = useState({
    percentage: 30,
    status: "Basic information provided"
  })
  
  // Add debugging to trace the matching process with proper null checks
  useEffect(() => {
    if (latestResponse?.results?.recommendedFields) {
      console.log("Career fields from test:", latestResponse.results.recommendedFields);
      
      // Safely access bestMatch which might be in different locations depending on the test type
      const bestMatch = 
        latestResponse.results.bestMatch || 
        (latestResponse.results.details && latestResponse.results.details.bestMatch);
      
      console.log("Best match:", bestMatch);
      console.log("Available colleges:", allColleges.map(c => ({ name: c.name, fields: c.fields })));
    } else if (testResponses.some(test => test.completed)) {
      console.log("No recommended fields found in completed test responses");
      console.log("Latest response:", latestResponse);
    }
  }, [latestResponse, testResponses, allColleges]);

  // Improve the college matching logic to be more flexible with field names
  const collegeMatches = useMemo(() => {
    // Default when no tests completed
    if (!testResponses.some(test => test.completed) || !allColleges.length) return [];

    // Get career fields from last completed test
    const fieldsFromLastTest = latestResponse?.results?.recommendedFields || [];
    if (!fieldsFromLastTest.length) return [];
    
    // Find colleges matching the user's top career fields
    return allColleges
      .filter(college => {
        // First ensure college has fields
        if (!college.fields || college.fields.length === 0) return false;
        
        // Match if any of the college's fields match user's recommended fields
        // Use case-insensitive matching for better results
        return college.fields.some(collegeField => 
          fieldsFromLastTest.some(userField => 
            collegeField.toLowerCase().includes(userField.toLowerCase()) ||
            userField.toLowerCase().includes(collegeField.toLowerCase())
          )
        );
      })
      .slice(0, 5); // Limit to 5 matches
  }, [testResponses, allColleges, latestResponse]);

  // Calculate profile completion percentage
  useEffect(() => {
    if (!userProfile) return;
    
    // Count filled profile fields as a percentage
    let score = 0;
    let status = "No profile information";
    
    // Basic information - 50%
    if (userProfile.name) score += 20;
    if (userProfile.email) score += 20;
    if (userProfile.role) score += 10;
    
    // More data - remaining 50%
    if (testResponses.some(r => r.completed)) score += 25;
    if (collegeMatches.length > 0) score += 25;
    
    if (score < 30) status = "Minimal information";
    else if (score < 60) status = "Basic information provided";
    else if (score < 90) status = "Most information completed";
    else status = "Profile complete";
    
    setProfileCompletionData({
      percentage: score,
      status
    });
  }, [userProfile, testResponses, collegeMatches]);
  
  if (!isLoaded || userProfile === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading your profile...</span>
      </div>
    )
  }
  
  // If user is admin, redirect to admin dashboard
  if (isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          You are logged in as an administrator
        </p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-amber-600" />
            <div>
              <h3 className="text-lg font-medium text-amber-800">Administrator Access</h3>
              <p className="text-amber-700">You have admin privileges. Use the admin panel to manage system content.</p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/admin">
                Go to Admin Panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="shortcuts" className="mb-6">
          <TabsList>
            <TabsTrigger value="shortcuts">Quick Actions</TabsTrigger>
            <TabsTrigger value="stats">System Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shortcuts" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center" asChild>
                <Link href="/admin/tests">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Manage Tests</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center" asChild>
                <Link href="/admin/students">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Manage Students</span>
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center" asChild>
                <Link href="/admin/colleges">
                  <GraduationCap className="h-6 w-6 mb-2" />
                  <span>Manage Colleges</span>
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    System Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>View complete system statistics in the admin panel.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href="/admin">View Statistics</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Manage student accounts and permissions.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href="/admin/students">Manage Users</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // Regular user dashboard
  const bestMatch = latestResponse?.results?.bestMatch || 
                   (latestResponse?.results?.details && latestResponse.results.details.bestMatch);

  // Helper function to safely convert IDs to strings
  function safeIdToString(id: any): string {
    if (!id) return '';
    
    // If it's already a string, return it
    if (typeof id === 'string') return id;
    
    // Try toString() method if available
    if (id.toString && typeof id.toString === 'function') {
      const str = id.toString();
      return str !== '[object Object]' ? str : '';
    }
    
    // Fallback to simple string conversion
    return String(id);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName || userProfile?.name || "Student"}!</h1>
      <p className="text-muted-foreground mb-8">
        Track your progress and explore educational opportunities
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileCompletionData.percentage}%</div>
            <Progress value={profileCompletionData.percentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {profileCompletionData.status}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/profile">Update Profile</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tests Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedTests > 0 ? 
                `Last test: ${new Date(latestResponse?.completedAt || Date.now()).toLocaleDateString()}` : 
                "No tests completed yet"}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/aptitude-test">Take a Test</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              College Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collegeMatches.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {collegeMatches.length > 0 ? 
                `Based on your ${latestResponse?.results?.bestMatch?.field || "interests"}` : 
                "Complete a test to find matches"}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/colleges">View Colleges</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Counseling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {upcomingEvents.length > 0 ? 
                `Including ${upcomingEvents[0].specialization} experts` : 
                "No counselors available currently"}
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="link" size="sm" className="px-0" asChild>
              <Link href="/counselors">View Counselors</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {bestMatch ? (
          <Card className="bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Your Best Career Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-800">{bestMatch.field}</div>
              <div className="flex items-center mt-2">
                <Progress 
                  value={bestMatch.confidenceScore} 
                  className="h-2 flex-1 bg-green-100"
                  indicatorClassName="bg-green-600" 
                />
                <span className="text-xs font-medium text-green-800 ml-2">
                  {bestMatch.confidenceScore}%
                </span>
              </div>
              <p className="text-xs text-green-700 mt-2">
                {bestMatch.confidenceLevel} confidence match
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="text-green-800 px-0" asChild>
                <Link href={`/aptitude-test/${latestResponse.testId}/results?responseId=${safeIdToString(latestResponse._id)}`}>
                  View Analysis
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : completedTests > 0 ? (
          // Add an info card when tests are completed but no career match data is available
          <Card className="bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">
                Career Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base text-amber-700">Complete career assessment</div>
              <p className="text-xs text-amber-600 mt-2">
                Take our career aptitude test to get personalized matches
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="text-amber-800 px-0" asChild>
                <Link href="/aptitude-test">
                  Find Your Match
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Career Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground mt-2">
                Complete an aptitude test
              </p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" size="sm" className="px-0" asChild>
                <Link href="/aptitude-test">Find Your Match</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-7 mb-6">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Complete these actions to improve your recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedTests === 0 && (
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Complete Aptitude Test</div>
                    <div className="text-sm text-muted-foreground">Discover your strengths and interests</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/aptitude-test">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
            
            {collegeMatches.length > 0 && (
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">View Your College Matches</div>
                    <div className="text-sm text-muted-foreground">
                      {collegeMatches.length} colleges match your {latestResponse?.results?.bestMatch?.field} profile
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/colleges">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Book a Counseling Session</div>
                  <div className="text-sm text-muted-foreground">Get guidance from an expert</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/counselors">
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Manage your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{user?.fullName || userProfile?.name || 'Not set'}</div>
                
                <div className="font-medium">Email:</div>
                <div className="truncate">{user?.primaryEmailAddress?.emailAddress || userProfile?.email || 'Not set'}</div>
                
                <div className="font-medium">Role:</div>
                <div className="capitalize">{userProfile?.role || 'Student'}</div>
                
                <div className="font-medium">Joined:</div>
                <div>{userProfile?._creationTime ? new Date(userProfile._creationTime).toLocaleDateString() : 'Unknown'}</div>

                {latestResponse?.results?.bestMatch?.field && (
                  <>
                    <div className="font-medium">Top Career Match:</div>
                    <div className="font-medium text-green-700">{latestResponse.results.bestMatch.field}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profile">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {testResponses.length > 0 ? (
            <div className="space-y-4">
              {testResponses
                .sort((a, b) => (b.completedAt || b.startedAt || 0) - (a.completedAt || a.startedAt || 0))
                .slice(0, 3)
                .map((response, idx) => (
                <div key={response._id} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div>
                    <div className="font-medium flex items-center">
                      {response.completed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          Completed Test
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                          Started Test
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(response.completedAt || response.startedAt).toLocaleString()}
                    </div>
                    {response.results?.bestMatch && (
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-800 mt-1">
                          {response.results.bestMatch.field} - {response.results.bestMatch.confidenceScore}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/aptitude-test/${response.testId}/results?responseId=${safeIdToString(response._id)}`}>
                      View {response.completed ? "Results" : "Test"}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground">No recent activity found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Take an aptitude test to get started!</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/aptitude-test">Take a Test</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {collegeMatches.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>College Matches Based on Your Profile</CardTitle>
            <CardDescription>
              Institutions matching your {latestResponse?.results?.bestMatch?.field || "career interests"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collegeMatches.map((college) => (
                <div key={college._id} className="border rounded-md p-4 hover:border-primary transition-colors">
                  <h3 className="font-medium">{college.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{college.location}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {college.fields?.map((field, i) => (
                      <Badge 
                        key={i} 
                        variant={latestResponse?.results?.recommendedFields?.includes(field) ? "default" : "outline"}
                        className={latestResponse?.results?.recommendedFields?.includes(field) ? 
                          "bg-green-100 text-green-800" : ""}
                      >
                        {field}
                      </Badge>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" asChild className="w-full mt-2">
                    <Link href={`/colleges/${college._id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/colleges">
                View All Matching Colleges
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : completedTests > 0 ? (
        // Add a card encouraging to take aptitude test if tests completed but no matches found
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Find Your College Matches</CardTitle>
            <CardDescription>
              Take our career aptitude test to get matched with suitable colleges
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground mb-4">
              No college matches found. Your test results may not have recommended career fields.
            </p>
            <Button asChild>
              <Link href="/aptitude-test">
                Take Career Assessment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
