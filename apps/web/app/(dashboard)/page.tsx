"use client"

import { Button } from "@workspace/ui/components/button";
import {  OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Page() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <UserButton/>
      <OrganizationSwitcher hidePersonal/>
      <p>Web app </p>
      <Button>Add</Button>
      <div className="max-w-sm w-full mx-auto"></div>
    </div>
  )
}
