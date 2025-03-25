import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all colleges
export const getAllColleges = query({
  handler: async (ctx) => {
    return await ctx.db.query("colleges").collect();
  },
});

// Get a specific college by ID
export const getCollegeById = query({
  args: { id: v.id("colleges") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get filtered colleges
export const getFilteredColleges = query({
  args: {
    searchQuery: v.optional(v.string()),
    field: v.optional(v.string()),
    location: v.optional(v.string()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let colleges = await ctx.db.query("colleges").collect();
    
    // Apply filters
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      colleges = colleges.filter(
        college => 
          college.name.toLowerCase().includes(query) || 
          college.description.toLowerCase().includes(query)
      );
    }
    
    if (args.field && args.field !== "All Fields") {
      colleges = colleges.filter(
        college => college.fields.some(field => field === args.field)
      );
    }
    
    if (args.location && args.location !== "All Locations") {
      colleges = colleges.filter(
        college => college.location.includes(args.location as string)
      );
    }
    
    if (args.maxPrice !== undefined && args.maxPrice > 0) {
      // Extract numeric tuition from string like "$45,000/year"
      colleges = colleges.filter(college => {
        const tuitionMatch = college.tuition.match(/\$?([\d,]+)/);
        if (!tuitionMatch) return true;
        
        const tuitionValue = parseInt(tuitionMatch[1].replace(/,/g, ""));
        const maxPrice = args.maxPrice as number; // Safe assertion since we already checked undefined
        return !isNaN(tuitionValue) && tuitionValue <= maxPrice;
      });
    }
    
    return colleges;
  },
});

// Get all unique fields across colleges
export const getAllFields = query({
  handler: async (ctx) => {
    const colleges = await ctx.db.query("colleges").collect();
    
    // Extract all fields from all colleges and flatten the array
    const allFields = colleges.flatMap(college => college.fields || []);
    
    // Remove duplicates and sort alphabetically
    return ["All Fields", ...Array.from(new Set(allFields)).sort()];
  },
});

// Get all unique locations
export const getAllLocations = query({
  handler: async (ctx) => {
    const colleges = await ctx.db.query("colleges").collect();
    
    // Extract locations and sort alphabetically
    const locations = colleges.map(college => {
      // Extract state from location like "San Francisco, CA"
      const parts = college.location.split(",");
      return parts.length > 1 ? parts[1].trim() : college.location.trim();
    });
    
    return ["All Locations", ...Array.from(new Set(locations)).sort()];
  },
});

// Add a college (admin only)
export const addCollege = mutation({
  args: {
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
    
    const collegeId = await ctx.db.insert("colleges", args);
    
    // Log event
    await ctx.db.insert("systemEvents", {
      type: "college_added",
      userId: user._id,
      userEmail: user.email,
      entityId: collegeId.toString(),
      entityName: args.name,
      details: `Located in ${args.location}`,
      status: "created",
      timestamp: Date.now(),
    });
    
    return collegeId;
  },
});

// Delete a college (admin only)
export const deleteCollege = mutation({
  args: {
    id: v.id("colleges"),
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
    
    await ctx.db.delete(args.id);
    return true;
  },
});

// Get college count for admin dashboard
export const getCollegesCount = query({
  handler: async (ctx) => {
    const colleges = await ctx.db.query("colleges").collect();
    return colleges.length;
  },
});