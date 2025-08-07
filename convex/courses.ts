import { v } from "convex/values";
import { query } from "./_generated/server";
import { CourseType } from "./schema";

export const listCourses = query({
  // Validators for arguments.
  args: {
    count: v.optional(v.number()),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const courses = args.count
      ? await ctx.db
          .query("courses")
          // Ordered by _creationTime, return most recent
          .order("desc")
          .take(args.count)
      : await ctx.db.query("courses").order("desc").collect();
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      courses: courses.reverse().map((course) => course),
    };
  },
});

export const listCoursesByType = query({
  // Validators for arguments.
  args: {
    type: CourseType,
    count: v.optional(v.number()),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();

    const filteredCourses = args.count ? courses.slice(0, args.count) : courses;

    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      courses: filteredCourses.reverse().map((course) => course),
    };
  },
});
