import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";

export const getOneByConversationId = query({
    args: {
        conversationId: v.id("conversations")
    }, 
    handler: async(ctx, args) =>{

        const orgId = await checkUserIdentityAndGetOrgId(ctx);

        const conversation = await ctx.db.get(args.conversationId); 

        if(!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if(conversation.organizationId !== orgId) {
              throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid organization id"
            })
        }


         if(!conversation.contactSessionId) {
            throw new ConvexError({
               code: "NOT_FOUND",
              message: "Contact session ID not found in conversation"
          })
        }

        const contactSession = await ctx.db.get(conversation.contactSessionId); 

        if(!contactSession) {
            throw new ConvexError({
              code: "NOT_FOUND",
              message: "Contact session not found"
            })
        }
    

        return contactSession;
        
    }
})