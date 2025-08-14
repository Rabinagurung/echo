import { SignIn } from '@clerk/nextjs'
import React from 'react'

export default function SignInView() {
  return <SignIn routing="hash"/>
}

