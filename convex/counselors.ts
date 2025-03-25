import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all counselors
export const getAllCounselors = query({
  handler: async (ctx) => {
    return await ctx.db.query("counselors").collect();
  },
});

// Get counselor by ID
export const getCounselorById = query({
  args: { id: v.id("counselors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get counselors by specialization
export const getCounselorsBySpecialization = query({
  args: { specialization: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("counselors")
      .withIndex("by_specialization", q => q.eq("specialization", args.specialization))
      .collect();
  },
});

// Add a counselor (admin only)
export const addCounselor = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    specialization: v.string(),
    experience: v.number(),
    bio: v.string(),
    availability: v.string(),
  },
  handler: async (ctx, args) => {
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
    
    // Check if counselor with this email already exists
    const existingCounselor = await ctx.db
      .query("counselors")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    
    if (existingCounselor) {
      throw new Error("A counselor with this email already exists");
    }
    
    const counselorId = await ctx.db.insert("counselors", args);
    
    // Log event
    await ctx.db.insert("systemEvents", {
      type: "counselor_added",
      userId: user._id,
      userEmail: user.email,
      entityId: counselorId.toString(),
      entityName: args.name,
      details: `Specialization: ${args.specialization}`,
      status: "created",
      timestamp: Date.now(),
    });
    
    return counselorId;
  },
});

// Delete a counselor (admin only)
export const deleteCounselor = mutation({
  args: {
    id: v.id("counselors"),
  },
  handler: async (ctx, args) => {
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
    
    await ctx.db.delete(args.id);
    return true;
  },
});

// Update a counselor (admin only)
export const updateCounselor = mutation({
  args: {
    id: v.id("counselors"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialization: v.optional(v.string()),
    experience: v.optional(v.number()),
    bio: v.optional(v.string()),
    availability: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    
    return await ctx.db.get(id);
  },
});

// Get counselor count for admin dashboard
export const getCounselorsCount = query({
  handler: async (ctx) => {
    const counselors = await ctx.db.query("counselors").collect();
    return counselors.length;
  },
});
