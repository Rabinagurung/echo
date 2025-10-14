import { google } from "@ai-sdk/google";
import { createTool } from "@convex-dev/agent";
import { query } from "../../../_generated/server";
import z from "zod";
import { internal } from "../../../_generated/api";
import rag from "../rag";
import { generateText } from "ai";
 import { SEARCH_INTERPRETER_PROMPT } from "../constants";
import { supportAgent } from "../agents/supportAgent";


/**
 * Tool: Knowledge-base search + answer generation
 *
 * High-level flow:
 *  1) Accept a natural-language user query (e.g., "What is your most popular plan?")
 *  2) Look up the current conversation by `threadId` (provided on the tool `ctx`)
 *  3) Run a RAG search over the organization's knowledge base (namespace = organizationId)
 *  4) Standardize the matched entries into a single context text
 *  5) Ask an LLM to compose a helpful, accurate answer using that context
 *  6) Save the AI response back to the conversation as an assistant message
 *
 * Design notes:
 *  - This tool is an abstraction over an action runner; `ctx.db` is not exposed here
 *    (Gemini/OpenAI is a third-party service), so we use `ctx.runQuery` for internal queries.
 *  - We return user-friendly strings instead of throwing, since tools are invoked inside model runs.
 */
export const search = createTool({
    description: "Search the knowledge base for relevant information to help answer user questions",
    args: z.object({
        query: z.string().describe("The search query to find the relevant information")
    }), 

    handler: async(ctx, args) =>{
        if(!ctx.threadId) return "Missing thread ID";

        // Fetch the conversation by threadId (no direct DB here; use internal query)
        /**
         * We use an internal query (backend/convex/system/conversations.ts/getByThreadId).
         * Reason: `createTool` abstracts over an action and `ctx.db` is not available here
         * because LLM providers (Gemini/OpenAI) run outside our DB boundary.
         * We do not throw; we return a clear message for tool consumers (the model).
       */
        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId, 
            {threadId: ctx.threadId}
        )

        if(!conversation) return "Converstion not found"; 

        const orgId = conversation.organizationId; 

        // RAG search in org namespace
        const searchResult = await rag.search(ctx, {
            namespace: orgId, 
            query: args.query, 
            limit: 5
        })

        console.log({searchResult}); 
        
        console.log("Entries: ", searchResult.entries); 

        //Standardize results for the LLM 
        const contextText = `Found results in ${searchResult.entries
            .map((e) => e.title || null)
            .filter((t) => t !== null )
            .join(", ")}. Here is the context:\n\n${searchResult.text}`; 

        console.log({contextText}); 

        console.log("args.query: ", args.query)

        /*
        Ask the model to answer using the standardized context
        Explanation: 
        messages: [
            { role: 'system', content: 'Be a Python tutor. Keep answers <100 words.' },
            { role: 'user', content: 'What is list comprehension?' },
            { role: 'assistant', content: 'It is a compact way to build lists…' }, 
             // {role: 'assistant'} is prior model reply replayed back to the model as part of the conversation history
            { role: 'user', content: 'Show one example.' }
        ]   
        */
        const response = await generateText({
            messages: [
                {
                    role: "system", 
                    content: SEARCH_INTERPRETER_PROMPT
                }, 
                {
                    role: "user", 
                    content:  `User asked: "${args.query}"\n\nSearch results: ${contextText}`
                }
            ],
            model: google.chat("gemini-2.0-flash")
        });

     


        console.log(response.text);
        
       //save a message to the thread
        await supportAgent.saveMessage(ctx, {
            threadId: ctx.threadId, 
            message: {
                role: "assistant", 
                content: response.text
            }
        });
        
        console.log("response.text: ", response.text);

        return response.text;
    }
});