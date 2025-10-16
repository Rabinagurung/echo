import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";
import { internal } from "../_generated/api";


/**
 * ### `upsert`
 * 
 * Public mutation that **schedules** an internal Convex action to upsert
 * a third-party integration secret for the authenticated organization.
 *
 * ---
 *
 * #### ⚙️ Purpose
 * This mutation acts as a **safe frontend entry point** for storing API credentials
 * (e.g., Vapi public/private keys) in AWS Secrets Manager through a background
 * internal action.
 *
 * The actual secret persistence logic lives in
 * [`backend/convex/system/secrets.ts`](../system/secrets.ts), which:
 * - Writes secrets to **AWS Secrets Manager**.
 * - Syncs metadata (organization ID, service, secretName) into the Convex DB.
 *
 * ---
 *
 * #### 🧠 Why use a scheduler instead of calling the internal action directly?
 * - **External I/O (AWS SDK)** must run in an `action`, not a `mutation`.
 * - Actions can’t access Convex DB directly, so they invoke mutations internally.
 * - By scheduling the action with `ctx.scheduler.runAfter(0, ...)`, we run it
 *   **immediately** but asynchronously—avoiding latency and blocking issues.
 *
 * ---
 *
 * #### 📚 References
 * - [Convex Scheduled Functions](https://docs.convex.dev/scheduling/scheduled-functions)
 * - [Convex Actions vs Mutations](https://docs.convex.dev/functions/actions)
 * - [Internal Functions Guide](https://docs.convex.dev/functions/internal-functions)
 * - [Stack Convex: “Kick off a background action” Example](https://stack.convex.dev/pinecone-and-embeddings#kick-off-a-background-action)
 *
 * ---
 *
 * #### 🧩 Example (Frontend)
 * ```ts
 * const upsertSecret = useMutation(api.private.secrets.upsert);
 * await upsertSecret({
 *   service: "vapi",
 *   value: {
 *     publicApiKey: "pk_live_123",
 *     privateApiKey: "sk_live_abc",
 *   },
 * });
 * ```
 *
 * This schedules an internal action that creates or updates a secret
 * in AWS under:
 * ```
 * tenant/{organizationId}/vapi
 * ```
 *
 * ---
 *
 * #### 💡 Notes
 * - The `value` is stored as a JSON string (`SecretString` in AWS).
 * - Calling this repeatedly simply updates the same secret (idempotent).
 * - The mutation itself doesn’t return the secret — it only triggers the upsert.
 *
 * ---
 *
 * @param {Object} args
 * @param {"vapi"} args.service - Type of third-party service. Currently only `"vapi"`.
 * @param {Record<string, any>} args.value - Object containing secret data (e.g., `{ publicApiKey, privateApiKey }`).
 */
export const upsert = mutation({
    args: {
        service: v.union(v.literal("vapi")),
        value: v.any(),
    }, 

    handler: async(ctx, args) =>{
        const orgId = await checkUserIdentityAndGetOrgId(ctx);

    
     /*
     This upsert mutation (private -> secrets.ts) is only used to call in our VapiView Component 
     in VapiPluginForm using useMutation. 
    But the actual logic of storing secret keys in AWS and secretName in convex database is in backend/convex/system/secrets.ts
    
     How internalAction upsert function can be called in this mutation? 
     Link about scheduled funcitons: 
     https://docs.convex.dev/scheduling/scheduled-functions
      https://stack.convex.dev/pinecone-and-embeddings#kick-off-a-background-action  

     Using runAfter and 0 means run immidiately where service is vapi and orgId is from userIdentiifer and values from VapiPluginForm. 

     Why are we doing half work here and there. 
     
     Reasons behind three secrets.ts file like in : 
        backend/convex/system/secrets.ts 
        backend/convex/private/secrets.ts
        backend/convex/lib/secrets.ts

     a. To be able to reuse upsert function in backend/convex/system/secret.ts 

     b. Why are we using mutation instead of using useAction when system->secrets->upsert is internalAction ? 
        Why internalAction upsert is abstracted behind a mutation?
     
        i.  https://stack.convex.dev/pinecone-and-embeddings#kick-off-a-background-action  
        ii. system/secret.ts, upsert fn is internalAction [becase upsertSecret fn from lib/secrets.ts that uses third part service (AWS)]
        iii. system -> secrets.ts -> upsert is internalAction because it will be easy to create update form if needed 
          using another mutation and schedule internalAction upsert like we are doing here. 

      
          Eg: 
          await ctx.scheduler.runAfter(0, internal.system.secrets.upsert, {
            service: args.service,
            organizationId: orgId,
            value: args.value,
          });

    c. In convex doc, using useAction is defined as anti-pattern. 
      So, upsert internalAction (system -> secrets.ts ) is wrapped within mutation then exposed and used in Vapi-view using useMutation. 
    */
        await ctx.scheduler.runAfter(0, internal.system.secrets.upsert, {
            service: args.service, 
            organizationId: orgId,
            value: args.value
        });
    }
});