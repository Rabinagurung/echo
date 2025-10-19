import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { createClerkClient } from "@clerk/backend";
import type { WebhookEvent } from "@clerk/backend";
import { internal } from "./_generated/api";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY
});

const http = httpRouter(); 

http.route({
    path: "/clerk-webhook", 
    method: "POST", 
    handler: httpAction(async(ctx, request) => {
        const event = await validateRequest(request); 

        if(!event) {
            throw new Response("Error occured", { status: 400 })
        }

        switch(event.type){
            case "subscription.updated" : {
                const subscription = event.data as {
                    status: string;
                    payer?: {
                        organization_id: string;
                    } 
                };

                const organizationId = subscription.payer?.organization_id;
                if(!organizationId) {
                    return new Response("Missing Organization ID", { status: 400 });
                };

                const newMaxAllowedMembership = subscription.status === "active" ? 5 : 1; 

                await clerkClient.organizations.updateOrganization(organizationId, {
                    maxAllowedMemberships: newMaxAllowedMembership
                });

                await ctx.runMutation(internal.system.subscriptions.upsert, {
                    organizationId, 
                    status: subscription.status
                })
                 break; 
            }

            default: 
                console.log("Ignored Clerk Webhook event", event.type);
        }

        //ALWAYS return something from end of webhook otherwise considered failure 
        return new Response(null, { status: 200 });
    }),
});

/**
 * 
 * Who ever is trying to access this clerk wehbook endpoint is authorized to access it. 
 * Only thing that can access it is clerk itself. 
 * We have to make sure that their headers match exactly what needs to be decrypted 
 * when decrypted with our CLERK_WEBHOOK_SECRET. 
 */
async function validateRequest(req: Request): Promise<WebhookEvent| null> {

    const payloadString = await req.text(); 
    const svixHeaders = {
        "svix-id": req.headers.get("svix-id") || "", 
        "svix-timestamp": req.headers.get("svix-timestamp") || "", 
        "svix-signature": req.headers.get("svix-signature") || ""
    }

    const wehbook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || ""); 

    try {
        return wehbook.verify(payloadString, svixHeaders) as unknown as WebhookEvent
    } catch (error) {
        console.error(`Error verifying webhook event`, error)
        return null;
    }
}

export default http;