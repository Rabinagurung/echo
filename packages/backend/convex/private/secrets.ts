import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";
import { internal } from "../_generated/api";

export const upsert = mutation({
    args: {
        service: v.union(v.literal("vapi")),
        value: v.any(),
    }, 

    handler: async(ctx, args) =>{
        const orgId = await checkUserIdentityAndGetOrgId(ctx);

        await ctx.scheduler.runAfter(0, internal.system.secrets.upsert, {
            service: args.service, 
            organizationId: orgId,
            value: args.value
        });
    }
});