"use client"

import { Authenticated, Unauthenticated, useMutation, useQuery} from "convex/react";
import {api} from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Page() {

  const users = useQuery(api.users.getMany);
  const onAddClick = useMutation(api.users.add)
  return (

    <>
    <Authenticated>
      <UserButton/>
      
    <div className="flex flex-col items-center justify-center min-h-svh">
    <p>Web app </p>
    <Button onClick={()=>onAddClick()}>Add</Button>
    <div className="max-w-sm w-full mx-auto">{JSON.stringify(users, null, 2)}</div>
    </div>
    </Authenticated>

    <Unauthenticated>
      <SignInButton/>
    </Unauthenticated>
    
    </>
   
  )
}
