"use client"

import * as React from "react"
import {  ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'


export function Providers({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

  return (
  <ConvexProviderWithClerk  client={convex} useAuth={useAuth}>
      {children}
  </ConvexProviderWithClerk>
  )
}
