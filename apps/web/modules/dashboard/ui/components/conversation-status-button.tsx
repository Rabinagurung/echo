import { Doc } from '@workspace/backend/_generated/dataModel';
import React from 'react';
import { Hint } from "@workspace/ui/components/hint";
import { Button } from '@workspace/ui/components/button';
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from 'lucide-react';



interface ConversationStatusProps{
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled?: boolean;
}

const ConversationStatusButton = ({ status, onClick, disabled}:ConversationStatusProps) => {

  if(status === "resolved") {
    return (
      <Hint text='Mark as unresolved'>
        <Button disabled={disabled} onClick={onClick} size="sm" variant="tertiary">
          <CheckIcon/>
          Resolved
        </Button>
      </Hint>
    )
  }


  if(status === "escalated") {
    return (
      <Hint text='Mark as resolved'>
        <Button disabled={disabled} onClick={onClick} size="sm" variant="warning">
          <ArrowUpIcon/>
          Escalated
        </Button>
      </Hint>
    )
  }

  return (
   <Hint text="Mark as escalated">
      <Button disabled={disabled} onClick={onClick} size="sm" variant="destructive">
        <ArrowRightIcon />
        Unresolved
      </Button>
    </Hint>
  )

}

export default ConversationStatusButton