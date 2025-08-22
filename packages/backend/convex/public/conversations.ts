import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";

 


export const getOne = query({
    args: {
        conversationId: v.id("conversations"), 
        contactSessionId: v.id("contactSessions"),
    }, 
    handler: async(ctx, args) => {

        const session = await ctx.db.get(args.contactSessionId); 
        if(!session || session.expiresAt < Date.now()){
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Invalid session"
            })
        }

        const conversation = await ctx.db.get(args.conversationId); 
        if(!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Conversation not found"
            })
        }

        if(conversation.contactSessionId !== session._id) {
             throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Incorrect session"
            })
        }

        return {
            _id: conversation._id, 
            status: conversation.status,
            threadId: conversation.threadId
        } //threadId is key to load messages
    }
})

export const create = mutation({
    args: {
        contactSessionId: v.id("contactSessions"),
        organizationId: v.string(), 
        
    }, 
    handler: async(ctx, args) =>{
        

        const session = await ctx.db.get(args.contactSessionId); 

        if(!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid session"
            })
        }

        // userId should be organizationId thats how we willl associate thread with
       const { threadId } = await supportAgent.createThread(ctx, {
            userId: args.organizationId
        });

        // TODO: later modify to widget settings initial message(allow users to customize inital message)
        await saveMessage(ctx, components.agent, {
            threadId, 
            message: {
                role: "assistant", 
                content: "Hello, How can I help you today"
            }
        })

        const conversationId  = await ctx.db.insert("conversations",{
            threadId,
            contactSessionId: session._id,
            status: "unresolved",
            organizationId: args.organizationId
        })

        return  conversationId;
    }
})



