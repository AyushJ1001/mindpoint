import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Test mutation to create a course with an offer
export const createTestCourseWithOffer = mutation({
  args: {},
  returns: v.id("courses"),
  handler: async (ctx, args) => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const courseId = await ctx.db.insert("courses", {
      name: "Test Course with Offer",
      description: "This is a test course to verify offer functionality",
      type: "certificate",
      code: "TEST001",
      price: 5000,
      offer: {
        name: "Early Bird Special",
        discount: 20, // 20% off
        startDate: startDate.toISOString().split("T")[0], // YYYY-MM-DD format
        endDate: endDate.toISOString().split("T")[0], // YYYY-MM-DD format
      },
      capacity: 50,
      enrolledUsers: [],
      startDate: "2025-01-15",
      endDate: "2025-02-15",
      startTime: "18:00",
      endTime: "19:30",
      daysOfWeek: ["Mon", "Wed"],
      content: "Test course content",
      reviews: [],
      duration: "4 weeks",
      imageUrls: ["/blue-dream-therapy-hero.png"],
      modules: [
        {
          title: "Module 1",
          description: "Introduction to the course",
        },
        {
          title: "Module 2",
          description: "Advanced concepts",
        },
      ],
      learningOutcomes: [
        {
          icon: "🧠",
          title: "Deep Understanding",
        },
        {
          icon: "🛠️",
          title: "Practical Skills",
        },
      ],
    });

    return courseId;
  },
});

// Test mutation to create a course with an expired offer
export const createTestCourseWithExpiredOffer = mutation({
  args: {},
  returns: v.id("courses"),
  handler: async (ctx, args) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
    const endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const courseId = await ctx.db.insert("courses", {
      name: "Test Course with Expired Offer",
      description: "This is a test course with an expired offer",
      type: "certificate",
      code: "TEST002",
      price: 5000,
      offer: {
        name: "Expired Special",
        discount: 30, // 30% off (expired)
        startDate: startDate.toISOString().split("T")[0], // YYYY-MM-DD format
        endDate: endDate.toISOString().split("T")[0], // YYYY-MM-DD format
      },
      capacity: 50,
      enrolledUsers: [],
      startDate: "2025-01-15",
      endDate: "2025-02-15",
      startTime: "18:00",
      endTime: "19:30",
      daysOfWeek: ["Mon", "Wed"],
      content: "Test course content",
      reviews: [],
      duration: "4 weeks",
      imageUrls: ["/blue-dream-therapy-hero.png"],
      modules: [
        {
          title: "Module 1",
          description: "Introduction to the course",
        },
        {
          title: "Module 2",
          description: "Advanced concepts",
        },
      ],
      learningOutcomes: [
        {
          icon: "🧠",
          title: "Deep Understanding",
        },
        {
          icon: "🛠️",
          title: "Practical Skills",
        },
      ],
    });

    return courseId;
  },
});
