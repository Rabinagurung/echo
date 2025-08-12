"use client"

import { api } from "@workspace/backend/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { useMutation, useQuery } from "convex/react"



export default function Page() {

  const users = useQuery(api.users.getMany)
  const onAddClick = useMutation(api.users.add)

  return (
      <div className="flex flex-col items-center justify-center min-h-svh">
        <p>Hello App/Wdiget</p>
        <Button onClick={() => onAddClick()}>Add</Button>
        <div className="max-w-sm">
          {JSON.stringify(users, null, 2)}
        </div>
      </div>
  )
}
