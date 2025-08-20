import {atom} from "jotai"; 
import { WidgetScreen } from "../types";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { Id } from "@workspace/backend/_generated/dataModel";
import { CONTACT_SESSION_KEY } from "../constants";


export const screenAtom = atom<WidgetScreen>("loading");
export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);


// organization scoped contact session Id atom
export const contactSessionIdAtomFamily = atomFamily((organizationId:string) => {
    return  atomWithStorage<Id<"contactSessions"> | null>(`${CONTACT_SESSION_KEY}_${organizationId}`, null)
})

export const organizationIdAtom = atom<string| null>(null);
export const conversationIdAtom = atom<Id<"conversations"> | null>(null);



