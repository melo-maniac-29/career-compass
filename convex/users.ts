import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin credentials
const ADMIN_EMAIL = "ktmtitans@gmail.com";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Create the user first to get the userId
      const role = "student"; // Default role for new users
      
      const userId = await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        tokenIdentifier: args.tokenIdentifier,
        role: role,
      });
      
      // Log event for new user registration
      await ctx.db.insert("systemEvents", {
        type: "user_registered",
        userId: userId,
        userEmail: args.email,
        entityId: userId.toString(),
        entityName: args.name,
        details: `Role: ${role}`,
        status: "success",
        timestamp: Date.now(),
      });
      
      return userId;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the requesting user
    const requestingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.subject)
      )
      .first();
    
    if (!requestingUser) {
      throw new Error("User not found");
    }
    
    // Check if it's the user's own profile or if the requesting user is an admin
    const isOwnProfile = requestingUser._id === args.userId;
    const isAdmin = requestingUser.role === "admin";
    
    if (!isOwnProfile && !isAdmin) {
      throw new Error("Not authorized to update this user");
    }
    
    // Only admins can change roles
    if (args.role && !isAdmin) {
      throw new Error("Only admins can change user roles");
    }
    
    try {
      const updates: any = {};
      
      if (args.name !== undefined) {
        updates.name = args.name;
      }
      
      if (args.email !== undefined) {
        updates.email = args.email;
      }
      
      if (args.role !== undefined && isAdmin) {
        updates.role = args.role;
      }
      
      await ctx.db.patch(args.userId, updates);
      return await ctx.db.get(args.userId);
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  },
});

// Delete a user (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.subject)
      )
      .first();
    
    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }
    
    try {
      await ctx.db.delete(args.userId);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  },
});

export const getUser = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();
  },
});

// Check if a user is an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return false;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.subject)
      )
      .first();
    
    return user?.role === "admin";
  },
});

// Get the current user's profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }
    
    // The subject from Clerk JWT is the user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => 
        q.eq("tokenIdentifier", identity.subject)
      )
      .first();
    
    return user;
  },
});

// Get all students (non-admin users)
export const getAllStudents = query({
  handler: async (ctx) => {
    const students = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("role"), "student"))
      .collect();
    return students;
  },
});

// Get total user count for admin dashboard
export const getUsersCount = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users")
      .filter(q => q.eq(q.field("role"), "student"))
      .collect();
    return users.length;
  },
});

// Get a student by ID (admin only)
export const getStudentById = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if the requesting user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const requestingUser = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .first();
    
    if (!requestingUser || requestingUser.role !== "admin") {
      throw new Error("Not authorized - admin access required");
    }
    
    // Get the student
    const student = await ctx.db.get(args.studentId);
    return student;
  },
});