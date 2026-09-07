
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

// Accept any Convex ctx that has `auth`
type CtxWithAuth =
  | Pick<QueryCtx, "auth">
  | Pick<MutationCtx, "auth">
  | Pick<ActionCtx, "auth">

// Org role assigned to the shared recruiter demo account (see convex/public/guest.ts).
// This Clerk instance only has the built-in Admin/Member org roles, so Member
// doubles as the read-only marker — real orgs should keep non-admin teammates
// on Admin if they need write access, since Member is now guest-equivalent.
export const GUEST_ORG_ROLE = "org:member";

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