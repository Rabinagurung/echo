import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { SESSION_DURATION_MS } from "../constants";


/**
 * Create a new contact session for a user within an organization.
 *
 * @mutation public.contactSessions.create
 *
 * @param args.name - Display name provided by the user.
 * @param args.email - Email address provided by the user.
 * @param args.organizationId - Organization to scope this session under.
 * @param args.metadata - Optional environment/browser hints for support and analytics.
 *
 * @returns The inserted `contactSessions` document id.
 *
 * @remarks
 * - The `expiresAt` timestamp is computed server-side based on {@link SESSION_DURATION_MS}.
 * - `metadata` is optional and should remain privacy-conscious.
 * - This mutation is invoked by the client after local validation; server validation
 *   is enforced again through Convex schema definitions.
 * - The table schema for `contactSessions` (including its fields and indexes)
 *   is defined in `schema.ts` under `defineTable({ ... })`.
 * - Indexed by `organizationId` and `expiresAt` for efficient query and cleanup operations.
 */
export const create = mutation({
    args: {
        name: v.string(), 
        email: v.string(), 
        organizationId: v.string(), 
        metadata: v.optional(v.object({
                userAgent: v.optional(v.string()),
                platform: v.optional(v.string()),
                language: v.optional(v.string()),
                languages: v.optional(v.string()),
                vendor: v.optional(v.string()),
                screenResolution: v.optional(v.string()),
                viewportSize: v.optional(v.string()),
                timezone: v.optional(v.string()),
                timezoneOffset: v.optional(v.number()),
                cookieEnabled: v.optional(v.boolean()),
                referrer: v.optional(v.string()),
                currentUrl: v.optional(v.string()),  
        }))
    }, 

    handler: async(ctx, args) =>{
        const now = Date.now(); 
        const expiresAt = now + SESSION_DURATION_MS;

        const contactSessionId  = await ctx.db.insert("contactSessions",{
            name: args.name, 
            email: args.email,
            organizationId:args.organizationId,
            metadata:args.metadata, 
            expiresAt
        });

        return contactSessionId;
    }
})





export const validate = mutation({
    args: {
        contactSessionId: v.id("contactSessions")
    }, 
    handler: async(ctx, args) => {

        const contactSession = await ctx.db.get(args.contactSessionId)

        if(!contactSession) return {valid: false, reason: "Contact session not found"}
        if(contactSession.expiresAt < Date.now()) return { valid: false, reason: "Contact Session Id has expired"}

        return {valid: true, contactSession}
    }
})