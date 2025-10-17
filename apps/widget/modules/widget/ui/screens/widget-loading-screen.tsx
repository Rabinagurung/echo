"use client"

import {  LoaderIcon } from "lucide-react";
import WidgetHeader from "../components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom, vapiSecretsAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";



type InitStep = "org" | "session" | "settings" | "vapi" | "done";

const WidgetLoadingScreen = ({organizationId}: {organizationId: string| null}) => {
    const [step, setStep] = useState<InitStep>("org")
    const [sessionValid, setSessionValid] = useState(false);

    const loadingMessage = useAtomValue(loadingMessageAtom);
    const  setOrganizationId = useSetAtom(organizationIdAtom);
    const  setWidgetSettings = useSetAtom(widgetSettingsAtom);
    const  setVapiSecrets = useSetAtom(vapiSecretsAtom);
    const  setScreen = useSetAtom(screenAtom); 
    const setErrorMessage = useSetAtom(errorMessageAtom);
    const setLoadingMessage = useSetAtom(loadingMessageAtom);

    console.log({loadingMessage})

    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""))

    console.log({contactSessionId});

    //step1: verify organization
    const validateOrganizationId = useAction(api.public.organizations.validate)

    useEffect(() => {
       
        if(step !== "org") return;
        console.log("1st use effect")
        setLoadingMessage("Finding organization..."); 

        if(!organizationId) {
            setErrorMessage("Organization ID is required");
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

    },  [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setOrganizationId,
    setStep,
    validateOrganizationId,
    setLoadingMessage
  ])


    //step 2: Validate contact session if exists 
    const validateContactSession = useMutation(api.public.contactSessions.validate)
    useEffect(()=>{

        if(step !== "session") return;
        console.log("2nd use effect")

        setLoadingMessage("Loading contact session Id")

        if(!contactSessionId) {
            setSessionValid(false)
            setStep("settings")
            return  
        }
         
        setLoadingMessage("Verifying contact session Id")

        validateContactSession({contactSessionId})
        .then((result) => {
            setSessionValid(result.valid)
            setStep("settings")
        })
        .catch(()=>{
            setSessionValid(false);
            setStep("settings")
        })
        
    }, [step, contactSessionId, validateContactSession, setLoadingMessage])

    

     //step3: load widget settings(optional)
    const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId, 
        organizationId ? { 
            organizationId
        } : "skip"
    ); 
   
    useEffect(()=>{
        if(step !== "settings") return;

        setLoadingMessage("Loading widget settings...")

        if(widgetSettings !== undefined) {
            setWidgetSettings(widgetSettings); 
            setStep("vapi");
        }
    },[step, widgetSettings, setWidgetSettings, setLoadingMessage]); 


    
    //step4: load vapiSecrets(optinal)
    const getVapiSecrets = useAction(api.public.secrets.getVapiSecrets);

    useEffect(()=>{
        if(step !== "vapi") return;
        if(!organizationId) {
            setErrorMessage("Organization ID is required");
            setScreen("error") 
            return ;
        }

        setLoadingMessage("Loading voice features...")
        getVapiSecrets({organizationId})
            .then((secrets) => {
                setVapiSecrets(secrets);
                setStep("done")
            })
            .catch(()=> {
                setVapiSecrets(null);
                setStep("done")
            })

    },[step, organizationId, getVapiSecrets, setVapiSecrets, setLoadingMessage, setStep])

 
    //step5: done
    useEffect(()=>{
        if(step !== "done") return;
        

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