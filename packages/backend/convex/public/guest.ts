import { ConvexError } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error(
    "CLERK_SECRET_KEY environment variable is required"
  )
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Mints a single-use, short-lived Clerk sign-in ticket for the shared
 * recruiter demo account (CLERK_GUEST_USER_ID). The client redeems it via
 * `signIn.create({ strategy: "ticket", ticket })` to get a real, isolated
 * Clerk session without ever handling a shared password.
 *
 * The guest account's org role (org:guest) is what actually protects the
 * demo data — see checkUserIdentityAndGetOrgId's `requireWrite` guard.
 */
export const createSignInTicket = action({
  args: {},

  handler: async () => {
    const guestUserId = process.env.CLERK_GUEST_USER_ID;

    if (!guestUserId) {
      throw new ConvexError({
        code: "NOT_CONFIGURED",
        message: "Guest sign-in is not configured",
      });
    }

    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: guestUserId,
      expiresInSeconds: 60,
    });

    return { ticket: signInToken.token };
  },
});
