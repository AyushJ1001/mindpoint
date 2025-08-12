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
function generateEnrollmentNumber(
  courseCode: string,
  startDate: string,
): string {
  // Parse the start date to get month and year
  const date = new Date(startDate);
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 because getMonth() returns 0-11
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year

  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

  // Format: COURSECODE-MMYY-RANDOM
  return `TMP-${courseCode}-${month}${year}-${randomNumber}`;
}

// Handle successful payment and create enrollment
export const handleSuccessfulPayment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    userEmail: v.string(),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
  },

  handler: async (ctx, args) => {
    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Generate enrollment number
    const enrollmentNumber = generateEnrollmentNumber(
      course.code,
      course.startDate,
    );

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      userName: args.studentName || args.userEmail,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType, // Store session type if provided
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userId],
    });

    // Check if this is a supervised therapy course
    if (course.type === "supervised" && args.sessionType && args.studentName) {
      // Schedule supervised therapy welcome email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendSupervisedTherapyWelcomeEmail,
        {
          userEmail: args.userEmail,
          studentName: args.studentName,
          sessionType: args.sessionType,
        },
      );
    } else {
      // Schedule regular enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
        },
      );
    }

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };
  },
});

// Handle multiple course enrollments for cart checkout
export const handleCartCheckout = mutation({
  args: {
    userId: v.string(),
    courseIds: v.array(v.id("courses")),
    userEmail: v.string(),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
  },

  handler: async (ctx, args) => {
    const enrollments = [];
    const supervisedEnrollments = [];

    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Check if user is already enrolled
      if (course.enrolledUsers.includes(args.userId)) {
        console.log(
          `User ${args.userId} is already enrolled in course ${course.name}`,
        );
        continue;
      }

      // Generate enrollment number
      const enrollmentNumber = generateEnrollmentNumber(
        course.code,
        course.startDate,
      );

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userId,
        courseId: courseId,
        courseName: course.name,
        userName: args.studentName || args.userEmail,
        enrollmentNumber: enrollmentNumber,
        sessionType: args.sessionType, // Store session type if provided
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userId],
      });

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        startDate: course.startDate,
        endDate: course.endDate,
        startTime: course.startTime,
        endTime: course.endTime,
      };

      // Check if this is a supervised therapy course
      if (
        course.type === "supervised" &&
        args.sessionType &&
        args.studentName
      ) {
        supervisedEnrollments.push(enrollmentData);
      } else {
        enrollments.push(enrollmentData);
      }
    }

    // Send appropriate emails based on course types
    if (
      supervisedEnrollments.length > 0 &&
      args.sessionType &&
      args.studentName
    ) {
      // Send supervised therapy welcome email for each supervised course
      for (const enrollment of supervisedEnrollments) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendSupervisedTherapyWelcomeEmail,
          {
            userEmail: args.userEmail,
            studentName: args.studentName,
            sessionType: args.sessionType,
          },
        );
      }
    }

    if (enrollments.length > 0) {
      // Send regular cart checkout confirmation for non-supervised courses
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCartCheckoutConfirmation,
        {
          userEmail: args.userEmail,
          enrollments: enrollments,
        },
      );
    }

    return [...enrollments, ...supervisedEnrollments];
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
      }),
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

// Create a guest user
export const createGuestUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  returns: v.id("guestUsers"),
  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    const existingUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user with new information
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        phone: args.phone,
      });
      return existingUser._id;
    }

    // Create new guest user
    return await ctx.db.insert("guestUsers", {
      name: args.name,
      email: args.email,
      phone: args.phone,
    });
  },
});

// Handle guest user cart checkout using email
export const handleGuestUserCartCheckoutByEmail = mutation({
  args: {
    userEmail: v.string(),
    courseIds: v.array(v.id("courses")),
  },

  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!guestUser) {
      // Create a new guest user with the email
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: "Guest User", // Will be updated when we have the actual name
        email: args.userEmail,
        phone: "", // Will be updated when we have the actual phone
      });
      guestUser = await ctx.db.get(guestUserId);
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    const enrollments = [];

    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Check if user is already enrolled (using email as unique identifier for guest users)
      if (course.enrolledUsers.includes(args.userEmail)) {
        console.log(
          `Guest user ${args.userEmail} is already enrolled in course ${course.name}`,
        );
        continue;
      }

      // Generate enrollment number
      const enrollmentNumber = generateEnrollmentNumber(
        course.code,
        course.startDate,
      );

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userEmail, // Use email as userId for guest users
        userName: guestUser.name,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userEmail],
      });

      enrollments.push({
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        startDate: course.startDate,
        endDate: course.endDate,
        startTime: course.startTime,
        endTime: course.endTime,
      });
    }

    // Schedule email sending action
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendCartCheckoutConfirmation,
      {
        userEmail: args.userEmail,
        enrollments: enrollments,
      },
    );

    return enrollments;
  },
});

// Handle guest user cart checkout with complete user data
export const handleGuestUserCartCheckoutWithData = mutation({
  args: {
    userData: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    courseIds: v.array(v.id("courses")),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
  },

  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userData.email))
      .first();

    if (guestUser) {
      // Update existing guest user with new information
      await ctx.db.patch(guestUser._id, {
        name: args.userData.name,
        phone: args.userData.phone,
      });
    } else {
      // Create a new guest user
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: args.userData.name,
        email: args.userData.email,
        phone: args.userData.phone,
      });
      guestUser = await ctx.db.get(guestUserId);
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    const enrollments = [];
    const supervisedEnrollments = [];

    for (const courseId of args.courseIds) {
      // Get the course details
      const course = await ctx.db.get(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Check if user is already enrolled (using email as unique identifier for guest users)
      if (course.enrolledUsers.includes(args.userData.email)) {
        console.log(
          `Guest user ${args.userData.email} is already enrolled in course ${course.name}`,
        );
        continue;
      }

      // Generate enrollment number
      const enrollmentNumber = generateEnrollmentNumber(
        course.code,
        course.startDate,
      );

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userData.email, // Use email as userId for guest users
        userName: args.userData.name,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        sessionType: args.sessionType, // Store session type if provided
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userData.email],
      });

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        startDate: course.startDate,
        endDate: course.endDate,
        startTime: course.startTime,
        endTime: course.endTime,
      };

      // Check if this is a supervised therapy course
      if (course.type === "supervised" && args.sessionType) {
        supervisedEnrollments.push(enrollmentData);
      } else {
        enrollments.push(enrollmentData);
      }
    }

    // Send appropriate emails based on course types
    if (supervisedEnrollments.length > 0 && args.sessionType) {
      // Send supervised therapy welcome email for each supervised course
      for (const enrollment of supervisedEnrollments) {
        await ctx.scheduler.runAfter(
          0,
          api.emailActions.sendSupervisedTherapyWelcomeEmail,
          {
            userEmail: args.userData.email,
            studentName: args.userData.name,
            sessionType: args.sessionType,
          },
        );
      }
    }

    if (enrollments.length > 0) {
      // Send regular cart checkout confirmation for non-supervised courses
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCartCheckoutConfirmation,
        {
          userEmail: args.userData.email,
          enrollments: enrollments,
        },
      );
    }

    return [...enrollments, ...supervisedEnrollments];
  },
});

// Handle single course enrollment for guest user using email
export const handleGuestUserSingleEnrollmentByEmail = mutation({
  args: {
    userEmail: v.string(),
    courseId: v.id("courses"),
  },

  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!guestUser) {
      // Create a new guest user with the email
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: "Guest User", // Will be updated when we have the actual name
        email: args.userEmail,
        phone: "", // Will be updated when we have the actual phone
      });
      guestUser = await ctx.db.get(guestUserId);
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is already enrolled
    if (course.enrolledUsers.includes(args.userEmail)) {
      throw new Error("User is already enrolled in this course");
    }

    // Generate enrollment number
    const enrollmentNumber = generateEnrollmentNumber(
      course.code,
      course.startDate,
    );

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userEmail, // Use email as userId for guest users
      userName: guestUser.name,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userEmail],
    });

    // Schedule email sending action
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendEnrollmentConfirmation,
      {
        userEmail: args.userEmail,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        startDate: course.startDate,
        endDate: course.endDate,
        startTime: course.startTime,
        endTime: course.endTime,
      },
    );

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
    };
  },
});

// Handle supervised therapy enrollment
export const handleSupervisedTherapyEnrollment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    userEmail: v.string(),
    studentName: v.string(),
    sessionType: v.union(
      v.literal("focus"),
      v.literal("flow"),
      v.literal("elevate"),
    ),
  },

  handler: async (ctx, args) => {
    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Generate enrollment number
    const enrollmentNumber = generateEnrollmentNumber(
      course.code,
      course.startDate,
    );

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      userName: args.studentName,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType, // Store the session type
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userId],
    });

    // Schedule the new supervised therapy welcome email
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendSupervisedTherapyWelcomeEmail,
      {
        userEmail: args.userEmail,
        studentName: args.studentName,
        sessionType: args.sessionType,
      },
    );

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };
  },
});

// Handle guest user supervised therapy enrollment
export const handleGuestUserSupervisedTherapyEnrollment = mutation({
  args: {
    userEmail: v.string(),
    courseId: v.id("courses"),
    studentName: v.string(),
    sessionType: v.union(
      v.literal("focus"),
      v.literal("flow"),
      v.literal("elevate"),
    ),
  },

  handler: async (ctx, args) => {
    // Check if guest user already exists with this email
    let guestUser = await ctx.db
      .query("guestUsers")
      .withIndex("by_email", (q) => q.eq("email", args.userEmail))
      .first();

    if (!guestUser) {
      // Create a new guest user with the email
      const guestUserId = await ctx.db.insert("guestUsers", {
        name: args.studentName,
        email: args.userEmail,
        phone: "", // Will be updated when we have the actual phone
      });
      guestUser = await ctx.db.get(guestUserId);
    } else {
      // Update existing guest user with the student name
      await ctx.db.patch(guestUser._id, {
        name: args.studentName,
      });
    }

    if (!guestUser) {
      throw new Error("Failed to create or retrieve guest user");
    }

    // Get the course details
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is already enrolled
    if (course.enrolledUsers.includes(args.userEmail)) {
      throw new Error("User is already enrolled in this course");
    }

    // Generate enrollment number
    const enrollmentNumber = generateEnrollmentNumber(
      course.code,
      course.startDate,
    );

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userEmail, // Use email as userId for guest users
      userName: args.studentName,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
      sessionType: args.sessionType, // Store the session type
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userEmail],
    });

    // Schedule the new supervised therapy welcome email
    await ctx.scheduler.runAfter(
      0,
      api.emailActions.sendSupervisedTherapyWelcomeEmail,
      {
        userEmail: args.userEmail,
        studentName: args.studentName,
        sessionType: args.sessionType,
      },
    );

    return {
      enrollmentId,
      enrollmentNumber,
      courseName: course.name,
      sessionType: args.sessionType,
    };
  },
});
