
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// Accept any Convex ctx that has `auth`
type CtxWithAuth =
  | Pick<QueryCtx, "auth">
  | Pick<MutationCtx, "auth">
  | Pick<ActionCtx, "auth">

// Org role assigned to the shared recruiter demo account (see convex/public/guest.ts).
// Kept out of that account's write paths so concurrent guests can't corrupt the demo data.
export const GUEST_ORG_ROLE = "org:guest";

export async function checkUserIdentityAndGetOrgId(
  ctx: CtxWithAuth,
  options?: { requireWrite?: boolean },
): Promise<string>{

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

    if (options?.requireWrite && identity.orgRole === GUEST_ORG_ROLE) {
      throw new ConvexError({
        code: "GUEST_READ_ONLY",
        message: "Guest accounts are read-only. Sign up for a free account to make changes.",
      });
    }

    return orgId;

}