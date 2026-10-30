import { internalMutation } from "./_generated/server";

// Give the PTSD draft its own course cover, matching the other certificates.
//   npx convex run bootstrapPtsdCover:apply --prod
export const apply = internalMutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === "CCPTSD");
    if (!course) return { error: "CCPTSD not found" };
    await ctx.db.patch(course._id, {
      imageUrls: ["/covers/ptsd-complex-trauma.jpg"],
      updatedAt: Date.now(),
      updatedByAdminId: "bootstrap:ptsd-cover",
    });
    return { courseId: String(course._id), images: 1 };
  },
});
