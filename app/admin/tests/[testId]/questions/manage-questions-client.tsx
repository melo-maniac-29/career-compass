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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator" // Added missing import
import { Badge } from "@/components/ui/badge"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  ListOrdered,
  FileText,
  ToggleLeft,
  Check,
  Briefcase,  // Add this missing import
} from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

// Question types
const questionTypes = [
  "multiple-choice",
  "true-false",
  "scale"
]

export default function ManageQuestionsClient({ params }: { params: { testId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const testId = params.testId as Id<"aptitudeTests">
  const [error, setError] = useState<string | null>(null)
  
  // State for questions
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState(questionTypes[0])
  const [options, setOptions] = useState([
    { text: "Option 1", value: "option1", score: 0 },
    { text: "Option 2", value: "option2", score: 0 },
  ])
  const [correctAnswer, setCorrectAnswer] = useState("none") // Set default to "none" instead of empty string
  const [isLoading, setIsLoading] = useState(false)
  const [availableCareerFields, setAvailableCareerFields] = useState<string[]>([])
  const [optionCareerFields, setOptionCareerFields] = useState<Map<number, string[]>>(new Map())
  
  // Get test data with error handling
  const test = useQuery(api.aptitudeTests.getTestById, { testId })
  const questions = useQuery(api.aptitudeTests.getTestQuestions, { testId }) || []
  
  // Extract career fields from test when loaded
  useEffect(() => {
    if (test) {
      setAvailableCareerFields(test.careerFields || [])
    }
  }, [test])
  
  // Handle API errors
  useEffect(() => {
    if (test === null) {
      setError("Failed to load test. The test might not exist or you don't have permission to view it.")
    } else {
      setError(null)
    }
  }, [test])
  
  // Mutations
  const addQuestion = useMutation(api.aptitudeTests.addQuestion)
  const deleteQuestion = useMutation(api.aptitudeTests.deleteQuestion)
  
  // Handle adding an option
  const handleAddOption = () => {
    const newOptionIndex = options.length
    setOptions([
      ...options,
      {
        text: `Option ${newOptionIndex + 1}`,
        value: `option${newOptionIndex + 1}`,
        score: 0,
      }
    ])
    // Initialize empty career fields for the new option
    setOptionCareerFields(new Map(optionCareerFields.set(newOptionIndex, [])))
  }
  
  // Handle removing an option
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast({
        variant: "destructive",
        title: "Cannot remove option",
        description: "Multiple choice questions require at least 2 options."
      })
      return
    }
    
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
    
    // Remove career fields for this option
    const newOptionCareerFields = new Map(optionCareerFields)
    newOptionCareerFields.delete(index)
    // Reindex remaining options
    const reindexedFields = new Map()
    Array.from(newOptionCareerFields.entries())
      .filter(([key]) => key > index)
      .forEach(([key, value]) => {
        reindexedFields.set(key - 1, value)
      })
    Array.from(newOptionCareerFields.entries())
      .filter(([key]) => key < index)
      .forEach(([key, value]) => {
        reindexedFields.set(key, value)
      })
    setOptionCareerFields(reindexedFields)
  }
  
  // Handle changing option text
  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options]
    newOptions[index].text = text
    setOptions(newOptions)
  }
  
  // Handle changing option value
  const handleOptionValueChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].value = value
    setOptions(newOptions)
  }
  
  // Handle changing option score
  const handleOptionScoreChange = (index: number, score: string) => {
    const newOptions = [...options]
    newOptions[index].score = Number(score) || 0
    setOptions(newOptions)
  }
  
  // Toggle career field for an option
  const toggleCareerFieldForOption = (optionIndex: number, field: string) => {
    const currentFields = optionCareerFields.get(optionIndex) || []
    let newFields
    
    if (currentFields.includes(field)) {
      // Remove field if already present
      newFields = currentFields.filter(f => f !== field)
    } else {
      // Add field if not present
      newFields = [...currentFields, field]
    }
    
    setOptionCareerFields(new Map(optionCareerFields.set(optionIndex, newFields)))
  }
  
  // Reset the form
  const resetForm = () => {
    setQuestionText("")
    setQuestionType(questionTypes[0])
    setOptions([
      { text: "Option 1", value: "option1", score: 0 },
      { text: "Option 2", value: "option2", score: 0 },
    ])
    setCorrectAnswer("none") // Reset to "none" instead of empty string
    setOptionCareerFields(new Map())
  }
  
  // Handle creating a new question
  const handleAddQuestion = async () => {
    // Basic validation
    if (!questionText.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter the question text."
      })
      return
    }
    
    // Test type specific validation
    if (test.category === "Skills Assessment") {
      // For Skills Assessment, require a correct answer
      if (!correctAnswer || correctAnswer === "none") {
        toast({
          variant: "destructive",
          title: "Missing correct answer",
          description: "Skills Assessment questions must have a correct answer."
        })
        return
      }
    } else if (test.category === "Aptitude") {
      // For Aptitude tests, ensure no correct answer is selected
      if (correctAnswer && correctAnswer !== "none") {
        toast({
          variant: "destructive",
          title: "Invalid setup for Aptitude test",
          description: "Aptitude test questions should not have correct answers."
        })
        return
      }
      
      // For multiple choice, ensure at least some career fields are associated
      if (questionType === "multiple-choice") {
        const hasCareerFields = Array.from(optionCareerFields.values()).some(fields => fields.length > 0)
        if (!hasCareerFields) {
          toast({
            variant: "warning",
            title: "Missing career field associations",
            description: "Aptitude test options should be associated with career fields for proper analysis."
          })
          // This is a warning, not an error that prevents submission
        }
      }
    }
    
    // Continue with the rest of the validation and submission
    // ...existing validation for options...
    
    setIsLoading(true)
    
    try {
      // For true-false, override options with standard values
      let finalOptions = questionType === "true-false" 
        ? [
            { text: "True", value: "true", score: 0 },
            { text: "False", value: "false", score: 0 }
          ]
        : questionType === "scale"
          ? [
              { text: "1 (Strongly Disagree)", value: "1", score: 1 },
              { text: "2 (Disagree)", value: "2", score: 2 },
              { text: "3 (Neutral)", value: "3", score: 3 },
              { text: "4 (Agree)", value: "4", score: 4 },
              { text: "5 (Strongly Agree)", value: "5", score: 5 }
            ]
          : options.map((option, index) => {
              // Ensure career fields are properly included
              return {
                text: option.text,
                value: option.value,
                score: option.score,
                careerFields: optionCareerFields.get(index) || []
              };
            });
      
      // Force correct answer to be undefined for Aptitude tests
      const finalCorrectAnswer = test.category === "Aptitude" 
        ? undefined 
        : (correctAnswer && correctAnswer !== "none" ? correctAnswer : undefined);
      
      // Add the question
      await addQuestion({
        testId,
        questionText: questionText.trim(),
        questionType,
        options: finalOptions,
        correctAnswer: finalCorrectAnswer,
      });
      
      toast({
        title: "Question added",
        description: "The question has been added to the test."
      });
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to add the question. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // Handle deleting a question
  const handleDeleteQuestion = async (questionId: Id<"testQuestions">) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return
    }
    
    try {
      await deleteQuestion({ questionId })
      
      toast({
        title: "Question deleted",
        description: "The question has been removed from the test."
      })
    } catch (error) {
      console.error("Error deleting question:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the question. Please try again."
      })
    }
  }
  
  // Update options when question type changes
  useEffect(() => {
    if (questionType === "true-false") {
      setOptions([
        { text: "True", value: "true", score: 0 },
        { text: "False", value: "false", score: 0 }
      ])
    } else if (questionType === "scale") {
      setOptions([
        { text: "1 (Strongly Disagree)", value: "1", score: 1 },
        { text: "2 (Disagree)", value: "2", score: 2 },
        { text: "3 (Neutral)", value: "3", score: 3 },
        { text: "4 (Agree)", value: "4", score: 4 },
        { text: "5 (Strongly Agree)", value: "5", score: 5 }
      ])
    }
  }, [questionType])
  
  if (!test) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        {error ? (
          <>
            <div className="text-red-500 mb-4">Error: {error}</div>
            <Button onClick={() => router.push("/admin/tests")}>
              Return to Tests
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading test details...</span>
          </>
        )}
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/admin/tests")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tests
        </Button>
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <Badge>{test.category}</Badge>
        {test.active ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        )}
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Test Questions</CardTitle>
            <CardDescription>
              {questions.length} question{questions.length !== 1 ? 's' : ''} in this test
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  {test.category === "Skills Assessment" 
                    ? "Create a question to assess specific skills with correct answers"
                    : "Create a question to analyze aptitude and interests without correct answers"}
                </DialogDescription>
                
                {/* Add test type indicator */}
                <div className="mt-2">
                  <Badge variant={test.category === "Skills Assessment" ? "default" : "outline"} className="mr-2">
                    {test.category}
                  </Badge>
                  {test.category !== "Skills Assessment" && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Interest-based Analysis
                    </Badge>
                  )}
                </div>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Test type explanation card */}
                <Card className="bg-muted/20">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {test.category === "Skills Assessment" 
                          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                          : <Briefcase className="h-5 w-5 text-blue-600" />
                        }
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          {test.category === "Skills Assessment" 
                            ? "Skills Assessment Question" 
                            : "Interest Analysis Question"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {test.category === "Skills Assessment" 
                            ? "This question will evaluate knowledge with correct answers."
                            : "This question analyzes preferences without right/wrong answers. Responses will be used to calculate career field interests."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    placeholder="Enter the question text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="min-h-20"
                    required
                  />
                </div>
                
                {/* Question type selection with improved guidance */}
                <div className="space-y-2">
                  <Label htmlFor="questionType" className="flex items-center gap-2">
                    Question Type
                    <Badge variant="outline" className="font-normal text-xs">
                      {test.category === "Skills Assessment" ? "Knowledge question format" : "Preference question format"}
                    </Badge>
                  </Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger id="questionType">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">
                        <div className="flex flex-col">
                          <span>Multiple Choice</span>
                          <span className="text-xs text-muted-foreground">
                            {test.category === "Skills Assessment" 
                              ? "Questions with one correct answer" 
                              : "Questions to assess preferences"}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="true-false">
                        <div className="flex flex-col">
                          <span>True/False</span>
                          <span className="text-xs text-muted-foreground">
                            {test.category === "Skills Assessment"
                              ? "Knowledge validation questions"
                              : "Binary preference questions"}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="scale">
                        <div className="flex flex-col">
                          <span>Scale (1-5)</span>
                          <span className="text-xs text-muted-foreground">
                            {test.category === "Skills Assessment"
                              ? "Confidence or skill level assessment"
                              : "Preference strength measurement"}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* For multiple choice options, improve the UI */}
                {questionType !== "true-false" && questionType !== "scale" && (
                  <div className="space-y-2 border p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Answer Options</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {test.category === "Skills Assessment" 
                            ? "Add options and mark the correct answer below" 
                            : "Add options and assign career field associations"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    
                    {/* Existing options code */}
                    <div className="space-y-4">
                      {options.map((option, index) => (
                        <div key={index} className="space-y-3 border p-4 rounded-md">
                          {/* Option header */}
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Option {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          
                          {/* Option inputs */}
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                              <Label htmlFor={`option-text-${index}`} className="text-xs">Display Text</Label>
                              <Input
                                id={`option-text-${index}`}
                                placeholder="Option text"
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                              />
                            </div>
                            <div className="col-span-4">
                              <Label htmlFor={`option-value-${index}`} className="text-xs">Value</Label>
                              <Input
                                id={`option-value-${index}`}
                                placeholder="Value"
                                value={option.value}
                                onChange={(e) => handleOptionValueChange(index, e.target.value)}
                              />
                            </div>
                            <div className="col-span-3">
                              <Label htmlFor={`option-score-${index}`} className="text-xs flex items-center">
                                <span>Score</span>
                                <span className="ml-1 text-xs text-muted-foreground">(for interest)</span>
                              </Label>
                              <Input
                                id={`option-score-${index}`}
                                type="number"
                                placeholder="Score"
                                value={option.score}
                                onChange={(e) => handleOptionScoreChange(index, e.target.value)}
                              />
                            </div>
                          </div>
                          
                          {/* Only show career field mapping for aptitude type tests */}
                          {test.category !== "Skills Assessment" && (
                            <div className="space-y-2 mt-2">
                              <Label className="text-sm mb-2 flex items-center justify-between">
                                <span>Career Field Interest Association:</span>
                                <Badge variant="outline" className="font-normal">
                                  Selected: {(optionCareerFields.get(index) || []).length}
                                </Badge>
                              </Label>
                              <div className="border-t pt-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                  When a user selects this option, it will contribute points toward these career fields:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {availableCareerFields.map((field) => {
                                    const isSelected = (optionCareerFields.get(index) || []).includes(field)
                                    return (
                                      <Badge 
                                        key={field}
                                        variant={isSelected ? "default" : "outline"}
                                        className={`cursor-pointer hover:bg-primary/10 ${isSelected ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}`}
                                        onClick={() => toggleCareerFieldForOption(index, field)}
                                      >
                                        {field}
                                        {isSelected && <Check className="ml-1 h-3 w-3" />}
                                      </Badge>
                                    )
                                  })}
                                  {availableCareerFields.length === 0 && (
                                    <div className="border border-dashed rounded-md p-3 w-full text-center">
                                      <span className="text-sm text-muted-foreground">
                                        Add career fields in test settings first
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Enhanced interest scoring preview */}
                              {(optionCareerFields.get(index) || []).length > 0 && (
                                <div className="mt-2 space-y-2 bg-blue-50/40 p-3 rounded-md border border-blue-100">
                                  <Label className="text-xs font-medium text-blue-800">
                                    Interest Scoring Preview:
                                  </Label>
                                  <p className="text-xs text-blue-700 mb-2">
                                    If student selects this option, they'll receive these points:
                                  </p>
                                  <div className="grid grid-cols-2 gap-1">
                                    {(optionCareerFields.get(index) || []).map(field => (
                                      <div key={field} className="text-xs flex justify-between">
                                        <span>{field}:</span>
                                        <span className="font-semibold">+{option.score || 1} points</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Correct answer section with improved UI for skills assessment type */}
                {questionType !== "scale" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="correctAnswer" className="flex items-center gap-2">
                        <span>Correct Answer</span>
                        {test.category === "Skills Assessment" ? (
                          <Badge className="bg-green-100 text-green-800">
                            Required
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">
                            Not used for aptitude tests
                          </Badge>
                        )}
                      </Label>
                    </div>
                    
                    <Select 
                      value={test.category === "Aptitude" ? "none" : correctAnswer}
                      onValueChange={setCorrectAnswer}
                      disabled={test.category === "Aptitude"}
                    >
                      <SelectTrigger id="correctAnswer" className={test.category === "Skills Assessment" ? "border-green-200" : ""}>
                        <SelectValue placeholder={
                          test.category === "Skills Assessment" 
                          ? "Select the correct answer" 
                          : "No correct answer needed"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {test.category === "Skills Assessment" ? (
                          options.map((option, index) => (
                            <SelectItem key={index} value={option.value}>
                              {option.text}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm font-medium text-blue-800">Aptitude Test</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Aptitude tests don't use correct answers - they analyze preferences instead
                            </p>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <div className="text-xs bg-muted/20 p-3 rounded-md mt-2">
                      {test.category === "Skills Assessment" ? (
                        <div className="p-2 bg-green-50 rounded mb-2">
                          <p className="font-medium text-green-800">Skills Assessment:</p>
                          <p className="text-green-700">Select the correct answer to evaluate knowledge</p>
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-50 rounded mb-2">
                          <p className="font-medium text-blue-800">Aptitude Test:</p>
                          <p className="text-blue-700">No correct answer needed - scoring is based on career field associations</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="sticky bottom-0 bg-background pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddQuestion} 
                  disabled={isLoading}
                  className={test.category === "Skills Assessment" && !correctAnswer && correctAnswer !== "none" ? "bg-amber-500" : ""}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      Add {test.category === "Skills Assessment" ? "Skills Question" : "Aptitude Question"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {questions === undefined ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading questions...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border rounded-md">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No questions added to this test yet.</p>
              <p className="text-sm mt-1">Click "Add Question" to create the first question.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Accordion type="multiple">
                {questions.map((question, index) => (
                  <AccordionItem key={question._id} value={question._id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-2 py-1">
                          {index + 1}
                        </Badge>
                        <span className="line-clamp-1 text-left">
                          {question.questionText}
                        </span>
                        <Badge variant="secondary" className="ml-2">
                          {question.questionType}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-2">
                        <p className="font-medium">{question.questionText}</p>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Options:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option, idx) => (
                              <div 
                                key={idx}
                                className={`p-2 border rounded-md flex justify-between
                                  ${option.value === question.correctAnswer ? "border-green-500 bg-green-50" : ""}
                                `}
                              >
                                <span>{option.text}</span>
                                <div className="flex items-center gap-2">
                                  {option.value === question.correctAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                  {option.careerFields?.length > 0 && (
                                    <Badge variant="outline" className="bg-blue-50">
                                      {option.careerFields.length} field{option.careerFields.length !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteQuestion(question._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Question
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}