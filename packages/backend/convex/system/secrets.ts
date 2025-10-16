import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { upsertSecret } from "../lib/secrets";
import { internal } from "../_generated/api";


/** @fileoverview
 * Internal action for managing organization-specific third-party integration secrets.
 *
 * Each record associates an organization with a third-party integration.
 * The integration credentials (API keys, tokens, etc.) are stored securely
 * in AWS Secrets Manager and linked to our internal Convex database.
 *
 * This ensures that both AWS Secrets Manager and our internal database
 * remain synchronized — enabling secure retrieval and management of integration keys.
 *
 * ---
 *
 * Example:
 *   - AWS Secret Name: `tenant/1234/vapi`
 *   - Service: `"vapi"`
 *   - Organization ID: `"1234"`
 *
 * In this example, the secret is stored under the path `tenant/{organizationId}/{service}`
 * in AWS Secrets Manager. This action will both upsert the secret in AWS and
 * record the corresponding metadata in our Convex database for easy retrieval later.
 */

/**
 * Internal action to upsert (create or update) a secret for an organization's
 * third-party integration in AWS Secrets Manager and record it in Convex.
 *
 * @internal
 * @function upsert
 *
 * @param {Object} ctx - Convex server context.
 * @param {Object} args - Function arguments.
 * @param {string} args.organizationId - Unique identifier of the organization.
 * @param {"vapi"} args.service - Type of third-party service. Currently supports `"vapi"`.
 * @param {any} args.value - The secret value or credentials object to store (typically JSON).
 *
 * @returns {Promise<{ status: "success" }>} Indicates successful creation or update.
 *
 * @example
 * // Example usage (internally):
 * await internal.system.integrations.upsert({
 *   organizationId: "1234",
 *   service: "vapi",
 *   value: { apiKey: "abcd-1234-xyz" }
 * });
 *
 * // Result:
 * // - Secret stored in AWS under: tenant/1234/vapi
 * // - Plugin record saved in Convex linking the org, service, and secret name.
 */
export const upsert = internalAction({
    args: {
        organizationId: v.string(),
        service: v.union(v.literal("vapi")), 
        value: v.any()
    }, 
    handler: async(ctx, args) =>{
        //In EchoTenantScretsManager, ADRN was created with `tenant/*` (wild card) that's how secretName is developed. 
        const secretName = `tenant/${args.organizationId}/${args.service}`;

        //create or update secret in AWS secrets manager
        await upsertSecret(secretName, args.value); 
      
        /** 
         * Create or update a plugin record in the Convex database.
         *
         * Why this step is necessary:
         * - The `upsert` action is an internal operation, invoked by our backend — not by end users.
         * - When `upsertSecret` runs, it creates or updates a secret in AWS Secrets Manager
         *   under a tenant-specific name, e.g. `tenant/${args.organizationId}/${args.service}`.
         * - Without recording the `secretName` in our Convex database, we would have no way
         *   to retrieve or reference it later when interacting with that integration.
         *
         * Therefore, `plugins.ts` (located at `packages/backend/convex/system/plugins.ts`)
         * is responsible for persisting this linkage between:
         *   - `organizationId` (the owning organization)
         *   - `service` (the integration name, e.g. vapi, google, vercel)
         *   - `secretName` (the AWS Secrets Manager key)
         *
         * This synchronization ensures both AWS Secrets Manager and our internal Convex
         * database remain consistent and can be queried reliably in the future.
         * 
         * Why are we using ctx.runMutation? 
         * Because we are inside internalAction which does not have direct access to database using ctx.ruMutation
         */
        await ctx.runMutation(internal.system.plugins.upsert, {
            service: args.service, 
            secretName, 
            organizationId: args.organizationId
        });

        return {status: "success"}

    }
})