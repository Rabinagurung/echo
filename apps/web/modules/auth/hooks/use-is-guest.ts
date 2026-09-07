"use client";

import { useAuth } from "@clerk/nextjs";

// Mirrors GUEST_ORG_ROLE in packages/backend/convex/private/checkUserIdentityAndGetOrgId.ts.
// This Clerk instance only exposes the built-in Admin/Member org roles, so
// Member doubles as the read-only guest marker.
export const GUEST_ORG_ROLE = "org:member";

/**
 * True when the signed-in user is on the shared read-only guest account.
 * Backend write mutations already reject guests via `requireWrite`; this
 * hook lets the UI disable those controls up front instead of surfacing
 * a GUEST_READ_ONLY error after the fact.
 */
export const useIsGuest = () => {
  const { orgRole } = useAuth();
  return orgRole === GUEST_ORG_ROLE;
};
