import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all aptitude tests (admin)
export const getAllTests = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized");
    }

    return await ctx.db.query("aptitudeTests").collect();
  },
});

// Get active tests for students
export const getActiveTests = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("aptitudeTests")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

// Get a specific test by ID
export const getTestById = query({
  args: { testId: v.id("aptitudeTests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testId);
  },
});

// Get questions for a test
export const getTestQuestions = query({
  args: { testId: v.id("aptitudeTests") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();
    
    return questions.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Create a new aptitude test (admin only)
export const createTest = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    timeLimit: v.optional(v.number()),
    category: v.string(),
    difficulty: v.string(),
    imageUrl: v.optional(v.string()),
    careerFields: v.array(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }

    const testId = await ctx.db.insert("aptitudeTests", {
      ...args,
      createdBy: user._id,
    });
    
    // Log event
    await ctx.db.insert("systemEvents", {
      type: "test_created",
      userId: user._id,
      userEmail: user.email,
      entityId: testId.toString(),
      entityName: args.title,
      details: `${args.category} test, ${args.difficulty} difficulty`,
      status: "success",
      timestamp: Date.now(),
    });
    
    return testId;
  },
});

// Update an existing aptitude test (admin only)
export const updateTest = mutation({
  args: {
    testId: v.id("aptitudeTests"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    timeLimit: v.optional(v.number()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    active: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    careerFields: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }

    const updates: any = {};

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.timeLimit !== undefined) updates.timeLimit = args.timeLimit;
    if (args.category !== undefined) updates.category = args.category;
    if (args.difficulty !== undefined) updates.difficulty = args.difficulty;
    if (args.active !== undefined) updates.active = args.active;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.careerFields !== undefined) updates.careerFields = args.careerFields;

    await ctx.db.patch(args.testId, updates);
    return await ctx.db.get(args.testId);
  },
});

// Delete an aptitude test (admin only)
export const deleteTest = mutation({
  args: {
    testId: v.id("aptitudeTests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }

    // Delete associated questions
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Delete the test
    await ctx.db.delete(args.testId);
    return true;
  },
});

// Update or add the addQuestion mutation 
export const addQuestion = mutation({
  args: {
    testId: v.id("aptitudeTests"),
    questionText: v.string(),
    questionType: v.string(),
    options: v.array(
      v.object({
        text: v.string(),
        value: v.string(),
        score: v.number(),
        careerFields: v.optional(v.array(v.string()))
      })
    ),
    correctAnswer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authentication check combining both methods for better compatibility
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Check if user is admin - try both auth methods for compatibility
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();
    
    const isAdmin = user?.role === "admin" || identity.tokenIdentifier === "admin";
    
    if (!isAdmin) {
      throw new Error("Not authorized - admin access required");
    }
    
    // Test existence check
    const test = await ctx.db.get(args.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Get existing questions to determine order index
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", q => q.eq("testId", args.testId))
      .collect();
    
    // Set the new question to appear at the end
    const orderIndex = questions.length;

    // Create the question
    const questionId = await ctx.db.insert("testQuestions", {
      testId: args.testId,
      questionText: args.questionText,
      questionType: args.questionType,
      options: args.options,
      correctAnswer: args.correctAnswer,
      orderIndex: orderIndex,
    });

    return questionId;
  },
});

// Delete a question (admin only)
export const deleteQuestion = mutation({
  args: {
    questionId: v.id("testQuestions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }

    await ctx.db.delete(args.questionId);
    return true;
  },
});

// Start a test attempt
export const startTest = mutation({
  args: {
    testId: v.id("aptitudeTests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already has an in-progress attempt
    const existingAttempt = await ctx.db
      .query("testResponses")
      .withIndex("by_user_and_test", (q) => 
        q.eq("userId", user._id).eq("testId", args.testId)
      )
      .first();

    if (existingAttempt && !existingAttempt.completed) {
      // Return the existing attempt
      return existingAttempt;
    }

    // Create a new attempt
    return await ctx.db.insert("testResponses", {
      userId: user._id,
      testId: args.testId,
      completed: false,
      startedAt: Date.now(),
      answers: [],
    });
  },
});

// Submit test responses
export const submitTestResponses = mutation({
  args: {
    responseId: v.id("testResponses"),
    answers: v.array(
      v.object({
        questionId: v.id("testQuestions"),
        response: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the response record
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      throw new Error("Test response not found");
    }

    if (response.userId !== user._id) {
      throw new Error("Not authorized to submit this test response");
    }

    // Process the answers and calculate score
    let totalScore = 0;
    let possibleScore = 0;

    // Get all questions for the test
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", response.testId))
      .collect();

    // Map questions by ID for easier access
    const questionsMap = new Map(questions.map(q => [q._id, q]));

    // Calculate score for answers with correct answers
    for (const answer of args.answers) {
      const question = questionsMap.get(answer.questionId);
      if (!question) continue;

      if (question.correctAnswer !== undefined && question.correctAnswer === answer.response) {
        totalScore += 1;
      }
      
      if (question.correctAnswer !== undefined) {
        possibleScore += 1;
      }
    }

    // Create a normalized score if there were scored questions
    const score = possibleScore > 0 ? (totalScore / possibleScore) * 100 : undefined;

    // Determine career recommendations based on answers
    const test = await ctx.db.get(response.testId as Id<"aptitudeTests">);
    const careerFields = test?.careerFields || [];
    
    // Simple algorithm - just recommend all fields for now
    // In a real app, you'd have a more sophisticated algorithm
    const results = {
      summary: `You completed the ${test?.title || "aptitude"} test.`,
      recommendedFields: careerFields,
      strengths: ["Analytical thinking", "Problem solving"],
      details: {
        score: score !== undefined ? `${Math.round(score)}%` : "Not scored",
        responseCount: args.answers.length,
      },
    };

    // Update the response record
    await ctx.db.patch(args.responseId, {
      completed: true,
      completedAt: Date.now(),
      answers: args.answers,
      score: score,
      results: results,
    });

    // Log event
    if (response) {
      const test = await ctx.db.get(response.testId);
      const user = await ctx.db.get(response.userId);
      
      if (test && user) {
        await ctx.db.insert("systemEvents", {
          type: "test_completed",
          userId: user._id,
          userEmail: user.email,
          entityId: test._id.toString(),
          entityName: test.title,
          details: `${args.answers.length} questions answered`,
          status: "success",
          timestamp: Date.now(),
        });
      }
    }

    return {
      responseId: args.responseId,
      results: results,
    };
  },
});

// Add a new function to analyze test responses
export const analyzeTestResponse = mutation({
  args: {
    responseId: v.id("testResponses"),
  },
  handler: async (ctx, args) => {
    // Get the test response
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      throw new Error("Test response not found");
    }

    // Get the test
    const test = await ctx.db.get(response.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Get all questions with full option details
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", response.testId))
      .collect();

    // Get the user's answers
    const answers = response.answers || [];

    // Enhanced scoring system - initialize scores for all career fields
    const careerFieldScores: Record<string, number> = {};
    const careerFieldResponses: Record<string, number> = {}; // Track response count per field
    
    test.careerFields.forEach(field => {
      careerFieldScores[field] = 0;
      careerFieldResponses[field] = 0;
    });

    // Calculate scores based on answers
    for (const answer of answers) {
      // Find the question this answer belongs to
      const question = questions.find(q => q._id === answer.questionId);
      if (!question) continue;

      // Find the selected option
      const selectedOption = question.options.find(opt => opt.value === answer.response);
      if (!selectedOption) continue;

      // Add scores for each associated career field
      const optionCareerFields = selectedOption.careerFields || [];
      for (const field of optionCareerFields) {
        if (careerFieldScores[field] !== undefined) {
          careerFieldScores[field] += selectedOption.score || 1;
          careerFieldResponses[field] += 1;
        }
      }
    }

    // Calculate normalized scores (percentage of possible points)
    const normalizedScores: Record<string, number> = {};
    Object.entries(careerFieldScores).forEach(([field, score]) => {
      const responseCount = careerFieldResponses[field];
      normalizedScores[field] = responseCount > 0 ? score / responseCount : 0;
    });

    // Find the maximum possible score
    const maxScore = Math.max(...Object.values(normalizedScores), 1); // prevent divide by zero
    
    // Calculate relative scores (percentage of max score)
    const relativeScores: Record<string, number> = {};
    Object.entries(normalizedScores).forEach(([field, score]) => {
      relativeScores[field] = (score / maxScore) * 100;
    });
    
    // Enhanced analysis - calculate confidence scores
    const confidenceScores: Record<string, number> = {};
    const responseCounts = Object.values(careerFieldResponses);
    const maxResponses = Math.max(...responseCounts, 1);
    
    Object.entries(relativeScores).forEach(([field, score]) => {
      // Confidence combines both relative score and response coverage
      const responseRatio = careerFieldResponses[field] / maxResponses;
      // Weight formula: 70% from score, 30% from response coverage
      confidenceScores[field] = (score * 0.7) + (responseRatio * 100 * 0.3);
    });
    
    // Filter fields: Only include fields with at least 50% of the max score
    const significantFields = Object.entries(relativeScores)
      .filter(([_, score]) => score >= 50)
      .map(([field]) => field);

    // Sort all fields by confidence score (not just by raw score)
    const sortedFields = Object.entries(confidenceScores)
      .sort((a, b) => b[1] - a[1])
      .map(([field]) => field);

    // Use significant fields, or fall back to top 3 if none meet threshold
    const recommendedFields = significantFields.length > 0 
      ? significantFields
      : sortedFields.slice(0, 3);
      
    // Identify THE best match (field with highest confidence)
    const bestMatch = sortedFields[0];
    const bestMatchConfidence = confidenceScores[bestMatch];
    
    // Classify confidence level for best match
    let confidenceLevel = "Medium";
    if (bestMatchConfidence >= 85) confidenceLevel = "Very High";
    else if (bestMatchConfidence >= 70) confidenceLevel = "High";
    else if (bestMatchConfidence <= 40) confidenceLevel = "Low";
    
    // Generate top strengths based on the recommended fields
    const strengths = recommendedFields.slice(0, 3);

    // Handle edge case where no fields have scores
    if (strengths.length === 0) {
      strengths.push("General Aptitude");
    }

    // Create a more personalized summary focused on the best match
    const summary = `Based on your responses, ${bestMatch} appears to be your strongest career match with ${confidenceLevel.toLowerCase()} confidence (${Math.round(bestMatchConfidence)}%). This aligns well with your preferences and demonstrated interests.`;

    // Create personalized insights
    const insights = [
      `Your responses show a strong alignment with careers in ${bestMatch}.`,
      `You demonstrate particular strength in areas related to ${strengths.slice(0, 2).join(' and ')}.`,
    ];

    if (sortedFields.length >= 2) {
      insights.push(`Consider exploring educational pathways related to ${sortedFields[0]} and ${sortedFields[1]}.`);
    }

    // Create a bestMatchInfo object but store it in details
    const bestMatchInfo = {
      field: bestMatch,
      confidenceScore: Math.round(bestMatchConfidence),
      confidenceLevel,
    };

    // Update the response with enhanced analysis results
    await ctx.db.patch(args.responseId, {
      completed: true,
      completedAt: Date.now(),
      results: {
        summary,
        recommendedFields,
        strengths,
        bestMatch: bestMatchInfo, // Move this up to the top level for consistency
        details: {
          aptitudeScores: careerFieldScores,
          normalizedScores,
          relativeScores,
          confidenceScores,
          responseCounts: careerFieldResponses,
          insights,
          allFields: sortedFields,
          // Store a copy here too for backward compatibility
          bestMatch: bestMatchInfo
        }
      }
    });

    // And in the return, add the bestMatch info so the UI can still use it
    return {
      recommendedFields,
      strengths,
      bestMatch: bestMatchInfo,
      summary
    };
  }
});

// Get test responses for a user
export const getUserTestResponses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("testResponses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get a specific test response
export const getTestResponse = query({
  args: {
    responseId: v.id("testResponses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    try {
      // Validate the responseId format
      const responseId = args.responseId;
      console.log("Server received responseId:", responseId);
      console.log("responseId type:", typeof responseId);
      
      if (!responseId || typeof responseId !== 'string') {
        throw new Error(`Invalid response ID format: Expected string but got ${typeof responseId}`);
      }

      // Get user information
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
        .first();

      if (!user) {
        throw new Error("User not found");
      }

      // Get the test response
      const response = await ctx.db.get(responseId);
      if (!response) {
        throw new Error(`Test response not found with ID: ${responseId}`);
      }

      // Only allow users to see their own responses (or admins)
      if (response.userId !== user._id && user.role !== "admin") {
        throw new Error("Not authorized to view this test response");
      }

      return response;
    } catch (error) {
      console.error("Error in getTestResponse:", error);
      throw error;
    }
  },
});

// Get test count for admin dashboard
export const getTestsCount = query({
  handler: async (ctx) => {
    const tests = await ctx.db.query("aptitudeTests").collect();
    return tests.length;
  },
});

// Get test responses for a specific student (admin only)
export const getStudentTestResponses = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if the user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .first();
    
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }
    
    // Get the student's test responses
    const responses = await ctx.db
      .query("testResponses")
      .withIndex("by_user", q => q.eq("userId", args.studentId))
      .collect();
    
    // Enrich with test titles
    const enrichedResponses = await Promise.all(
      responses.map(async (response) => {
        const test = await ctx.db.get(response.testId);
        return {
          ...response,
          testTitle: test?.title || "Unknown Test"
        };
      })
    );
    
    return enrichedResponses;
  },
});
