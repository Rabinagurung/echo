import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

 
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

        // Replace once the functionality for thread creation is completed
        const threadId="123"; 
        
        const conversationId  = await ctx.db.insert("conversations",{
            threadId,
            contactSessionId: session._id,
            status: "unresolved",
            organizationId: args.organizationId
        })

        return  conversationId;
    }
})


