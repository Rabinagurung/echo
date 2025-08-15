"use client"


import { useVapi } from "@/modules/hooks/use-vapi"
import { Button } from "@workspace/ui/components/button"



export default function Page() {

  
  const {isSpeaking, isConnected, isConnecting, transcript, startCall, endCall, } = useVapi();

  return (
      <div className="flex flex-col items-center justify-center min-h-svh max-w-md mx-auto w-full">
        <p>Hello App/Wdiget</p>
        <Button onClick={() => startCall()}>Start call</Button>
        <Button onClick={() => endCall()} variant="destructive">End Call</Button>
       
        <p>isConnected: {`${isConnected}`}</p>
        <p>isConnecting: {`${isConnecting}`}</p>
        <p>isSpeaking: {`${isSpeaking}`}</p>
        <p>transcript: {JSON.stringify(transcript, null, 2)}</p>
      </div>
  )
}
