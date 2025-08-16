import React from 'react'
// import WidgetFooter from '../components/widget-footer'
import WidgetHeader from '../components/widget-header'
import WidgetAuthScreen from '../screens/widget-auth-screen'

interface Props {
    organizationId: string
}


const WidgetView = ({organizationId}: Props) => {

    //Todo: min-h-screen min-w-screen not sure about why widgetView didnt take full screen space
  return (
    <main className='flex min-h-screen min-w-screen flex-col w-full h-full  overflow-hidden rounded-xl border bg-muted'>
      
    <WidgetAuthScreen/>
        {/* <WidgetFooter/> */}
    </main>
  )
}

export default WidgetView