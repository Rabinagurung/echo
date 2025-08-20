"use client"

import * as React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Provider } from "jotai";


export function Providers({ children }: { children: React.ReactNode }) {

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

  return (
  <ConvexProvider client={convex}>
    <Provider>
      {children}
    </Provider>
  </ConvexProvider>
  )
}
