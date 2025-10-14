"use client"

import {  LoaderIcon } from "lucide-react";
import WidgetHeader from "../components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { useEffect, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";



type InitStep = "org" | "session" | "settings" | "vapi" | "done";

const WidgetLoadingScreen = ({organizationId}: {organizationId: string| null}) => {
    const [step, setStep] = useState<InitStep>("org")
    const [sessionValid, setSessionValid] = useState(false);

    const loadingMessage = useAtomValue(loadingMessageAtom);
    const  setOrganizationId= useSetAtom(organizationIdAtom);
    const  setScreen= useSetAtom(screenAtom); 
    const setErrorMessage = useSetAtom(errorMessageAtom);
    const setLoadingMessage = useSetAtom(loadingMessageAtom);

    console.log({loadingMessage})

    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))

    console.log({contactSessionId});

    const validateOrganizationId = useAction(api.public.organizations.validate)
    
    useEffect(() => {
       
        if(step !== "org") return;
        console.log("1st use effect")
        setLoadingMessage("Finding organization..."); 

        if(!organizationId) {
            setErrorMessage("organizationId is required");
            setScreen("error") 
            return ;
        }

        setLoadingMessage("Verifying organization..."); 

        validateOrganizationId({organizationId})
            .then((result) => {
                if(!result.valid) {
                    setErrorMessage(result.reason || "Invalid configuration")
                    setScreen("error")
                }

                console.log({result})

                setOrganizationId(organizationId);
                setStep("session")
            })
            .catch(()=>{
                setErrorMessage("Unable to verify organization")
                setScreen("error")
            })

    }, [
        step,
        setLoadingMessage,
        organizationId, 
        setErrorMessage, 
        setScreen, 
        validateOrganizationId, 
        setOrganizationId, 
        setStep
    ])


    //Validate contact session if exists 
    const validateContactSession = useMutation(api.public.contactSessions.validate)
    useEffect(()=>{

        
        if(step !== "session") return;
        console.log("2nd use effect")

        setLoadingMessage("Loading contact session Id")

        if(!contactSessionId) {
            setSessionValid(false)
            setStep("done")
            return  
        }
         
        setLoadingMessage("Verifying contact session Id")

        validateContactSession({contactSessionId})
        .then((result) => {
            setSessionValid(result.valid)
            setStep("done")
        })
        .catch(()=>{
            setSessionValid(false);
            setStep("done")
        })
        
    }, [
        step,
        setLoadingMessage,
        contactSessionId,
        organizationId, 
        setErrorMessage, 
        setScreen, 
        validateOrganizationId, 
        setStep,
        setSessionValid
    ])
    

    useEffect(()=>{
        if(step !== "done") return;
         console.log("3rd use effect")

        const hasValidSession = contactSessionId && sessionValid;
        
        setScreen(hasValidSession ? "selection" : "auth")
    }, [contactSessionId, sessionValid, setScreen, step])


return (
    <>
    <WidgetHeader className='flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold'>
        <p className='text-3xl'>Hi there! 👋</p>
        <p className='text-lg'>Let's get you started</p>
    </WidgetHeader>
    <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading...."}</p>
    </div>
    </>
    )
}

export default WidgetLoadingScreen;