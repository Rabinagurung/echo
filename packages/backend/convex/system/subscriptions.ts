import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { ECDH } from "crypto";



/**s
 * This upsert fn is used to create or update status of someone's subscription through our web hook.
 */
export const upsert = internalMutation({
    args: {
        organizationId: v.string(), 
        status: v.string()
    }, 
    handler: async(ctx, args) =>{
        const existingSubscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
            .unique(); 

        if(existingSubscription) {
            await ctx.db.patch(existingSubscription._id, {
                status: args.status
            })
        } else {
            await ctx.db.insert("subscriptions", {
                organizationId: args.organizationId, 
                status: args.status
            })
        }


    }
})


/**
 *  Internal Query that is going to be used in other API routes to check whether this organization 
 *  that user has in their identity token has subscription or not
 */
export const getByOrganizationId = internalQuery({
    args: {
        organizationId: v.string()
    },

    handler: async(ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
            .unique(); 
    }
})