"use client"

import {  useMutation, useQuery} from "convex/react";
import {api} from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import {  CreateOrganization, OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Page() {

  const users = useQuery(api.users.getMany);
  const onAddClick = useMutation(api.users.add);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
       <UserButton/>
    <OrganizationSwitcher  hidePersonal/>
    <p>Web app </p>
    <Button onClick={()=>onAddClick()}>Add</Button>
    <div className="max-w-sm w-full mx-auto">{JSON.stringify(users, null, 2)}</div>
    </div>
  )
}
