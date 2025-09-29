import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { components} from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";
import { saveMessage } from "@convex-dev/agent";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../system/ai/constants";


export const getMany = query({
    args: {
        threadId: v.string(), 
        paginationOpts: paginationOptsValidator,
    }, 
    
    handler: async(ctx, args) =>{
        const orgId = await checkUserIdentityAndGetOrgId(ctx)
        
        const conversation = await ctx.db.query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();

        if(!conversation){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID",
            });
        }

        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId, 
            paginationOpts: args.paginationOpts
        })

        return paginated;
    }
})


export const create = mutation({
    args:{
        conversationId: v.id("conversations"),
        prompt: v.string(), 
    }, 

    handler: async(ctx, args) =>{

        const orgId = await checkUserIdentityAndGetOrgId(ctx)

       const conversation = await ctx.db.get(args.conversationId);

        if(!conversation) 
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Conversation not found"
            })
        
        if(conversation.organizationId !== orgId) 
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Invalid Organization ID",
            })


        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation resolved",
            });
        }

        if (conversation.status === "unresolved") {
            await ctx.db.patch(args.conversationId, {
                status: "escalated",
            });
        }

        await saveMessage(ctx, components.agent, {
            threadId: conversation.threadId, 
            message: {
                role: "assistant", 
                content: args.prompt
            }
        })
    }
});


export const enhanceResponse = action({
    args: {
        prompt: v.string()
    }, 

    handler: async(ctx, args) =>{

        const orgId = checkUserIdentityAndGetOrgId(ctx)

        const response = await generateText({
            model: google("gemini-1.5-flash"), 
            messages: [
                {
                    role: "system", 
                    content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT
                }, 
                {
                    role: "user", 
                    content: args.prompt
                }
            ]
        });

        return response.text;

    }
});