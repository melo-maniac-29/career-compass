import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Log a new system event
export const logEvent = mutation({
  args: {
    type: v.string(),
    userId: v.optional(v.id("users")),
    userEmail: v.optional(v.string()),
    entityId: v.optional(v.string()),
    entityName: v.optional(v.string()),
    details: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("systemEvents", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get recent system events
export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check admin authorization
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

    // Get the most recent events
    const limit = args.limit || 10;
    return await ctx.db
      .query("systemEvents")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// Get all system events (admin only)
export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    // Check admin authorization
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

    // Get all events sorted by timestamp
    return await ctx.db
      .query("systemEvents")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
  },
});

// Example: Update existing mutations in your app to log events
// For example, in aptitudeTests.ts, after a test is submitted:
// await ctx.db.mutation("systemEvents:logEvent", {
//   type: "test_completed",
//   userId: user._id,
//   userEmail: user.email,
//   entityId: testId.toString(),
//   entityName: test.title,
//   details: `Score: ${score}%`,
//   status: "success",
// });
