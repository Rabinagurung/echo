import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc, saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../_generated/dataModel";





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


export const getMany = query({
    args: {
       status:v.optional(v.union(
            v.literal("unresolved"), 
            v.literal("escalated"),
            v.literal("resolved")
        )),

        paginationOpts: paginationOptsValidator
    }, 
    handler: async(ctx, args)=>{

        const identity = await ctx.auth.getUserIdentity(); 

        if(identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Identity not found"
            })
        }

        const orgId = identity.orgId as string;

        if(!orgId) {
             throw new ConvexError({
                code: "UNAUTHORIZED", 
                 message: "Organization not found",
            })
        }

        let conversations: PaginationResult<Doc<"conversations">>
        if(args.status) {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_status_and_organization_id", (q) => 
                q.eq("status", args.status as Doc<"conversations">["status"] ).eq("organizationId", orgId))
                .order("desc")
                .paginate(args.paginationOpts);
        }else {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_organization_id", (q) => 
                q.eq("organizationId", orgId))
                .order("desc")
                .paginate(args.paginationOpts);
        }
      
        const conversationsWithLastMessage = await Promise.all(
            conversations.page.map(async(conversation) => {
                let lastMessage: MessageDoc | null = null;

                const contactSession = await ctx.db.get(conversation.contactSessionId);

                if(!contactSession) return null;

                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId, 
                    paginationOpts: {numItems: 1, cursor: null}
                })

                if(messages.page.length > 0) {
                    lastMessage = messages.page[0] ?? null;
                }

                return {
                    ...conversation,
                    lastMessage, 
                    contactSession
                }
            })
        )

        const validConversations = conversationsWithLastMessage.filter(
            (conv)=> conv !== null)


        return {
            ...conversations, 
            page: validConversations
        }

    }
})



