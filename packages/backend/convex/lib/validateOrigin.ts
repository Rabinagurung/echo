import { MutationCtx } from "../_generated/server";
import { isOriginAllowed } from "./isOriginAllowed";

/**
 * Validate that the given origin is allowed for the organization's widget.
 *
 * Queries `widgetSettings` by `organizationId` and checks the origin against
 * the configured `allowedDomains`. Throws if the origin is not authorized.
 *
 * No-op if `allowedDomains` is empty/undefined (backwards-compatible open access).
 */
export async function validateOrigin(
  ctx: { db: MutationCtx["db"] },
  organizationId: string,
  origin: string | undefined,
) {
  const widgetSettings = await ctx.db
    .query("widgetSettings")
    .withIndex("by_organization_id", (q) =>
      q.eq("organizationId", organizationId),
    )
    .unique();

  if (
    widgetSettings?.allowedDomains &&
    widgetSettings.allowedDomains.length > 0
  ) {
    if (!origin || !isOriginAllowed(origin, widgetSettings.allowedDomains)) {
      throw new Error("This domain is not authorized to use this widget");
    }
  }
}
