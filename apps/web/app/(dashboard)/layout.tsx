import DashBoardLayout from '@/modules/dashboard/ui/layout/dashboard-layout'


const Layout = ({children}: {children: React.ReactNode}) => {

  return (
  <DashBoardLayout>{children}</DashBoardLayout>
)
}

export default Layout