import { Button } from '@workspace/ui/components/button'
import {cn} from "@workspace/ui/lib/utils"
import { HomeIcon, InboxIcon } from 'lucide-react'
import React from 'react'

const WidgetFooter = () => {
    const screen = "selection"
  return (
    <footer className="flex items-center justify-center border-t bg-background">
        <Button className="h-14 flex-1 rounded-none" size="icon" variant="ghost" onClick={()=>{}}>
            <HomeIcon className={cn("size-5", screen === "selection" && "text-primary")}/>
        </Button>
        <Button className="h-14 flex-1 rounded-none" size="icon" variant="ghost" onClick={()=>{}}>
            <InboxIcon className={cn("size-5")}/>
        </Button>
    </footer>
  )
}

export default WidgetFooter