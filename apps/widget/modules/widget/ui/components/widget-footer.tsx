import { Button } from '@workspace/ui/components/button'
import {cn} from "@workspace/ui/lib/utils"
import { useAtomValue, useSetAtom } from 'jotai'
import { HomeIcon, InboxIcon } from 'lucide-react'
import React from 'react'
import { screenAtom } from '../../atoms/widget-atoms'

const WidgetFooter = () => {
    const screen = useAtomValue(screenAtom)
    const setScreen = useSetAtom(screenAtom)
  return (
    <footer className="flex items-center justify-center border-t bg-background">
        <Button className="h-14 flex-1 rounded-none" size="icon" variant="ghost" onClick={()=>{}}>
            <HomeIcon className={cn("size-5", screen === "selection" && "text-primary")}/>
        </Button>
        <Button className="h-14 flex-1 rounded-none" size="icon" variant="ghost" onClick={()=> setScreen("inbox")}>
            <InboxIcon className={cn("size-5",  screen === "inbox" && "text-primary")}/>
        </Button>
    </footer>
  )
}

export default WidgetFooter