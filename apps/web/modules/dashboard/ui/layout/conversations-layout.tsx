"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@workspace/ui/components/resizable";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { usePathname } from "next/navigation";

import  ConversationsPanel  from "../components/conversations-panel";

import React from 'react'

const ConversationLayout = ({children}: {children: React.ReactNode}) => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isConversationSelected = pathname !== "/conversations";

  if (isMobile) {
    return (
      <div className="h-full w-full">
        {isConversationSelected ? children : <ConversationsPanel/>}
      </div>
    );
  }

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

export default ConversationLayout;