import { ConvexError, v } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";
import { contentHashFromArrayBuffer, Entry, EntryId, guessMimeTypeFromContents, guessMimeTypeFromExtension, vEntryId } from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";


const guessMimeType = (filename: string, bytes: ArrayBuffer): string =>{
    return ( 
        guessMimeTypeFromExtension(filename) ||
        guessMimeTypeFromContents(bytes) || 
       "application/octet-stream" 
    )
}

export const addFile = action({
    args: {
        filename: v.string(), 
        mimeType: v.string(), 
        bytes: v.bytes(), 
        category: v.optional(v.string())
    }, 

    handler: async (ctx, args) =>{

        const orgId = await checkUserIdentityAndGetOrgId(ctx); 

        const {filename, bytes, category} = args;
        const mimeType = args.mimeType || guessMimeType(filename, bytes)

        const blob = new Blob([bytes], {type: mimeType}); 

        const storageId = await ctx.storage.store(blob);

        const text = await extractTextContent(ctx, {
            storageId,
            filename, 
            bytes, 
            mimeType
        });

        const {entryId, created} = await rag.add(ctx, {
            // SUPER IMPORTANT: What search space to add this to. You cannot search across namespaces,
            // If not added, it will be considered global (we do not want this)
            namespace: orgId, 
            text, 
            key: filename, 
            title:filename,
            metadata: {
                storageId, // Important for file deletion
                uploadedBy: orgId, //Important for file deletion 
                filename, 
                category:category ?? null
            }, 
            //to avoid re-inserting if the file content hasnt changed
            contentHash: await contentHashFromArrayBuffer(bytes)
        });

        if(!created) {
            console.log("entry already exits, skipping upload metadata")
            await ctx.storage.delete(storageId);
        }

        return {
            url: await ctx.storage.getUrl(storageId), 
            entryId
        }
    }
});






