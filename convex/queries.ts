import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all colleges
export const getColleges = query({
  handler: async (ctx) => {
    return await ctx.db.query("colleges").collect();
  },
});

// Query to get featured colleges
export const getFeaturedColleges = query({
  handler: async (ctx) => {
    return await ctx.db.query("colleges").withIndex("by_featured", (q) => q.eq("featured", true)).collect();
  },
});

// Query to get college by ID
export const getCollege = query({
  args: { id: v.id("colleges") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
