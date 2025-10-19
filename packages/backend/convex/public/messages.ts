import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { search } from "../system/ai/tools/search";


// promt is given by user in front end
export const create = action({
    args:{
        prompt: v.string(), 
        threadId: v.string(), //we get threadId from conversation
        contactSessionId: v.id("contactSessions"),
    }, 
    handler: async(ctx, args) =>{

        const contactSession = await ctx.runQuery(
            internal.system.contactSessions.getOne, 
            {
                contactSessionId: args.contactSessionId
            }
        )

        if(!contactSession || contactSession.expiresAt < Date.now())
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Invalid session"
            })
        

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId, 
            {
                threadId: args.threadId
            }
        )

        
        if(!conversation) 
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Conversation not found"
            })


        // Ensure the session owns this conversation/thread   
        if (conversation.contactSessionId !== contactSession._id) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Incorrect session"
            });
        }
        
        if(conversation.status === "resolved")  {
            throw new ConvexError({
                code: "BAD_REQUEST", 
                message: "Conversation is resolved"
            })
        }
           
        //After all validation, refresh the user's session if they are within AUT0_REFRESH_THRESHOLD_MS(4 hours)
        await ctx.runMutation(internal.system.contactSessions.refresh, {
            contactSessionId: args.contactSessionId
        })

        //Implemented subscription check because agents are used only for pro users
        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId, 
            {
                organizationId: conversation.organizationId
            
            }
        );

        //If the status is unresolved and subscription?.status is active, then agent can create message.
        //If the status is resolved nor agent nor user nor operator can create message.
        //If the status is escalated only operator can create message to user and agent is not allowed.
        const shouldTriggerAgent = conversation.status === "unresolved" && subscription?.status === "active";

        if(shouldTriggerAgent) {
            await supportAgent.generateText(
                ctx, 
                {   threadId: args.threadId }, 
                {   prompt: args.prompt, 
                    tools: {
                        escalateConversationTool: escalateConversation,
                        resolveConversationTool: resolveConversation,
                        searchTool: search
                    }
                }
            )
        } else {
            await saveMessage(ctx, components.agent, {
                threadId: args.threadId, 
                prompt: args.prompt
            })
        }
    }
})



export const getMany = query({
    args: {
        threadId: v.string(), 
        paginationOpts: paginationOptsValidator,
        contactSessionId: v.id("contactSessions"),
    }, 
    
    handler: async(ctx, args) =>{
        const contactSession = await ctx.db.get(args.contactSessionId); 
        
        if(!contactSession || contactSession.expiresAt < Date.now())
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Invalid session"
            })
        
        
       const conversation = await ctx.runQuery(
         internal.system.conversations.getByThreadId,
         { threadId: args.threadId }
       );

        if (!conversation) {
            throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
        }

        // Authorize: ensure the provided session owns the thread
        if (conversation.contactSessionId !== contactSession._id) {
            throw new ConvexError({ code: "UNAUTHORIZED", message: "Incorrect session" });
        }

        /** https://docs.convex.dev/agents/threads#getting-messages-in-a-thread */
        const paginated = await supportAgent.listMessages(ctx, 
            { 
                threadId: args.threadId , 
                paginationOpts: args.paginationOpts
            }, 
        )
        
        return paginated;

    }
})