"use client"


import WidgetView from "@/modules/ui/views/widget-view"

import { use } from "react"

interface Props {
  searchParams: Promise<{organizationId: string}>
}


export default function Page({searchParams}: Props) {

  const {organizationId} = use(searchParams)

  return (
    <WidgetView organizationId={organizationId}></WidgetView>
  )
}
