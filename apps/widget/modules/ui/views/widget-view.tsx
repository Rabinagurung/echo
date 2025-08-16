import React from 'react'
import WidgetFooter from '../components/widget-footer'
import WidgetHeader from '../components/widget-header'

interface Props {
    organizationId: string
}


const WidgetView = ({organizationId}: Props) => {

    //Todo: min-h-screen min-w-screen not sure about why widgetView didnt take full screen space
  return (
    <main className='flex min-h-screen min-w-screen flex-col w-full h-full  overflow-hidden rounded-xl border bg-muted'>
        <WidgetHeader className='flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold'>
            <p className='text-3xl'>Hi there! 👋</p>
            <p className='text-lg'>How can we help you today?</p>
        </WidgetHeader>
        <div className="flex flex-1">
        Widget View---- 
        OrganizationId: {organizationId}
        </div>
        <WidgetFooter/>
    </main>
  )
}

export default WidgetView