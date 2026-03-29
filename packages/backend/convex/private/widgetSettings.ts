import { v } from "convex/values";
import { internalQuery, mutation, query } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";

export const getAllowedDomains = internalQuery({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();
    return widgetSettings?.allowedDomains ?? [];
  },
});

export const getOne = query({
  args: {},
  handler: async (ctx) => {
    const orgId = await checkUserIdentityAndGetOrgId(ctx);

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    return widgetSettings;
  },
});

export const upsert = mutation({
  args: {
    greetMessage: v.string(),
    defaultSuggestions: v.object({
      suggestion1: v.optional(v.string()),
      suggestion2: v.optional(v.string()),
      suggestion3: v.optional(v.string()),
    }),
    vapiSettings: v.object({
      assistantId: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
    }),
    allowedDomains: v.optional(v.array(v.string())),
  },

  handler: async (ctx, args) => {
    const orgId = await checkUserIdentityAndGetOrgId(ctx);

    const existingWidgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    if (existingWidgetSettings) {
      //enforcing one widgetsettings per organization
      await ctx.db.patch(existingWidgetSettings._id, {
        greetMessage: args.greetMessage,
        defaultSuggestions: args.defaultSuggestions,
        vapiSettings: args.vapiSettings,
        allowedDomains: args.allowedDomains,
      });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: orgId,
        greetMessage: args.greetMessage,
        defaultSuggestions: args.defaultSuggestions,
        vapiSettings: args.vapiSettings,
        allowedDomains: args.allowedDomains,
      });
    }
  },
});

