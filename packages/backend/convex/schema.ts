import { defineSchema,defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    /**
     * Convex schema for plugin configurations.
     *
     * Each record links an organization to a third-party integration.
     * -`secretName` points to the AWS Secrets Manager entry holding API keys.
     * -`service` identifies which external service the secret belongs to (e.g., vapi, google calender).
     * 
     * eg: We can ask AWS Secret Manager about What are the API keys of this organization that stored vapi keys ? 
     * We will use getSecretValue fn of secrets.ts to get those API keys and use parseSecretString fn to parse stringified API keys to JSON object.
     */
    plugins: defineTable({
        organizationId: v.string(),
        secretName: v.string(), // AWS secret name storing service credentials like API keys of vapi 
        service: v.union(v.literal("vapi")), // Service type (extendable to others like google calender)
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_organization_id_and_service", ["organizationId", "service"]),

    widgetSettings: defineTable({
        organizationId: v.string(),
        greetMessage: v.string(),
        defaultSuggestions: v.object({
            suggestion1: v.optional(v.string()),
            suggestion2: v.optional(v.string()),
            suggestion3: v.optional(v.string()),
        }),
        vapiSettings: v.object({
            assistantId: v.optional(v.string()),
            phoneNumber: v.optional(v.string()),
        }),
    })
    .index("by_organization_id", ["organizationId"])
    ,


    conversations: defineTable({
        threadId: v.string(),
        organizationId: v.string(), 
        contactSessionId: v.id("contactSessions"),

        status:v.union(
            v.literal("unresolved"), 
            v.literal("escalated"),
            v.literal("resolved")
        )
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_contact_session_id", ["contactSessionId"])
    .index("by_thread_id", ["threadId"])
    .index("by_status_and_organization_id", ["status","organizationId"])
    ,

    contactSessions: defineTable({
        name: v.string(), 
        email: v.string(), 
        organizationId: v.string(), 
        expiresAt: v.number(), 
        metadata: v.optional(v.object({
                userAgent: v.optional(v.string()),
                platform: v.optional(v.string()),
                language: v.optional(v.string()),
                languages: v.optional(v.string()),
                vendor: v.optional(v.string()),
                screenResolution: v.optional(v.string()),
                viewportSize: v.optional(v.string()),
                timezone: v.optional(v.string()),
                timezoneOffset: v.optional(v.number()),
                cookieEnabled: v.optional(v.boolean()),
                referrer: v.optional(v.string()),
                currentUrl: v.optional(v.string()),  
        }))
    })
    .index("by_organization_id", ["organizationId"])
    .index("by_expires_at", ["expiresAt"]),

    users: defineTable({
        name: v.string()
    })
}); 