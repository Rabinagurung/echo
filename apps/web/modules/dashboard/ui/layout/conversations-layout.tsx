import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";

import  ConversationsPanel  from "../components/conversations-panel";

import React from 'react'

const ConversationLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <ResizablePanelGroup className="h-full w-full" direction="horizontal">
        <ResizablePanel defaultSize={30} maxSize={30} minSize={20}>
            <ConversationsPanel/>
        </ResizablePanel>
        <ResizableHandle/>
        <ResizablePanel className="h-full" defaultSize={70}>{children}</ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default ConversationLayout