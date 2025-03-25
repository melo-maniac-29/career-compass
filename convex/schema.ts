import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    role: v.optional(v.string()),
    image: v.optional(v.string()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]),
    
  colleges: defineTable({
    name: v.string(),
    location: v.string(),
    image: v.string(),
    fields: v.array(v.string()),
    rating: v.number(),
    students: v.string(),
    courses: v.number(),
    description: v.string(),
    featured: v.boolean(),
    tuition: v.string(),
    applicationDeadline: v.string(),
    programDuration: v.string(),
    facilities: v.array(v.string()),
    admissionRequirements: v.array(v.string()),
    overview: v.string(),
    website: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_featured", ["featured"]),
  
  counselors: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    specialization: v.string(),
    experience: v.number(),
    bio: v.string(),
    availability: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_specialization", ["specialization"]),

  aptitudeTests: defineTable({
    title: v.string(),
    description: v.string(),
    timeLimit: v.optional(v.number()), // Time limit in minutes (optional)
    category: v.string(), // E.g., "Career Interest", "Personality", "Skills"
    difficulty: v.string(), // E.g., "Easy", "Medium", "Hard"
    active: v.boolean(), // Whether the test is currently active for students
    imageUrl: v.optional(v.string()),
    createdBy: v.id("users"), // Reference to the admin who created the test
    careerFields: v.array(v.string()), // Related career fields
  })
    .index("by_category", ["category"])
    .index("by_active", ["active"])
    .index("by_creator", ["createdBy"]),
    
  testQuestions: defineTable({
    testId: v.id("aptitudeTests"),
    questionText: v.string(),
    questionType: v.string(), // "multiple-choice", "true-false", "scale"
    options: v.array(v.object({
      text: v.string(),
      value: v.string(),
      score: v.optional(v.number()),
      careerFields: v.optional(v.array(v.string())), // Add this line to the schema
    })),
    correctAnswer: v.optional(v.string()), // For questions with right/wrong answers
    orderIndex: v.number(), // For ordering questions within a test
  })
    .index("by_test", ["testId"])
    .index("by_test_and_order", ["testId", "orderIndex"]),
    
  testResponses: defineTable({
    userId: v.id("users"),
    testId: v.id("aptitudeTests"),
    completed: v.boolean(),
    startedAt: v.number(), // Timestamp
    completedAt: v.optional(v.number()), // Timestamp
    answers: v.array(v.object({
      questionId: v.id("testQuestions"),
      response: v.string(),
    })),
    score: v.optional(v.number()),
    results: v.optional(v.object({
      summary: v.string(),
      recommendedFields: v.array(v.string()),
      strengths: v.array(v.string()),
      bestMatch: v.optional(v.object({  // Use v.object() for nested objects
        field: v.string(),
        confidenceScore: v.number(),
        confidenceLevel: v.string(),
      })),
      details: v.any(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_test", ["testId"])
    .index("by_user_and_test", ["userId", "testId"]),

  systemEvents: defineTable({
    type: v.string(), // e.g., "test_completed", "college_added", "user_registered"
    userId: v.optional(v.id("users")), // Which user performed the action (if applicable)
    userEmail: v.optional(v.string()), // Cache user email for display
    entityId: v.optional(v.string()), // ID of the affected entity (test, college, etc.)
    entityName: v.optional(v.string()), // Name of the affected entity
    details: v.optional(v.string()), // Additional details about the event
    status: v.string(), // "success", "error", "warning", etc.
    timestamp: v.number(), // When the event occurred
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"])
    .index("by_user", ["userId"]),
});

// Update the TestResults type to include bestMatch
export type TestResults = {
  summary: string;
  recommendedFields: string[];
  strengths: string[];
  bestMatch?: {
    field: string;
    confidenceScore: number;
    confidenceLevel: string;
  };
  details: any;
};