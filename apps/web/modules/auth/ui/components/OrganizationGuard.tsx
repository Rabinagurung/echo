"use client"

import {  useOrganization } from '@clerk/nextjs'
import React from 'react'
import AuthLayout from '../layout/AuthLayout'
import OrgSelectionView from '../views/OrgSelectionView'

const OrganizationGuard = ({children}: {children: React.ReactNode}) => {
  const {organization} = useOrganization(); 
  if(!organization) return (<AuthLayout>
    <OrgSelectionView/>
  </AuthLayout>)
  return (

    <>{children}</>
  )
}

export default OrganizationGuard;