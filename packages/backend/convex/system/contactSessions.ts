
import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { AUTO_REFRESH_THRESHOLD_MS, RATE_LIMIT_MAX_MESSAGES, RATE_LIMIT_WINDOW_MS, SESSION_DURATION_MS } from "../constants";



export const checkAndIncrementRateLimit = internalMutation({
    args: {
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if (!session) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Contact session not found" });
        }

        const now = Date.now();
        const windowStart = session.rateLimitWindowStart ?? 0;
        const isNewWindow = now - windowStart >= RATE_LIMIT_WINDOW_MS;

        const count = isNewWindow ? 0 : (session.rateLimitMessageCount ?? 0);

        if (count >= RATE_LIMIT_MAX_MESSAGES) {
            const resetsAt = new Date(windowStart + RATE_LIMIT_WINDOW_MS).toISOString();
            throw new ConvexError({
                code: "RATE_LIMITED",
                message: `Message limit reached. You can send more messages after ${resetsAt}.`,
            });
        }

        await ctx.db.patch(args.contactSessionId, {
            rateLimitWindowStart: isNewWindow ? now : windowStart,
            rateLimitMessageCount: count + 1,
        });
    },
});

export const getOne = internalQuery({
    args: {
        contactSessionId: v.id("contactSessions")
    },

    handler: async(ctx, args)=>{
        return await ctx.db.get(args.contactSessionId)

    }
})

export const refresh = internalMutation(({
    args: {
        contactSessionId: v.id("contactSessions")
    }, 
    handler: async(ctx, args) => {

        const contactSession = await ctx.db.get(args.contactSessionId)

        if(!contactSession) {
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Contact session not found"
            })
        }

        if(contactSession.expiresAt < Date.now()){
             throw new ConvexError({
                code: "BAD_REQUEST", 
                message: "Contact Session Expired"
            })
        }

        const timeRemaining = contactSession.expiresAt - Date.now(); 

        if(timeRemaining < AUTO_REFRESH_THRESHOLD_MS) {

            const newExpiresAt = Date.now() + SESSION_DURATION_MS; 

            await ctx.db.patch(args.contactSessionId, {
                expiresAt: newExpiresAt
            })

            return { ...contactSession, expiresAt: newExpiresAt  }
            
        }

        return contactSession;
    }
}))