import AuthGuard from '@/modules/auth/ui/components/AuthGuard'
import OrgSelectionGuard from '@/modules/auth/ui/components/OrganizationGuard'
import React from 'react'

const Layout = ({children}: {children: React.ReactNode}) => {


  return (
   
    <AuthGuard>
        <OrgSelectionGuard>
            {children}
        </OrgSelectionGuard>
    </AuthGuard>
  )
}

export default Layout