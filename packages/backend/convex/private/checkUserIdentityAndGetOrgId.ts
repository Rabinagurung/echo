
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// Accept any Convex ctx that has `auth`
type CtxWithAuth =
  | Pick<QueryCtx, "auth">
  | Pick<MutationCtx, "auth">
  | Pick<ActionCtx, "auth">

export async function checkUserIdentityAndGetOrgId(ctx: CtxWithAuth): Promise<string>{

    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    return orgId;

}