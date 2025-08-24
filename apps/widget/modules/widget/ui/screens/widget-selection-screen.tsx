"use client"

import {  ChevronRightIcon, MessageSquareText } from "lucide-react";
import WidgetHeader from "../components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import WidgetFooter from "../components/widget-footer";

const WidgetSelectionScreen = () =>{

    const setConversationId = useSetAtom(conversationIdAtom);
    const setErrorMessage = useSetAtom(errorMessageAtom)
    const setScreen = useSetAtom(screenAtom)
    
    
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));


    const createConversation = useMutation(api.public.conversations.create)
    const [isPending, setIsPending] = useState(false)

    const handleNewConversation = async() =>{
        if(!organizationId) {
            setScreen("error")
            setErrorMessage("Orgnaization Id is required");
            return
        }

        if(!contactSessionId) {
            setScreen("auth")
            return
        }

        setIsPending(true)
        try {
             const conversationId = await createConversation({organizationId, contactSessionId})
             setConversationId(conversationId);
             setScreen("chat")
        } catch (error) {
            setScreen("auth");
            
        }finally{
            setIsPending(false)
        }
       
    }

    return (
    <>
    <WidgetHeader className='flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold'>
            <p className='text-3xl'>Hi there! 👋</p>
            <p className='text-lg'>Let's get you started</p>
    </WidgetHeader>
    <div className="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
       <Button className="h-16 w-full justify-between" disabled={isPending} variant="outline" onClick={handleNewConversation}>
        <div className="flex items-center gap-x-2">
            <MessageSquareText className="size-4"/>
            <span>Start chat</span>
        </div>
        <ChevronRightIcon/>
       </Button>
    </div>
    <WidgetFooter/>
    </>
    )
}

export default WidgetSelectionScreen;