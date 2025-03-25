"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  ArrowLeft,
  ArrowRight,
  Clock,
  AlertCircle,
  Check,
  CheckCircle
} from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

export default function TestClientPage({ params }: { params: { testId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const testId = params.testId as Id<"aptitudeTests">
  
  // State for test progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map())
  const [testStarted, setTestStarted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [responseId, setResponseId] = useState<Id<"testResponses"> | null>(null)
  
  // Get test data
  const test = useQuery(api.aptitudeTests.getTestById, { testId })
  const questions = useQuery(api.aptitudeTests.getTestQuestions, { testId }) || []
  
  // Mutations
  const startTest = useMutation(api.aptitudeTests.startTest)
  const submitTestResponses = useMutation(api.aptitudeTests.submitTestResponses)
  const analyzeTestResponse = useMutation(api.aptitudeTests.analyzeTestResponse)
  
  // Check if user already completed this test
  const testResponses = useQuery(api.aptitudeTests.getUserTestResponses)
  const existingResponse = testResponses?.find(
    response => response.testId === testId && response.completed
  )
  
  // Define handleSubmitTest before it's used in useEffect
  const handleSubmitTest = useCallback(async () => {
    if (isSubmitting) return
    
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !userAnswers.has(q._id))
    
    if (unansweredQuestions.length > 0 && !confirmDialogOpen) {
      setConfirmDialogOpen(true)
      return
    }
    
    if (!responseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Test session not found. Please refresh and try again."
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Format answers for submission
      const answers = Array.from(userAnswers.entries()).map(([questionId, response]) => ({
        questionId: questionId as Id<"testQuestions">,
        response,
      }))
      
      // Submit responses
      const result = await submitTestResponses({
        responseId,
        answers,
      })
      
      // Analyze the responses to generate career insights
      await analyzeTestResponse({
        responseId
      })
      
      toast({
        title: "Test submitted",
        description: "Your responses have been recorded successfully."
      })
      
      // Use primitive string conversion explicitly when passing in URL params
      const responseIdString = responseId.toString();
      console.log("Redirecting with responseId:", responseIdString);
      router.push(`/aptitude-test/${testId}/results?responseId=${responseIdString}`);
    } catch (error) {
      console.error("Error submitting test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit test responses. Please try again."
      })
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, userAnswers, confirmDialogOpen, responseId, toast, submitTestResponses, analyzeTestResponse, router, testId]);
  
  useEffect(() => {
    if (existingResponse?.completed) {
      router.push(`/aptitude-test/${testId}/results?responseId=${existingResponse._id}`)
    }
  }, [existingResponse, router, testId])
  
  // Initialize timer when test starts
  useEffect(() => {
    if (testStarted && test?.timeLimit) {
      // Convert minutes to milliseconds
      const timeLimit = test.timeLimit * 60 * 1000
      const endTime = Date.now() + timeLimit
      
      setTimeRemaining(timeLimit / 1000) // Initial time in seconds
      
      const timer = setInterval(() => {
        const remaining = Math.max(0, endTime - Date.now())
        setTimeRemaining(Math.ceil(remaining / 1000)) // Remaining time in seconds
        
        if (remaining <= 0) {
          clearInterval(timer)
          // Only call handleSubmitTest if the test is still active
          if (testStarted && !isSubmitting) {
            handleSubmitTest()
          }
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [testStarted, test, handleSubmitTest, isSubmitting])
  
  const handleStartTest = async () => {
    try {
      const response = await startTest({ testId })
      if (!response) {
        throw new Error("Failed to receive response from server")
      }
      setResponseId(response._id)
      setTestStarted(true)
    } catch (error) {
      console.error("Error starting test:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to start the test. Please try again."
      })
    }
  }
  
  const handleAnswerQuestion = (questionId: string, answer: string) => {
    // Save the answer
    setUserAnswers(new Map(userAnswers.set(questionId, answer)))
  }
  
  const handleNextQuestion = () => {
    // Check if the current question is answered
    const currentQuestionId = questions[currentQuestionIndex]._id
    if (!userAnswers.has(currentQuestionId)) {
      toast({
        variant: "default",
        title: "Please answer the question",
        description: "You need to select an answer before proceeding."
      })
      return
    }
    
    // Move to the next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (!seconds) return "No time limit"
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Calculate progress percentage
  const progressPercentage = 
    questions.length > 0 
      ? ((currentQuestionIndex + 1) / questions.length) * 100 
      : 0
  
  if (!test || !questions) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading test...</span>
      </div>
    )
  }
  
  // Check if there are no questions
  if (questions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/aptitude-test")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
          <h1 className="text-2xl font-bold ml-4">{test.title}</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground text-center mb-6">
              This test doesn't have any questions yet. Please check back later.
            </p>
            <Button onClick={() => router.push("/aptitude-test")}>
              Go Back to All Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex]
  
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {!testStarted ? (
          /* Test Introduction */
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{test.title}</CardTitle>
              <CardDescription>{test.category} • {test.difficulty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-md">
                <p className="text-lg">{test.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {test.timeLimit 
                      ? `Time Limit: ${test.timeLimit} minutes` 
                      : "No time limit"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <span>{questions.length} Questions</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Instructions:</h3>
                <ul className="space-y-2 ml-5 list-disc">
                  <li>Read each question carefully before answering.</li>
                  <li>You can navigate between questions using the previous and next buttons.</li>
                  <li>
                    {test.timeLimit 
                      ? `You have ${test.timeLimit} minutes to complete this test.` 
                      : "There is no time limit for this test."}
                  </li>
                  <li>Your progress will be saved as you go.</li>
                  <li>You can review your answers before submitting.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Related Career Fields:</h3>
                <div className="flex flex-wrap gap-2">
                  {test.careerFields.map((field, index) => (
                    <Badge key={index} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/aptitude-test")}>
                Back to Tests
              </Button>
              <Button onClick={handleStartTest}>
                Start Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          /* Test Questions */
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  Exit Test
                </Button>
                <h1 className="text-xl font-bold ml-2">{test.title}</h1>
              </div>
              
              {timeRemaining && (
                <div className="flex items-center text-sm font-medium">
                  <Clock className="mr-2 h-4 w-4" />
                  Time Remaining: {formatTimeRemaining(timeRemaining)}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>
                  {userAnswers.size} of {questions.length} answered
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {currentQuestionIndex + 1}. {currentQuestion.questionText}
                </CardTitle>
                <CardDescription>
                  {currentQuestion.questionType === "multiple-choice" && "Select one option"}
                  {currentQuestion.questionType === "true-false" && "Select True or False"}
                  {currentQuestion.questionType === "scale" && "Rate on a scale of 1-5"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userAnswers.get(currentQuestion._id) || ""}
                  onValueChange={(value) => handleAnswerQuestion(currentQuestion._id, value)}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer py-2">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button 
                    onClick={handleNextQuestion}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    Finish Test
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={
                      userAnswers.has(questions[index]._id)
                        ? "bg-primary/20"
                        : ""
                    }
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {userAnswers.size < questions.length
                      ? "You haven't answered all questions"
                      : "Submit your test?"}
                  </DialogTitle>
                  <DialogDescription>
                    {userAnswers.size < questions.length
                      ? `You have answered ${userAnswers.size} out of ${questions.length} questions. Are you sure you want to submit?`
                      : "Your test will be submitted and you'll see your results."}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmDialogOpen(false)}
                  >
                    Continue Test
                  </Button>
                  <Button 
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : "Submit Test"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}