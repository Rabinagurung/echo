import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { assert } from "convex-helpers";
import type { StorageActionWriter } from "convex/server";
import { Id } from "../_generated/dataModel.js";

export type ExtractTextContentArgs = {
    storageId: Id<"_storage">, 
    filename: string,
    bytes?: ArrayBuffer, 
    mimeType: string,
}

const AI_MODELS = {
  image: google.chat("gemini-1.5-flash-latest"),
  // PDF prompt: converting structured documents into text
  pdf:   google.chat("gemini-1.5-pro-latest"),
  // HTML prompt: transform content → markdown (fast, lightweight)
  html:  google.chat("gemini-1.5-flash-latest"),
} as const; //Explain why const is used

const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg", 
    "image/png", 
    "image/webp", 
    "image/gif"
] as const; // Explain why const is used

// Telling AI model what to if it receives image, pdf or html.
const SYSYTEM_PROMPTS = {
    image: "You turn images into text. If it is a photo of document, transcribe it. If it is not document, describe it.",
    pdf: "You transform PDF files into text",
    html: "You transform content into markdown"
}

export async function extractTextContent(
    ctx: { storage: StorageActionWriter}, 
    args: ExtractTextContentArgs
): Promise<string> {
    
    const { storageId, filename, bytes, mimeType} = args;
    //File was stored in file storage and convex gives us easy way to turn that storageId into acutal url which we can access.
    const url = await ctx.storage.getUrl(storageId); 
    assert(url, "Failed to get storage URL"); //url can be undefined | null, so assert from convex-helpers is used

    if(SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
        return extractImageText(url);
    }

    if(mimeType.toLowerCase().includes("pdf")) {
        return extractPdfText(url, mimeType, filename);
    }

    if(mimeType.toLowerCase().includes("text")) {
        return extractTextFileContent(ctx, storageId, bytes, mimeType)
    }

    throw new Error(`Unsupported MIME type: ${mimeType}`);
    
}


// User uploads an image, we can transcribe or describe the transcript
async function extractImageText(url: string): Promise<string> {
   const result = await generateText({
        model: AI_MODELS.image, 
        system: SYSYTEM_PROMPTS.image, 
        messages: [{ 
                role: "user",
                content: [{ type: "image", image: new URL(url) }]
            }
        ]
   })

   return result.text;
}


async function extractPdfText(
    url: string, 
    mimeType: string, 
    filename: string
): Promise<string> {

    // Added further instructions to make embeddings clear
    const result = await generateText({
        model: AI_MODELS.pdf, 
        system: SYSYTEM_PROMPTS.pdf,
        messages: [
            {
                role: "user", 
                content: [
                    { type: "file", data: new URL(url), mimeType, filename }, 
                    { 
                        type: "text", 
                        text: "Extract the text from PDF and print it without explaning you'll do so." 
                    }
                ]
            }
        ]
    })
    
    return result.text;
}


async function extractTextFileContent(
    ctx: { storage: StorageActionWriter }, 
    storageId: Id<"_storage">,
    bytes: ArrayBuffer | undefined, 
    mimeType: string
 ):Promise<string> {

    // Getting arrayBuffer if we got it through file upload or grabbing storage file and running arrayBuffer() on it.
    const arrayBuffer = bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

    if(!arrayBuffer) {
        throw new Error("Failed to get file content");
    }

    // Text files are very simple, we can get it by textdecoder and arrayBuffer.
    // But if we received something that is text file but not as simple as text/plain like markdown or html files. 
    // So, in that case, generateText should be called. To save money we should use AI less so we are saving.
    const text = new TextDecoder().decode(arrayBuffer) //textdecoder will decode plain text from arrayBuffer

    if(mimeType.toLowerCase() !== "text/plain") {
        const result = await generateText({
            model: AI_MODELS.html, 
            system: SYSYTEM_PROMPTS.html, 
            messages: [
                {
                    role: "user", 
                    content: [
                        {type: "text", text}, 
                        {type: "text", text: "Extract the text and print it in a markdown format without explaining that you'll do so."}
                    ]
                }
            ]
        })

        console.log(result.text);

        return result.text;
    }
    
    return text;
}