import { SignIn } from '@clerk/nextjs'
import React from 'react'
import GuestSignInButton from '../components/GuestSignInButton'

export default function SignInView() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SignIn routing="hash"/>
      <GuestSignInButton/>
    </div>
  )
}

