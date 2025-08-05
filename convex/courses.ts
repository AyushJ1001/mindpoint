import { v } from "convex/values";
import { query } from "./_generated/server";

export const listCourses = query({
    // Validators for arguments.
    args: {
      count: v.optional(v.number()),
    },
  
    // Query implementation.
    handler: async (ctx, args) => {
      //// Read the database as many times as you need here.
      //// See https://docs.convex.dev/database/reading-data.
      const courses = args.count ? await ctx.db
        .query("courses")
        // Ordered by _creationTime, return most recent
        .order("desc")
        .take(args.count) : await ctx.db.query("courses").order("desc").collect();
      return {
        viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
        courses: courses.reverse().map((course) => course),
      };
    },
  });