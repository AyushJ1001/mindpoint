import { internalMutation } from "./_generated/server";

// Match the naming the course-detail hero expects: /covers/<CODE>.jpg with a
// /covers/<CODE>-hero.jpg sibling.
export const apply = internalMutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").take(2000);
    const course = courses.find((row) => row.code === "CCPTSD");
    if (!course) return { error: "CCPTSD not found" };
    await ctx.db.patch(course._id, {
      imageUrls: ["/covers/CCPTSD.jpg"],
      updatedAt: Date.now(),
      updatedByAdminId: "bootstrap:ptsd-cover-naming",
    });
    return { courseId: String(course._id), image: "/covers/CCPTSD.jpg" };
  },
});
