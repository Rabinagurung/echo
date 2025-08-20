import { v } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";


if(!process.env.CLERK_SECRET_KEY) {
    throw new Error(
        "CLERK_SECRET_KEY environment variable is required"
    )
}

const clerkClient =  createClerkClient({secretKey: process.env.CLERK_SECRET_KEY});

export const validate = action({
    args: {
        organizationId: v.string()
    }, 

    handler: async(_, args)=>{
        // Check this code 
       /* const organization = await clerkClient.organizations.getOrganization({organizationId: args.organizationId})


        if(!organization){ 
        return {valid: false, reason: "Organization not valid"}
        } else {
        return {valid: true}
        }
       
        */

        try {
            const organization = await clerkClient.organizations.getOrganization({organizationId: args.organizationId})
            return { valid: true }
        } catch (error) {
             return { valid: false, reason: "Organization not valid"}
            
        }

    }

})