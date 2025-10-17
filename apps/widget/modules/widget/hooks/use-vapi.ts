import Vapi from "@vapi-ai/web";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { vapiSecretsAtom, widgetSettingsAtom } from "../atoms/widget-atoms";

interface TranscriptMessage {
    role: "user" | "assistant"; 
    text: string;
}


export const useVapi = () =>{

    const vapiSecrets = useAtomValue(vapiSecretsAtom); 
    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([])

    useEffect(()=>{
        //Only for testing the Vapi API, otherwise customer will provide their own API keys
        /*Each customer have to add their own API keys, allowing them to create agents, workflows, phone
        number on their own. This makes our app much more flexible. 
        For me, its great lesson for white labling other's API */

        if(!vapiSecrets) return;
        const vapiInstance = new Vapi(vapiSecrets.publicApiKey);

        setVapi(vapiInstance)
        vapiInstance.on("call-start", ()=>{
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([])
        })

        vapiInstance.on("call-end", ()=>{
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false)
        })

        vapiInstance.on("speech-start", ()=>{
            setIsSpeaking(true)
        })

        vapiInstance.on("speech-end", ()=>{
            setIsSpeaking(false)
        })

        vapiInstance.on("error", (error)=>{
            console.log(error, "VAPI_ERROR");
            setIsConnecting(false)
        })


        vapiInstance.on("message", (message)=>{
            if(message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [
                    ...prev, 
                    {
                    role: message.role === "user"? "user" : "assistant", 
                    text: message.transcript
                    }
                ]);
            }
        }); 

        return () =>{
            vapiInstance?.stop()
        }
    }, [])


    const startCall = () =>{
        if(!vapiSecrets || !widgetSettings?.vapiSettings?.assistantId) return;

        setIsConnecting(true); 

        if(vapi) {
             //Only for testing the Vapi API, otherwise customer will provide their own assistant IDS
            vapi.start(widgetSettings.vapiSettings.assistantId)
        }
    }

    const endCall = () =>{
        if(vapi) vapi.stop();
        
    }

    return {
        isSpeaking, 
        isConnecting, 
        isConnected, 
        transcript, 
        startCall, 
        endCall
    }

}