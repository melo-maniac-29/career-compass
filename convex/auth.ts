import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

// This will be called by a Clerk webhook when users are created
export const createUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.clerkId))
      .first();
    
    if (existingUser) {
      return existingUser._id;
    }

    // Create new user if they don't exist
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      tokenIdentifier: args.clerkId,
      role: "student", // Default role
    });
  },
});

// This function will be called to create or find a user
export const createOrFindUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .first();
    
    // If user exists, return it
    if (user) return user;
    
    // Just use the basic information we can reliably get
    const userId = await ctx.db.insert("users", {
      name: "User", // Default name, can be updated later
      email: "", // Empty email, can be updated later
      tokenIdentifier: identity.subject,
      role: "student",
    });
    
    return await ctx.db.get(userId);
  },
});

export const debugIdentity = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { error: "Not authenticated" };
    }
    
    // Return the entire identity object for debugging
    return {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name, // May be undefined
      email: identity.email, // May be undefined
      hasName: identity.name !== undefined,
      hasEmail: identity.email !== undefined,
      // Return all available properties
      allProps: Object.keys(identity),
    };
  },
});