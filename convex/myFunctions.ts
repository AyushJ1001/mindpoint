import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// Helper function to extract internship plan from duration field
function extractInternshipPlanFromDuration(
  duration?: string,
): "120" | "240" | null {
  if (!duration) return null;

  // Look for patterns like "120 hours", "240 hours", "2 weeks", "4 weeks", etc.
  const durationLower = duration.toLowerCase().trim();

  // Check for hour patterns
  if (durationLower.includes("120") || durationLower.includes("2 week")) {
    return "120";
  }
  if (durationLower.includes("240") || durationLower.includes("4 week")) {
    return "240";
  }

  // Check for week patterns
  const weekMatch = durationLower.match(/(\d+)\s*week/);
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1]);
    if (weeks <= 2) return "120";
    if (weeks >= 4) return "240";
  }

  // Check for hour patterns
  const hourMatch = durationLower.match(/(\d+)\s*hour/);
  if (hourMatch) {
    const hours = parseInt(hourMatch[1]);
    if (hours <= 120) return "120";
    if (hours >= 240) return "240";
  }

  return null;
}

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

// Calculate end date based on internship plan
function calculateInternshipEndDate(
  startDate: string,
  internshipPlan: "120" | "240",
): string {
  const start = new Date(startDate);
  const weeks = internshipPlan === "120" ? 2 : 4; // 2 weeks for 120 hours, 4 weeks for 240 hours

  const endDate = new Date(start);
  endDate.setDate(start.getDate() + weeks * 7); // Add weeks * 7 days

  return endDate.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

// Handle successful payment and create enrollment
export const handleSuccessfulPayment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
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

    // Extract internship plan from course duration
    const internshipPlan =
      extractInternshipPlanFromDuration(course.duration) || undefined;

    // Create enrollment record
    const enrollmentId = await ctx.db.insert("enrollments", {
      userId: args.userId,
      userName: args.studentName || args.userEmail,
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType, // Store session type if provided
      courseType: course.type, // Store course type
      internshipPlan: internshipPlan, // Store internship plan if provided
      sessions: course.sessions, // Store number of sessions for therapy courses
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userId],
    });

    const userName = args.studentName || args.userEmail;

    // Send appropriate email based on course type
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
    } else if (course.type === "internship" && internshipPlan) {
      // Calculate end date based on internship plan
      const calculatedEndDate = calculateInternshipEndDate(
        course.startDate,
        internshipPlan,
      );

      // Schedule internship enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendInternshipEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: course.startDate,
          endDate: calculatedEndDate,
          startTime: course.startTime,
          endTime: course.endTime,
          internshipPlan: internshipPlan,
        },
      );
    } else if (course.type === "certificate") {
      // Schedule certificate enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCertificateEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
        },
      );
    } else if (course.type === "diploma") {
      // Schedule diploma enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendDiplomaEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
        },
      );
    } else if (course.type === "pre-recorded") {
      // Schedule pre-recorded enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendPreRecordedEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
        },
      );
    } else if (course.type === "masterclass") {
      // Schedule masterclass enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendMasterclassEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          courseName: course.name,
          enrollmentNumber: enrollmentNumber,
          startDate: course.startDate,
          endDate: course.endDate,
          startTime: course.startTime,
          endTime: course.endTime,
        },
      );
    } else if (course.type === "therapy") {
      // Schedule therapy enrollment confirmation email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendTherapyEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: userName,
          userPhone: args.userPhone,
          therapyType: course.name,
          sessionCount: course.sessions || 1,
          enrollmentNumber: enrollmentNumber,
        },
      );
    } else {
      // Schedule legacy enrollment confirmation email for other types
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
      courseType: course.type,
      internshipPlan: internshipPlan,
    };
  },
});

// Handle multiple course enrollments for cart checkout
export const handleCartCheckout = mutation({
  args: {
    userId: v.string(),
    courseIds: v.array(v.id("courses")),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
    studentName: v.optional(v.string()),
    sessionType: v.optional(
      v.union(v.literal("focus"), v.literal("flow"), v.literal("elevate")),
    ),
  },

  handler: async (ctx, args) => {
    const enrollments = [];
    const supervisedEnrollments = [];
    const alreadyEnrolledCourses = [];

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
        // Add to already enrolled courses for email notification
        alreadyEnrolledCourses.push({
          courseName: course.name,
          courseType: course.type,
        });
        continue;
      }

      // Generate enrollment number
      const enrollmentNumber = generateEnrollmentNumber(
        course.code,
        course.startDate,
      );

      // Extract internship plan from course duration
      const internshipPlan =
        extractInternshipPlanFromDuration(course.duration) || undefined;

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userId,
        courseId: courseId,
        courseName: course.name,
        userName: args.studentName || args.userEmail,
        userEmail: args.userEmail,
        userPhone: args.userPhone,
        enrollmentNumber: enrollmentNumber,
        sessionType: args.sessionType, // Store session type if provided
        courseType: course.type, // Store course type
        internshipPlan: internshipPlan, // Store internship plan if provided
        sessions: course.sessions, // Store number of sessions for therapy courses
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userId],
      });

      // Calculate end date for internship courses
      let endDate = course.endDate;
      if (course.type === "internship" && internshipPlan) {
        endDate = calculateInternshipEndDate(course.startDate, internshipPlan);
      }

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        courseType: course.type,
        startDate: course.startDate,
        endDate: endDate,
        startTime: course.startTime,
        endTime: course.endTime,
        internshipPlan: internshipPlan,
        sessions: course.sessions, // Include sessions for therapy courses
        sessionType: args.sessionType, // Include session type for supervised courses
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
          userName: args.studentName || args.userEmail,
          userPhone: args.userPhone,
          enrollments: enrollments,
        },
      );
    }

    // If user was already enrolled in all courses, send a notification email
    if (
      enrollments.length === 0 &&
      supervisedEnrollments.length === 0 &&
      alreadyEnrolledCourses.length > 0
    ) {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendAlreadyEnrolledNotification,
        {
          userEmail: args.userEmail,
          userName: args.studentName || args.userEmail,
          alreadyEnrolledCourses: alreadyEnrolledCourses,
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
    const alreadyEnrolledCourses = [];

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
        // Add to already enrolled courses for email notification
        alreadyEnrolledCourses.push({
          courseName: course.name,
          courseType: course.type,
        });
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
        courseType: course.type, // Store course type
        sessions: course.sessions, // Store number of sessions for therapy courses
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
        courseType: course.type,
        startDate: course.startDate,
        endDate: course.endDate,
        startTime: course.startTime,
        endTime: course.endTime,
        sessions: course.sessions, // Include sessions for therapy courses
        sessionType: undefined, // No session type for this function
      });
    }

    // Send email based on enrollment status
    if (enrollments.length > 0) {
      // Schedule email sending action for new enrollments
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendCartCheckoutConfirmation,
        {
          userEmail: args.userEmail,
          userName: guestUser.name,
          userPhone: guestUser.phone,
          enrollments: enrollments,
        },
      );
    } else if (alreadyEnrolledCourses.length > 0) {
      // Send notification for already enrolled courses
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendAlreadyEnrolledNotification,
        {
          userEmail: args.userEmail,
          userName: guestUser.name,
          alreadyEnrolledCourses: alreadyEnrolledCourses,
        },
      );
    }

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
    const alreadyEnrolledCourses = [];

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
        // Add to already enrolled courses for email notification
        alreadyEnrolledCourses.push({
          courseName: course.name,
          courseType: course.type,
        });
        continue;
      }

      // Generate enrollment number
      const enrollmentNumber = generateEnrollmentNumber(
        course.code,
        course.startDate,
      );

      // Extract internship plan from course duration
      const internshipPlan =
        extractInternshipPlanFromDuration(course.duration) || undefined;

      // Create enrollment record
      const enrollmentId = await ctx.db.insert("enrollments", {
        userId: args.userData.email, // Use email as userId for guest users
        userName: args.userData.name,
        userEmail: args.userData.email,
        userPhone: args.userData.phone,
        courseId: courseId,
        courseName: course.name,
        enrollmentNumber: enrollmentNumber,
        isGuestUser: true,
        sessionType: args.sessionType, // Store session type if provided
        courseType: course.type, // Store course type
        internshipPlan: internshipPlan, // Store internship plan if provided
        sessions: course.sessions, // Store number of sessions for therapy courses
      });

      // Update course to add user to enrolledUsers array
      await ctx.db.patch(courseId, {
        enrolledUsers: [...course.enrolledUsers, args.userData.email],
      });

      // Calculate end date for internship courses
      let endDate = course.endDate;
      if (course.type === "internship" && internshipPlan) {
        endDate = calculateInternshipEndDate(course.startDate, internshipPlan);
      }

      const enrollmentData = {
        enrollmentId,
        enrollmentNumber,
        courseName: course.name,
        courseId: courseId,
        courseType: course.type,
        startDate: course.startDate,
        endDate: endDate,
        startTime: course.startTime,
        endTime: course.endTime,
        internshipPlan: internshipPlan,
        sessions: course.sessions, // Include sessions for therapy courses
        sessionType: args.sessionType, // Include session type for supervised courses
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
          userName: args.userData.name,
          userPhone: args.userData.phone,
          enrollments: enrollments,
        },
      );
    }

    // Send notification for already enrolled courses (independent of new enrollments)
    if (alreadyEnrolledCourses.length > 0) {
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendAlreadyEnrolledNotification,
        {
          userEmail: args.userData.email,
          userName: args.userData.name,
          alreadyEnrolledCourses: alreadyEnrolledCourses,
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
      courseType: course.type, // Store course type
      sessions: course.sessions, // Store number of sessions for therapy courses
    });

    // Update course to add user to enrolledUsers array
    await ctx.db.patch(args.courseId, {
      enrolledUsers: [...course.enrolledUsers, args.userEmail],
    });

    // Schedule appropriate email based on course type
    if (course.type === "therapy") {
      // Send therapy-specific email
      await ctx.scheduler.runAfter(
        0,
        api.emailActions.sendTherapyEnrollmentConfirmation,
        {
          userEmail: args.userEmail,
          userName: guestUser.name,
          userPhone: guestUser.phone,
          therapyType: course.name,
          sessionCount: course.sessions || 1,
          enrollmentNumber: enrollmentNumber,
        },
      );
    } else {
      // Send generic enrollment confirmation email
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
    };
  },
});

// Handle supervised therapy enrollment
export const handleSupervisedTherapyEnrollment = mutation({
  args: {
    userId: v.string(),
    courseId: v.id("courses"),
    userEmail: v.string(),
    userPhone: v.optional(v.string()),
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
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      sessionType: args.sessionType, // Store the session type
      courseType: course.type, // Store course type
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
    userPhone: v.optional(v.string()),
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
        phone: args.userPhone || "", // Use provided phone or empty string
      });
      guestUser = await ctx.db.get(guestUserId);
    } else {
      // Update existing guest user with the student name and phone
      await ctx.db.patch(guestUser._id, {
        name: args.studentName,
        phone: args.userPhone || guestUser.phone,
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
      userEmail: args.userEmail,
      userPhone: args.userPhone,
      courseId: args.courseId,
      courseName: course.name,
      enrollmentNumber: enrollmentNumber,
      isGuestUser: true,
      sessionType: args.sessionType, // Store the session type
      courseType: course.type, // Store course type
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
