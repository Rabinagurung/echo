import AuthGuard from '@/modules/auth/ui/components/AuthGuard'
import OrganizationGuard from '@/modules/auth/ui/components/OrganizationGuard'
import { SidebarProvider } from '@workspace/ui/components/sidebar'
import { cookies } from 'next/headers'
import React from 'react'
import DashboardSideBar from '../components/dashboard-sidebar'
import { Provider } from "jotai";

const DashBoardLayout = async({children}: {children: React.ReactNode}) => {

    const cookieStore = await cookies(); 

    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"; 

  return (
    <AuthGuard>
        <OrganizationGuard>
          <Provider>
            <SidebarProvider defaultOpen={defaultOpen}>
                <DashboardSideBar/>
                  <main className='flex flex-1 flex-col'>
                    {children}
                  </main>
            </SidebarProvider>
            </Provider>
        </OrganizationGuard>
    </AuthGuard>
  )
}

export default DashBoardLayout;