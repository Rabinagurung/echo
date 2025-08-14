"use client"

import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react'
import React from 'react'
import AuthLayout from '../layout/AuthLayout'
import SignInView from '../views/SignInView'

const AuthGuard = ({children}: {children: React.ReactNode}) => {
  return (
    <>
    <AuthLoading>
        <AuthLayout>
            <p>Loading....</p>
        </AuthLayout>
    </AuthLoading>
    <Authenticated>
        {children}
    </Authenticated>

<Unauthenticated>
        <AuthLayout>
        <SignInView/>
        </AuthLayout>
    </Unauthenticated>
    </>
  )
}

export default AuthGuard;