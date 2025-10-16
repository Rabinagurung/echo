import { ConvexError } from "convex/values";
import {  internal } from "../_generated/api";
import { action } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";
import { getSecretValue, parseSecretString } from "../lib/secrets";
import { Vapi, VapiClient } from "@vapi-ai/server-sdk";


export const getPhoneNumbers = action({
    args: {}, 
    handler: async(ctx): Promise<Vapi.PhoneNumbersListResponseItem[]> => {
        const orgId = await checkUserIdentityAndGetOrgId(ctx); 

        const plugin = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService, 
            {
                organizationId: orgId, 
                service: "vapi"
            }
        );

        if(!plugin) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found",
            })
        }

        const secretName = plugin.secretName; 
        const secretValue = await getSecretValue(secretName); 
        const secretData = parseSecretString<{
            publicApiKey: string;
            privateApiKey: string
        }>(secretValue); 

        if(!secretData) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials not found",
            });
        }

        if(!secretData.privateApiKey || !secretData.publicApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials incomplete. Please reconnect your Vapi account.",
            });
        }



        /**
         * This is what we will do to get vapiClient,
         * const vapiClient = new VapiClient({
            token: process.env.VAPI_SECRET_KEY || ""
            })
        * but we want to whitelabel VAPI key for out customers so we will use secretData.privateApiKey given by out customers
        */
        const vapiClient = new VapiClient({
            token: secretData.privateApiKey
        });

        const phoneNumbers = await vapiClient.phoneNumbers.list();
        return phoneNumbers;
    }
})



export const getAssistants = action({
    args: {}, 
    handler: async (ctx): Promise<Vapi.Assistant[]> => {

        const orgId = await checkUserIdentityAndGetOrgId(ctx); 

        const plugin = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService, 
            {
                organizationId: orgId, 
                service: "vapi"
            }
        );


        if(!plugin) {
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Plugin not found",
            })
        };


        const secretName = plugin.secretName;
        const secretValue = await getSecretValue(secretName); 
        const secretData = parseSecretString<{
            publicApiKey: string;
            privateApiKey:string
        }>(secretValue);

        if(!secretData) {
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Credentials not found",
            })
        }

        if(!secretData.privateApiKey || !secretData.publicApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Credentials incomplete. Please reconnect your Vapi account.",
            })
        }

        const vapiClient = new VapiClient({
            token: secretData.privateApiKey
        });

        const assistants = await vapiClient.assistants.list();
        return assistants;
    }
})