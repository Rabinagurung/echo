import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
import { isOriginAllowed } from "../lib/isOriginAllowed";

export const validateOrigin = internalQuery({
  args: {
    organizationId: v.string(),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();

    if (
      widgetSettings?.allowedDomains &&
      widgetSettings.allowedDomains.length > 0
    ) {
      if (
        !args.origin ||
        !isOriginAllowed(args.origin, widgetSettings.allowedDomains)
      ) {
        throw new Error("This domain is not authorized to use this widget");
      }
    }
  },
});
