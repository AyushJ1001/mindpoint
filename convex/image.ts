import { query } from "./_generated/server";
import { v } from "convex/values";

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return { url };
  },
});
