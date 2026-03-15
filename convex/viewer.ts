import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCurrentViewer = query({
  args: {},
  returns: v.union(
    v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
      subject: v.string(),
      tokenIdentifier: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    return {
      email: identity.email,
      name: identity.name,
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
    };
  },
});
