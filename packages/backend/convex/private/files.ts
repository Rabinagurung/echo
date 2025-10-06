import {  ConvexError, v } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import { checkUserIdentityAndGetOrgId } from "./checkUserIdentityAndGetOrgId";
import { contentHashFromArrayBuffer, Entry, EntryId, guessMimeTypeFromContents, guessMimeTypeFromExtension, vEntryId } from "@convex-dev/rag";
import rag from "../system/ai/rag";
import { extractTextContent } from "../lib/extractTextContent";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";


const guessMimeType = (filename: string, bytes: ArrayBuffer): string =>{
    return ( 
        guessMimeTypeFromExtension(filename) ||
        guessMimeTypeFromContents(bytes) || 
       "application/octet-stream" 
    )
}

/**
 * Action: addFile
 *
 * Uploads a file to Convex storage, extracts its text, and creates a corresponding
 * embedding entry in the RAG (Retrieval-Augmented Generation) system for the
 * authenticated organization.
 *
 * ### Access Control
 * - Only logged-in users associated with an organization (`orgId`) can create embeddings.
 * - The `namespace` is always set to the caller’s `orgId`. This prevents embeddings from
 *   being created in a global or cross-organization scope.
 *
 * ### Process
 * - Validate user identity and resolve the caller’s `orgId`.
 * - Store the file in Convex storage.
 * - Extract text content from the uploaded file (used for embeddings).
 * - Create a new RAG entry with metadata and a content hash.
 * - If the content already exists for the given key, skip embedding creation
 *   and delete the redundant stored file.
 *
 * ### Metadata
 * - `storageId`: Links the embedding back to the original file in storage.
 * - `uploadedBy`: Identifies which organization uploaded the file.
 * - `filename` and `category`: Used for labeling and categorization.
 * - `contentHash`: Prevents duplicate processing of unchanged content.
 *
 * @function addFile
 * @param {Object} args - Arguments for the action.
 * @param {string} args.filename - The original name of the uploaded file.
 * @param {string} args.mimeType - The MIME type of the file. If not provided, guessed from filename/bytes.
 * @param {ArrayBuffer} args.bytes - The file content as raw bytes.
 * @param {string} [args.category] - Optional category label for organizational grouping.
 * @returns {Promise<{url: string, entryId: string}>}
 * - `url`: A temporary URL to access the stored file.
 * - `entryId`: The unique identifier of the embedding entry in the RAG system.
 * @throws {ConvexError} If the user is unauthorized or file handling fails.
 */
export const addFile = action({
    args: {
        filename: v.string(), 
        mimeType: v.string(), 
        bytes: v.bytes(), 
        category: v.optional(v.string())
    }, 

    handler: async (ctx, args) =>{

        console.log("add RAG FILE");

        // Verify identity and get the organization ID
        const orgId = await checkUserIdentityAndGetOrgId(ctx); 

        const {filename, bytes, category} = args;
        const mimeType = args.mimeType || guessMimeType(filename, bytes)
        console.log({mimeType})

        const blob = new Blob([bytes], {type: mimeType}); 

        // Upload the file to Convex storage
        const storageId = await ctx.storage.store(blob);

        // Extract text content for embedding
        const text = await extractTextContent(ctx, {
            storageId,
            filename, 
            bytes, 
            mimeType
        });

        // Add entry to RAG with metadata and deduplication check
        const {entryId, created} = await rag.add(ctx, {
            namespace: orgId, 
            text, 
            key: filename, 
            title: filename, 
            metadata: {
                storageId,
                uploadedBy: orgId, 
                filename, 
                category:category ?? null
            } as EntryMetadata, 
            //to avoid re-inserting if the file content hasnt changed
            contentHash: await contentHashFromArrayBuffer(bytes)
        })

        // Handle duplicate entry
        if(!created) {
            console.debug("Entry already exists, skipping upload metadata"); 
            await ctx.storage.delete(storageId);
        }

        const url = await ctx.storage.getUrl(storageId);

        console.log({url});
        console.log({entryId});

        return {
            url: await ctx.storage.getUrl(storageId), 
            entryId
        };
    }
});


/**
 * Mutation: deleteFile
 *
 * Deletes an embedding entry and its associated storage file for a given organization.
 *
 * ### Access Control
 * - Only users associated with the organization that owns the embedding (via `orgId`) are authorized.
 * - Unauthorized users attempting to delete entries outside their namespace will receive an `UNAUTHORIZED` error.
 *
 * ### Steps
 * 1. Validate the user identity and retrieve their `orgId`.
 * 2. Verify the namespace exists for the given `orgId`.
 * 3. Fetch the entry (embedding) by its `entryId`.
 * 4. Confirm the entry exists and was uploaded by the same organization.
 * 5. Delete any associated file from storage (if present).
 * 6. Delete the embedding asynchronously using `rag.deleteAsync`.
 *
 * @function deleteFile
 * @param {Object} args - Arguments for the mutation.
 * @param {string} args.entryId - The unique ID of the embedding entry to be deleted.
 * @throws {ConvexError} `UNAUTHORIZED` if the namespace or organization ID is invalid.
 * @throws {ConvexError} `NOT_FOUND` if the entry does not exist.
 * @returns {Promise<void>} Resolves when deletion is complete.
 */
export const deleteFile = mutation({
    args: {
        entryId: vEntryId
    }, 
    handler: async (ctx, args) => {

        // Verify user identity and get the organization ID
        const orgId = await checkUserIdentityAndGetOrgId(ctx);

        // Ensure the namespace exists for this organization
        const namespace = await rag.getNamespace(ctx, {namespace: orgId}); 

        if(!namespace) {
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Invalid namespace"
            })
        }

        // Retrieve the entry (embedding) by ID
        const entry = await rag.getEntry(ctx, { entryId: args.entryId});

        if(!entry) {
            throw new ConvexError({
                code: "NOT_FOUND", 
                message: "Entry not found"
            })
        }

       // Final verification: ensure entry was uploaded by this org
       if(entry.metadata?.uploadedBy !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED", 
                message: "Invalid organizaton ID"
            })
       }

        // Delete associated file from storage
       if(entry.metadata?.storageId) {
            await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
       }

        // Delete the embedding itself
       await rag.deleteAsync(ctx, {entryId: args.entryId})
        
    }
});


/**
* List embedding files for the current organization. Uses the org's namespace
* and returns files in a readable {@link PublicFile} format.
*
* Steps:
* - Finds the caller's organization ID.
* - Gets the org's namespace.
* - Fetches entries from RAG with pagination.
* - Converts each entry into {@link PublicFile}.
* - Optionally filters by category.
*
* @param args.category Optional category to filter results.
* @param args.paginationOpts Options for pagination (limit, cursor).
* @returns List of {@link PublicFile}, plus pagination info.
*/
export const list = query({
    args: {
        category: v.optional(v.string()), 
        paginationOpts: paginationOptsValidator
    }, 

    handler: async(ctx, args) =>{
        const orgId = await checkUserIdentityAndGetOrgId(ctx);

        const namespace = await rag.getNamespace(ctx, { namespace: orgId})

        if(!namespace) {
            return { page: [], isDone: true, continueCursor: "" };
        }

        const results = await rag.list(ctx, { 
            namespaceId: namespace.namespaceId,
            paginationOpts: args.paginationOpts
        });

console.log("api")
console.log({results}); 

/* 
        
*/

       
        const files = await Promise.all(
            results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
        ); 

console.log({files});

        const filteredFiles = args.category ? files.filter((file) => file.category === args.category ) : files;



console.log({filteredFiles});
console.log("api end")

        return { 
            page: filteredFiles, 
            isDone: results.isDone, 
            continueCursor: results.continueCursor 
        };

    }
});


/**
 * Public format of an embedding file.
 */
export type PublicFile = {
  id: EntryId;                  // Unique entry ID.
  name: string;                 // File name with extension.
  type: string;                 // File type (extension).
  size: string;                 // File size in readable form (e.g., "10.2 MB").
  status: "ready" | "processing" | "error"; // File status.
  url: string | null;           // URL to access file, or null if not available.
  category?: string;            // Optional category.
};

/**
 * Metadata stored with each entry.
 */
export type EntryMetadata = {
  storageId: Id<"_storage">;    // Storage ID of the file.
  uploadedBy: string;           // Uploader identifier.
  filename: string;             // Original filename.
  category: string | null;      // Optional category.
};


/**
* Convert a raw entry into {@link PublicFile}.
*
* Adds readable size, extension, simplified status, and file URL.
*
* @param ctx Query context.
* @param entry Raw entry.
* @returns {@link PublicFile}
*/
async function convertEntryToPublicFile(
    ctx: QueryCtx, 
    entry: Entry
):Promise<PublicFile>{

    const metadata = entry.metadata as EntryMetadata | undefined;
    const strorageId = metadata?.storageId;

    let filesize = "unknown"; 
    if(strorageId) {
        try {
            const storageMetadata = await ctx.db.system.get(strorageId);
            if(storageMetadata) {
                filesize = formatFileSize(storageMetadata.size);
            }

        } catch (error) {
            console.error("Failed to get storage metadata: ", error)
            
        }
    };

    const filename = entry.key || "Unknown";
    const extension = filename.split(".").pop()?.toLowerCase() || "txt";

    let status: "ready" | "processing" | "error" = "error";

    if(entry.status === "ready") {
        status = "ready"
    } else if(entry.status === "pending") {
        status = "processing"
    };

    const url = strorageId ? await ctx.storage.getUrl(strorageId): null;

     return {
        id: entry.entryId,
        name: filename,
        type: extension,
        size: filesize, 
        status, 
        url,
        category: metadata?.category || undefined
    };                                          

};


/**
* Format a number of bytes into a simple string.
*
* Supports: B, KB, MB, GB.
*
* @param bytes Number of bytes.
* @returns Formatted size string.
*/
function formatFileSize(bytes:number):string {
    if(bytes === 0) {
        return "0 B";
    }

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes)/Math.log(k));

    return `${Number.parseFloat((bytes/k ** i).toFixed(1))} ${sizes[i]}`;
};