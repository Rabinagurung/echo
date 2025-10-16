import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";


/**
 * Fetch a single plugin for the authenticated user's organization by service.
 *
 * Returns:
 * - the plugin document if found,
 * - `null` if not found.
 *
 * Uses the composite index `by_organization_id_and_service`.
 */
export const getOne = query({
    args: {
        service: v.union(v.literal("vapi"))
    }, 

    handler: async(ctx, args) => {

        const orgId = await checkUserIdentityAndGetOrgId(ctx); 

        return await ctx.db
            .query("plugins")
            .withIndex("by_organization_id_and_service", (q) =>
                q.eq("organizationId", orgId).eq("service", args.service)
            )
            .unique();
    }
});



/**
 * Delete a plugin for the authenticated user's organization by service.
 *
 * Throws:
 * - {@link ConvexError} with code "NOT_FOUND" if the plugin does not exist.
 *
 * Side effects:
 * - Removes the plugin record from Convex. Does **not** delete the AWS Secret.
 *   (Secret lifecycle is handled independently.)
 */
export const remove = mutation({
    args: {
        service: v.union(v.literal("vapi"))
    }, 
    handler: async(ctx, args) => {
        const orgId = await checkUserIdentityAndGetOrgId(ctx); 

        const existingPlugin = await ctx.db
            .query("plugins")
            .withIndex("by_organization_id_and_service", (q) =>
                q.eq("organizationId", orgId).eq("service", args.service)
            )
            .unique();
        
        if(!existingPlugin) {
             throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found"
            });
        }

        await ctx.db.delete(existingPlugin._id) 
    }
});