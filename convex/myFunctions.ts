import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// Generate a unique enrollment number
function generateEnrollmentNumber(courseCode: string, startDate: string): string {
  // Parse the start date to get month and year
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() returns 0-11
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
  
  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Format: COURSECODE-MMYY-RANDOM
  return `${courseCode}-${month}${year}-${randomNumber}`;
}

// Handle successful payment and create enrollment
export const handleSuccessfulPayment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
  },
  
  handler: async (ctx, args) => {
    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    
    // Generate enrollment number
    const enrollmentNumber = generateEnrollmentNumber(course.code, course.startDate);
    
    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      courseId: args.courseId,
      enrollmentNumber: enrollmentNumber,
    });
    
    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userId],
    });
    
    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
    };
  },
});

// Handle multiple course enrollments for cart checkout
export const handleCartCheckout = mutation({
  args: {
    userId: v.string(),
    courseIds: v.array(v.id("courses")),
  },
  
  handler: async (ctx, args) => {
    const enrollments = [];
    
    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }
      
      // Check if user is already enrolled
      if (course.enrolledUsers.includes(args.userId)) {
        console.log(`User ${args.userId} is already enrolled in course ${course.name}`);
        continue;
      }
      
      // Generate enrollment number
      const enrollmentNumber = generateEnrollmentNumber(course.code, course.startDate);
      
      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userId,
        courseId: courseId,
        enrollmentNumber: enrollmentNumber,
      });
      
      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userId],
      });
      
      enrollments.push({
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
      });
    }
    
    return enrollments;
  },
});

// Get enrollments for a specific user
export const getUserEnrollments = query({
  args: {
    userId: v.string(),
  },
  
  handler: async (ctx, args) => {
    const enrollments = await ctx.db
      .query("enrollments")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    // Get course details for each enrollment
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        return {
          ...enrollment,
          course: course,
        };
      })
    );
    
    return enrollmentsWithCourses;
  },
});

// Get enrollment by enrollment number
export const getEnrollmentByNumber = query({
  args: {
    enrollmentNumber: v.string(),
  },
  
  handler: async (ctx, args) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .filter((q) => q.eq(q.field("enrollmentNumber"), args.enrollmentNumber))
      .first();
    
    if (!enrollment) {
      return null;
    }
    
    const course = await ctx.db.get(enrollment.courseId);
    return {
      ...enrollment,
      course: course,
    };
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
