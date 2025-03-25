"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  GraduationCap,
  Briefcase,
  Share2,
  Download
} from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/link"

// Add this type to help with proper conditional rendering
type TestType = "Skills Assessment" | "Aptitude";

export default function ResultsClientPage({ params }: { params: { testId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = params.testId as Id<"aptitudeTests">
  const responseIdParam = searchParams.get("responseId")
  const [error, setError] = useState<string | null>(null)
  
  // Debug the responseId parameter
  useEffect(() => {
    console.log("Raw responseIdParam:", responseIdParam);
    console.log("Type:", typeof responseIdParam);
    if (responseIdParam && typeof responseIdParam === 'object') {
      console.log("Object keys:", Object.keys(responseIdParam));
    }
  }, [responseIdParam]);
  
  // Fix responseId parsing to ensure it's a primitive string
  const responseIdString = useMemo(() => {
    if (!responseIdParam) return null;
    
    // If it's an object, try to get a string representation
    if (typeof responseIdParam === 'object') {
      if (responseIdParam.toString) {
        const str = responseIdParam.toString();
        console.log("After toString():", str);
        return str !== '[object Object]' ? str : null;
      }
      return null;
    }
    
    // If it's already a string, just return it
    return responseIdParam;
  }, [responseIdParam]);
  
  // Skip the query if we don't have a valid ID string
  const skipQuery = !responseIdString;
  
  // Get test data
  const test = useQuery(api.aptitudeTests.getTestById, { testId })
  const questions = useQuery(api.aptitudeTests.getTestQuestions, { testId }) || []
  
  // Get test response - use the skipQuery approach rather than conditional parameters
  const response = skipQuery 
    ? null 
    : useQuery(api.aptitudeTests.getTestResponse, { responseId: responseIdString as Id<"testResponses"> });
  
  // Handle API errors
  useEffect(() => {
    if (responseIdParam && !responseIdString) {
      setError(`Invalid response ID format: ${String(responseIdParam)}`);
    } else if (test === undefined && questions === undefined && response === undefined) {
      // Still loading
      return;
    } else if (!test || (!response && !skipQuery)) {
      setError("Could not load test results. The test or response might not exist.");
    }
  }, [test, questions, response, responseIdParam, responseIdString, skipQuery]);
  
  // Handle case when responseId is invalid
  if (!responseIdString) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <div className="text-red-500 mb-4">
          {error || "Invalid or missing test response ID."}
        </div>
        <Button onClick={() => router.push("/aptitude-test")}>
          Return to Tests
        </Button>
      </div>
    );
  }
  
  // Loading state
  if (!test || response === undefined) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        {error ? (
          <>
            <div className="text-red-500 mb-4">Error: {error}</div>
            <Button onClick={() => router.push("/aptitude-test")}>
              Return to Tests
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your results...</span>
          </>
        )}
      </div>
    );
  }
  
  // Map answers by question ID for easier lookup
  const answerMap = new Map(
    response.answers?.map(answer => [answer.questionId, answer.response]) || []
  )
  
  // Calculate statistics
  const totalQuestions = questions.length
  const answeredQuestions = response.answers?.length || 0
  
  // Get the answers that had a correct option defined
  const questionsWithCorrectAnswers = questions.filter(q => q.correctAnswer !== undefined)
  const correctAnswers = questionsWithCorrectAnswers.filter(q => {
    const userAnswer = answerMap.get(q._id)
    return userAnswer === q.correctAnswer
  }).length
  
  const correctPercentage = 
    questionsWithCorrectAnswers.length > 0
      ? Math.round((correctAnswers / questionsWithCorrectAnswers.length) * 100)
      : null

  // Determine test type for conditional rendering
  const testType: TestType = test?.category as TestType || "Aptitude";
  const isSkillsAssessment = testType === "Skills Assessment";
  const isAptitudeTest = testType === "Aptitude";
  
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/aptitude-test")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Tests
          </Button>
          <h1 className="text-2xl font-bold ml-4">{test.title} Results</h1>
        </div>
        
        {/* Results Summary */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{test.title}</CardTitle>
                <CardDescription>
                  {test.category} • Completed
                  {isSkillsAssessment && correctPercentage !== null && (
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      Score: {correctPercentage}%
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge variant="secondary">
                  {new Date(response.completedAt || 0).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">Results Summary</h3>
                <div className="space-y-6">
                  {/* Test-type specific result header */}
                  <div className={`p-4 rounded-md ${isSkillsAssessment ? 'bg-green-50' : 'bg-blue-50'}`}>
                    {isSkillsAssessment ? (
                      <div className="flex items-center text-green-800">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        <h4 className="font-medium">Skills Assessment Results</h4>
                      </div>
                    ) : (
                      <div className="flex items-center text-blue-800">
                        <Briefcase className="h-5 w-5 mr-2" />
                        <h4 className="font-medium">Career Interest Analysis</h4>
                      </div>
                    )}
                    {response.results?.summary && (
                      <p className={`mt-2 ${isSkillsAssessment ? 'text-green-700' : 'text-blue-700'}`}>
                        {response.results.summary}
                      </p>
                    )}
                  </div>
                  
                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-3xl font-bold mb-1">
                        {answeredQuestions}/{totalQuestions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Questions Answered
                      </div>
                    </div>
                    
                    {isSkillsAssessment && correctPercentage !== null ? (
                      <div className="border rounded-md p-4 text-center bg-green-50">
                        <div className="text-3xl font-bold mb-1 text-green-700">
                          {correctPercentage}%
                        </div>
                        <div className="text-sm text-green-600">
                          Correct Answers
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-md p-4 text-center bg-blue-50">
                        <div className="text-xl font-medium mb-1 text-blue-700">
                          Interest Analysis
                        </div>
                        <div className="text-sm text-blue-600">
                          Preference-based results
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Completion Status */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Status</span>
                      <span>{answeredQuestions}/{totalQuestions}</span>
                    </div>
                    <Progress 
                      value={(answeredQuestions / totalQuestions) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
              
              <Separator orientation="vertical" className="hidden md:block" />
              
              {/* Recommendations */}
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-4">Recommendations</h3>
                <div className="space-y-4">
                  {response.results?.bestMatch && (
                    <>
                      <div className="mb-5 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-lg">Your Perfect Match</h4>
                          <Badge variant="default" className="bg-green-600">
                            {response.results.bestMatch.confidenceLevel} Confidence
                          </Badge>
                        </div>
                        
                        <div className="flex items-center mb-3 gap-3">
                          <div className="bg-green-600 p-3 rounded-full">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                          <div className="font-bold text-xl text-green-800">
                            {response.results.bestMatch.field}
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium mr-2">Match Confidence:</span>
                          <Progress 
                            value={response.results.bestMatch.confidenceScore} 
                            className="h-3 flex-1"
                            indicatorClassName="bg-green-600"
                          />
                          <span className="ml-2 font-bold text-green-800">
                            {response.results.bestMatch.confidenceScore}%
                          </span>
                        </div>
                        
                        <p className="text-sm text-green-700 mt-2">
                          This career field shows the strongest alignment with your responses and interests.
                        </p>
                      </div>
                  
                      {response.results.recommendedFields.length > 1 && (
                        <>
                          <h4 className="text-sm font-medium text-muted-foreground mt-4">
                            Other Strong Matches
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {response.results.recommendedFields
                              .filter(field => field !== response.results.bestMatch.field)
                              .map((field, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="bg-blue-100 text-blue-800"
                                >
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {field}
                                </Badge>
                              ))
                            }
                          </div>
                        </>
                      )}
                    </>
                  )}
                  
                  {response.results?.recommendedFields && (
                    <>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {isAptitudeTest ? "Top Career Matches" : "Related Career Fields"}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {response.results.recommendedFields.map((field, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className={`${isAptitudeTest ? 'bg-green-100 text-green-800' : 'bg-primary/10'}`}
                          >
                            <Briefcase className="h-3 w-3 mr-1" />
                            {field}
                            {idx === 0 && <span className="ml-1 text-xs">(Best Match)</span>}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        These are your highest-scoring career fields based on your responses
                      </p>
                    </>
                  )}
                  
                  {response.results?.strengths && (
                    <>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Your Strengths
                      </h4>
                      <div className="space-y-2">
                        {response.results.strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4">
                    <Button className="w-full">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Explore Recommended Colleges
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardFooter>
        </Card>
        
        <Tabs defaultValue={isAptitudeTest ? "details" : "answers"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="answers">{isSkillsAssessment ? "Your Score" : "Your Answers"}</TabsTrigger>
            <TabsTrigger value="details">{isAptitudeTest ? "Interest Analysis" : "Detailed Analysis"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="answers" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Responses</CardTitle>
                <CardDescription>
                  Review your answers to each question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {questions.map((question, idx) => {
                    const userAnswer = answerMap.get(question._id);
                    const isCorrect = question.correctAnswer !== undefined && 
                      userAnswer === question.correctAnswer;
                    const isWrong = question.correctAnswer !== undefined && 
                      userAnswer !== undefined &&
                      userAnswer !== question.correctAnswer;
                    
                    // Find the selected option text
                    const selectedOption = question.options.find(opt => opt.value === userAnswer);
                    
                    return (
                      <AccordionItem key={idx} value={`question-${idx}`}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3 text-left">
                            <Badge variant="outline" className="px-2 py-1">
                              {idx + 1}
                            </Badge>
                            <span className="line-clamp-1 flex-1">{question.questionText}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {isWrong && <XCircle className="h-4 w-4 text-red-500" />}
                            {!userAnswer && <Badge variant="outline">Unanswered</Badge>}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 pl-10">
                          <div className="grid gap-2">
                            {question.options.map((option, optIdx) => (
                              <div 
                                key={optIdx}
                                className={`p-3 border rounded-md flex justify-between
                                  ${option.value === userAnswer ? "bg-primary/10 border-primary" : ""}
                                  ${option.value === question.correctAnswer ? "border-green-500" : ""}
                                `}
                              >
                                <span>{option.text}</span>
                                <div className="flex items-center">
                                  {option.value === userAnswer && (
                                    <Badge variant="outline">Your Answer</Badge>
                                  )}
                                  {option.value === question.correctAnswer && (
                                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                      Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {isWrong && question.correctAnswer && (
                            <div className="text-sm text-muted-foreground pt-2">
                              <p>
                                The correct answer was:{" "}
                                <span className="font-medium">
                                  {question.options.find(o => o.value === question.correctAnswer)?.text}
                                </span>
                              </p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/aptitude-test">
                    <Trophy className="h-4 w-4 mr-2" />
                    Take Another Test
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isAptitudeTest ? "Career Interest Analysis" : "Performance Analysis"}
                </CardTitle>
                <CardDescription>
                  {isAptitudeTest
                    ? "In-depth analysis of your aptitudes and career matches"
                    : "Detailed breakdown of your assessment performance"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Aptitude Profile - Only shown for aptitude tests */}
                {isAptitudeTest && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Your Interest Profile</h3>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      This analysis is based on your preferences and responses, not on "correct" answers. 
                      Higher scores indicate stronger alignment with these career fields.
                    </p>
                    
                    {/* Add a clearer explanation of how results were calculated */}
                    <div className="bg-blue-50 p-4 rounded-md mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">How Your Results Were Analyzed</h4>
                      <p className="text-sm text-blue-700">
                        Your responses were analyzed based on career field associations. Each time you selected an 
                        option associated with a career field, that field received points. The fields with the highest 
                        scores are shown as your recommended career paths.
                      </p>
                    </div>

                    {/* Continue with existing aptitude score display */}
                    {response.results?.details?.aptitudeScores ? (
                      <div className="space-y-3">
                        <div className="mb-3 pb-2 border-b">
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-green-50 text-green-800">Top Matches</Badge>
                            <span className="ml-2 text-sm text-muted-foreground">Strong alignment with your interests</span>
                          </div>
                        </div>
                        
                        {/* Show top recommended fields first with more emphasis */}
                        {response.results.recommendedFields.map((field) => {
                          const score = response.results?.details?.aptitudeScores[field] || 0;
                          const relativeScore = response.results?.details?.relativeScores?.[field] || 0;
                          
                          return (
                            <div key={field} className="bg-green-50/30 p-2 rounded-md">
                              <div className="flex justify-between items-center">
                                <span className="capitalize font-medium">{field}</span>
                                <span className="text-xs font-medium">{score} points</span>
                              </div>
                              <Progress 
                                value={relativeScore}
                                className="h-2 bg-green-100"
                              />
                              <p className="text-xs mt-1 text-green-700">
                                {relativeScore >= 90 ? "Excellent match" : 
                                 relativeScore >= 70 ? "Strong match" : "Good match"}
                              </p>
                            </div>
                          );
                        })}
                        
                        {/* Show other fields with less emphasis */}
                        {response.results?.details?.allFields && 
                         response.results.details.allFields.length > response.results.recommendedFields.length && (
                          <>
                            <div className="mt-6 mb-3 pb-1 border-b">
                              <div className="flex items-center">
                                <Badge variant="outline">Other Fields</Badge>
                                <span className="ml-2 text-sm text-muted-foreground">Lower alignment with your interests</span>
                              </div>
                            </div>
                            
                            {response.results.details.allFields
                              .filter(field => !response.results?.recommendedFields.includes(field))
                              .slice(0, 5) // Limit to 5 additional fields
                              .map((field) => {
                                const score = response.results?.details?.aptitudeScores[field] || 0;
                                const relativeScore = response.results?.details?.relativeScores?.[field] || 0;
                                
                                return (
                                  <div key={field}>
                                    <div className="flex justify-between items-center">
                                      <span className="capitalize">{field}</span>
                                      <span className="text-xs text-muted-foreground">{score} points</span>
                                    </div>
                                    <Progress 
                                      value={relativeScore}
                                      className="h-2"
                                    />
                                  </div>
                                );
                              })
                            }
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No aptitude data available
                      </div>
                    )}
                  </div>
                )}

                {/* Personalized Insights */}
                {response.results?.details?.insights ? (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Personalized Insights</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      {response.results.details.insights.map((insight, idx) => (
                        <li key={idx}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                
                {/* Career Field Explanations */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Career Field Compatibility</h3>
                  <div className="space-y-4">
                    {response.results?.recommendedFields?.map((field, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge>{idx + 1}</Badge>
                          <h4 className="font-medium">{field}</h4>
                        </div>
                        <Progress value={100 - (idx * 15)} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {getCareerFieldDescription(field)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Next Steps */}
                <div className="bg-primary/5 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Recommended Next Steps</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Explore Related Professions</p>
                        <p className="text-sm text-muted-foreground">
                          Research careers in {response.results?.recommendedFields?.slice(0, 2).join(" and ")}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Consider Educational Pathways</p>
                        <p className="text-sm text-muted-foreground">
                          Look into programs that develop your strengths in {response.results?.strengths?.[0]}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-center w-full">
                  <p className="text-sm text-muted-foreground mb-4">
                    Want personalized guidance based on these results?
                  </p>
                  <Button asChild>
                    <Link href="/counselors">
                      Schedule a Counseling Session
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Helper function to get descriptions for career fields
function getCareerFieldDescription(field: string): string {
  const descriptions: Record<string, string> = {
    "Engineering": "Fields focused on designing, building and maintaining systems, structures or products using scientific principles.",
    "Medicine": "Careers centered around healthcare, treatment of illness and maintaining physical and mental wellbeing.",
    "Business": "Roles involving management, marketing, finance, entrepreneurship and organizational leadership.",
    "Art": "Creative professions including visual arts, performing arts, design and other forms of expression.",
    "Education": "Careers focused on teaching, training, curriculum development and educational administration.",
    "Technology": "Fields involving computer systems, software development, information management and digital innovation.",
    "Science": "Research-oriented careers exploring natural phenomena through systematic observation and experimentation.",
    "Law": "Professions focused on legal systems, regulations, compliance and dispute resolution.",
    // Add more as needed
  };
  
  return descriptions[field] || 
    "Career path involving specialized knowledge, skills and experience in this field.";
}