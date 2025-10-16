import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";


/** 
 * This function ensures that each organization’s third-party integration (plugin)
 * is correctly mapped to its corresponding secret stored in AWS Secrets Manager.
 * It either updates an existing record or creates a new one if none exists.
 *
 * The function is responsible for maintaining the linkage between:
 *   - `organizationId` — The unique identifier of the owning organization.
 *   - `service` — The name of the third-party integration (e.g., `vapi`, `google`, `vercel`).
 *   - `secretName` — The key (path) to the secret in AWS Secrets Manager, e.g. `tenant/{orgId}/{service}`.
 *
 * This synchronization ensures that:
 *   - AWS Secrets Manager and the Convex database remain consistent.
 *   - Integration secrets can be easily queried, updated, or validated in the future.
 *
 * ---
 *
 * @internal
 * @function upsert
 *
 * @param {Object} ctx - Convex server context.
 * @param {Object} args - Mutation arguments.
 * @param {"vapi"} args.service - The third-party integration service type.
 * @param {string} args.secretName - The name of the AWS Secrets Manager entry.
 * @param {string} args.organizationId - The organization identifier.
 *
 * @returns {Promise<void>} Resolves when the record is created or updated.
 *
 * @example
 * // Example: Sync plugin linkage for organization 1234 and VAPI service
 * await internal.system.plugins.upsert({
 *   organizationId: "1234",
 *   service: "vapi",
 *   secretName: "tenant/1234/vapi"
 * });
 *
 * // This ensures the plugin record exists and points to the correct AWS secret.
 */
export const upsert = internalMutation({
    args: {
        service: v.union(v.literal("vapi")),
        secretName: v.string(),
        organizationId:v.string(),
    }, 

    handler: async(ctx, args) => {
        // Check if a plugin record already exists for this organization and service.
        const existingPlugin = await ctx.db
            .query("plugins")
            .withIndex("by_organization_id_and_service", (q) => 
                q.eq("organizationId", args.organizationId).eq("service", args.service)
            )
            .unique();
        
        if(existingPlugin) {
            await ctx.db.patch(existingPlugin._id, {
                service: args.service, 
                secretName: args.secretName
            });
        } else {
            await ctx.db.insert("plugins", {
                organizationId: args.organizationId, 
                service: args.service, 
                secretName: args.secretName
            });
        }
    }
}); 



export const getByOrganizationIdAndService = internalQuery({
    args: {
        organizationId: v.string(),
        service: v.union(v.literal("vapi")),
    }, 

    handler: async (ctx, args) => {
        return await ctx.db
            .query("plugins")
            .withIndex("by_organization_id_and_service", (q) => 
                q.eq("organizationId", args.organizationId).eq("service", args.service)
            )
            .unique();
    }
});