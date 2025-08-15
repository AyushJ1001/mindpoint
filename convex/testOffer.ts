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
        discount: 20, // 20% off (0-100 scale)
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
        discount: 30, // 30% off (0-100 scale, expired)
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

// Test mutation to create therapy course variants
export const createTherapyCourseVariants = mutation({
  args: {},
  returns: v.array(v.id("courses")),
  handler: async (ctx, args) => {
    const courseIds: string[] = [];

    // Create therapy variants (all treated as base prices for Express plan)
    const therapyVariants = [
      {
        name: "Individual Therapy - 1 Session",
        description: "Professional therapy session - 1 session",
        sessions: 1,
        price: 1299,
      },
      {
        name: "Individual Therapy - 3 Sessions",
        description: "Professional therapy session - 3 sessions",
        sessions: 3,
        price: 1149,
      },
      {
        name: "Individual Therapy - 6 Sessions",
        description: "Professional therapy session - 6 sessions",
        sessions: 6,
        price: 999,
      },
    ];

    // Insert therapy variants
    for (const variant of therapyVariants) {
      const courseId = await ctx.db.insert("courses", {
        name: variant.name,
        description: variant.description,
        type: "therapy",
        code: `THERAPY-${variant.sessions}`,
        price: variant.price,
        sessions: variant.sessions,
        capacity: 100,
        enrolledUsers: [],
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        startTime: "09:00",
        endTime: "21:00",
        daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        content: "Professional therapy sessions with experienced counselors",
        reviews: [],
        imageUrls: ["/blue-dream-therapy-hero.png"],
      });
      courseIds.push(courseId);
    }

    return courseIds as any;
  },
});
