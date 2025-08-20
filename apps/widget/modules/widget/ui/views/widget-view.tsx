"use client"; 

import { useAtomValue } from 'jotai'
import { screenAtom } from '@/modules/widget/atoms/widget-atoms'
import WidgetAuthScreen from '@/modules/widget/ui/screens/widget-auth-screen';
import { WidgetScreen } from '@/modules/widget/types';
import WidgetErrorScreen from '@/modules/widget/ui/screens/widget-error-screen';
import WidgetLoadingScreen from '@/modules/widget/ui/screens/widget-loading-screen';


interface Props {
    organizationId: string | null
}

const WidgetView = ({organizationId}: Props) => {


  const screen = useAtomValue(screenAtom); 

  const screenComponents:Record<WidgetScreen, React.ReactNode> = {
    loading: <WidgetLoadingScreen  organizationId={organizationId}/>, 
    error: <WidgetErrorScreen/>, 
    auth: <WidgetAuthScreen/>, 
    selection: <p>Selection </p>, 
    inbox: <p>inbox</p>, 
    chat: <p>chat</p>, 
    voice: <p>voice</p>,
    contact: <p>contact</p>, 
  }

    //Todo: min-h-screen min-w-screen not sure about why widgetView didnt take full screen space
  return (
    <main className='flex flex-col w-full h-full min-h-screen min-w-screen  overflow-hidden rounded-xl border bg-muted'>
      
    {screenComponents[screen]}
        
    </main>
  )
}

export default WidgetView