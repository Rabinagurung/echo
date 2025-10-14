import {atom} from "jotai"; 
import { WidgetScreen } from "../types";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { Id } from "@workspace/backend/_generated/dataModel";
import { CONTACT_SESSION_KEY } from "../constants";


/**
 * Current widget screen route.
 *
 * @default "loading"
 * @remarks
 * - Drives client-side screen flow (e.g., "error" | "loading" | "auth" | "selection" | "voice" | "inbox" | "chat" | "contact").
 */
export const screenAtom = atom<WidgetScreen>("loading");

/**
 * Global error message string for transient, user-visible errors.
 * 
 *  * @remarks
 * - Useful for showing a banner/toast to render.
 */
export const errorMessageAtom = atom<string | null>(null);

/**
 * Global loading message for long-running operations.
 *
 * @remarks
 * - Useful for showing a consistent loading status component.
 */
export const loadingMessageAtom = atom<string | null>(null);


/**
 * Organization-scoped contactSessionId persisted to local storage.
 *
 * @param organizationId - The current organization ID to scope the storage key.
 * @returns An atom storing `Id<"contactSessions"> | null`. 
 *
 * @example
 * // Example localStorage entry (from DevTools → Application → Local Storage):
 * // Key:
 * //   echo_contact_session_org_33klmailZVlrU... 
 * // Value:
 * //   "jn70yradvkq6ydp1"
 *
 * @remarks
 * - Uses `atomWithStorage` so values persist across page reloads.
 * - Storage key format: `${CONTACT_SESSION_KEY}_${organizationId}`.
 * - Initial value (contactSessionId )is null.
 * - Passing an empty string still scopes the key (but prefer real organization IDs).
 * - This ensures each organization maintains a distinct session namespace.
 */
export const contactSessionIdAtomFamily = atomFamily((organizationId:string) => {
    return  atomWithStorage<Id<"contactSessions"> | null>(`${CONTACT_SESSION_KEY}_${organizationId}`, null)
})


/**
 * The active organization id for this widget session.
 *
 * @remarks
 * - Set this before screens that depend on organization context.
 */
export const organizationIdAtom = atom<string | null>(null);


/**
 * The active conversation id (if/when a conversation exists).
 *
 * @remarks
 * - Set by flows that open or join a specific conversation thread.
 */
export const conversationIdAtom = atom<Id<"conversations"> | null>(null);
