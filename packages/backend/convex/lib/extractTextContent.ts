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
    "image/gif",
] as const;

const allowedTypes = [
    ...SUPPORTED_IMAGE_TYPES, 
    "application/pdf", 
    "text/plain", 
    "text/html", 
    "text/markdown"
] as const;


const SYSTEM_PROMPTS = {
  image: "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
  pdf: "You transform PDF files into text.",
  html: "You transform content into markdown."
};


/**
 * Extracts text content from an uploaded file by delegating to the appropriate extractor
 * based on its MIME type (image, PDF, or text).
 *
 * Behavior:
 * - Validates the MIME type against `allowedTypes`.
 * - Resolves a public URL for the file via Convex storage (`ctx.storage.getUrl`).
 * - Routes to:
 *   - `extractImageText` for supported image types,
 *   - `extractPdfText` for PDFs,
 *   - `extractTextFileContent` for plain text and other text-based files.
 * - Throws for unsupported or disallowed MIME types.
 *
 * Notes:
 * - Uses `assert` to guarantee a valid URL.
 * - Minimizes AI usage by calling it only when required.
 *
 * @param ctx - Convex context with `storage: StorageActionWriter`.
 * @param args - Object containing file metadata and data.
 * @param args.storageId - The Convex storage ID of the file.
 * @param args.filename - The original filename, used for logging and hints.
 * @param args.bytes - Optional raw file data as an `ArrayBuffer`.
 * @param args.mimeType - MIME type of the file, used to determine extraction strategy.
 *
 * @returns {Promise<string>} Extracted text content in plain text or Markdown.
 *
 * @throws {Error} If the MIME type is not allowed, the URL cannot be resolved,
 * or the file type is unsupported.
 */
export async function extractTextContent(
    ctx: { storage: StorageActionWriter}, 
    args: ExtractTextContentArgs
):Promise<string> {

    const {storageId, filename, bytes, mimeType} = args;

    if(!allowedTypes.some(type => mimeType.toLowerCase().startsWith(type))) {
        throw new Error(`MIME type not allowed: ${mimeType}`)
    }

   
    const url = await ctx.storage.getUrl(storageId);
    assert(url, "Failed to get storage URL");
    if(SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
        return extractImageText(url);
    }

    if(mimeType.toLowerCase().includes("pdf")) {
        return extractPdfText(url, mimeType, filename);
    }

    if(mimeType.toLowerCase().includes("text")){
        return extractTextFileContent(ctx, storageId, bytes, mimeType);
    }

    throw new Error(`Unsupported MIME type: ${mimeType}`);
    
}


/**
 * Extracts textual information from an image using a vision-capable AI model.
 *
 * Behavior:
 * - Sends the image URL to `generateText` with the vision model and system prompt.
 * - Returns the generated text, such as OCR-like transcription or descriptive content.
 *
 * @param url - Publicly accessible URL of the stored image.
 *
 * @returns {Promise<string>} Text extracted or generated from the image.
 *
 * @throws {Error} If the AI model call fails or produces invalid output.
 */
async function extractImageText(url: string): Promise<string> {
   const result = await generateText({
        model: AI_MODELS.image, 
        system: SYSTEM_PROMPTS.image, 
        messages: [
            { 
                role: "user",
                content: [{ type: "image", image: new URL(url) }]
            }
        ]
   })

    return result.text;
};



/**
 * Extracts text content from a PDF file using a PDF-aware AI model.
 *
 * Behavior:
 * - Sends the PDF URL, MIME type, and filename to `generateText` with the PDF model and system prompt.
 * - Instructs the model to output extracted text only (no explanations or commentary).
 * - Returns the plain text content for downstream use.
 *
 * @param url - Publicly accessible URL of the PDF file.
 * @param mimeType - The MIME type of the PDF file.
 * @param filename - The original filename, used for context and logging.
 *
 * @returns {Promise<string>} Extracted plain-text content of the PDF.
 *
 * @throws {Error} If the AI model call fails or produces invalid output.
 */
async function extractPdfText(
    url: string, 
    mimeType: string, 
    filename: string
): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.pdf, 
        system: SYSTEM_PROMPTS.pdf,
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
    }); 
    return result.text;
}; 



/**
 * Extracts and normalizes text content from a file stored in Convex or from an uploaded ArrayBuffer.
 *
 * Workflow:
 * 1. If `bytes` are provided, use them directly.
 * 2. If not, fetch the file from Convex storage using `storageId` and convert it to an ArrayBuffer.
 * 3. For MIME type `text/plain`, decode the content directly using `TextDecoder`.
 * 4. For other text-based formats (e.g., HTML, Markdown), call `generateText` with an AI model
 *    to extract the readable text in Markdown format.
 *
 * Design Notes:
 * - Falls back to AI-powered extraction only when necessary, to minimize cost.
 * - Ensures consistent return type (`string`) for downstream processing.
 * - Throws an error if the file content cannot be retrieved or decoded.
 *
 * @param ctx - Convex context containing `storage: StorageActionWriter`.
 * @param storageId - The unique Convex storage ID for the file (`_storage` collection).
 * @param bytes - Optional raw `ArrayBuffer` if the file is uploaded directly.
 * @param mimeType - The MIME type of the file, used to choose extraction strategy.
 *
 * @returns {Promise<string>} The extracted plain-text or Markdown-formatted content.
 *
 * @throws {Error} If the file content cannot be retrieved or decoded.
 *
 * @example
 * // Example: Extract plain text
 * const text = await extractTextFileContent(ctx, storageId, undefined, "text/plain");
 * console.log(text);
 *
 * @example
 * // Example: Extract from HTML file
 * const htmlText = await extractTextFileContent(ctx, storageId, undefined, "text/html");
 * console.log(htmlText); // Markdown-formatted output
 */
async function extractTextFileContent(
    ctx: { storage: StorageActionWriter }, 
    storageId: Id<"_storage">,
    bytes: ArrayBuffer | undefined, 
    mimeType: string
 ):Promise<string> {

    
    const arrayBuffer = bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

    if(!arrayBuffer) {
        throw new Error("Failed to get file content");
    }

    const text = new TextDecoder().decode(arrayBuffer)

    if(mimeType.toLowerCase() !== "text/plain") {
        const result = await generateText({
            model: AI_MODELS.html, 
            system: SYSTEM_PROMPTS.html, 
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