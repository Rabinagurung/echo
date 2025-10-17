"use client"; 

import { useAtomValue } from 'jotai'
import { screenAtom } from '@/modules/widget/atoms/widget-atoms'
import WidgetAuthScreen from '@/modules/widget/ui/screens/widget-auth-screen';
import { WidgetScreen } from '@/modules/widget/types';
import WidgetErrorScreen from '@/modules/widget/ui/screens/widget-error-screen';
import WidgetLoadingScreen from '@/modules/widget/ui/screens/widget-loading-screen';
import WidgetSelectionScreen from '@/modules/widget/ui/screens/widget-selection-screen';
import WidgetChatScreen from '@/modules/widget/ui/screens/widget-chat-screen';
import WidgetInboxScreen from '../screens/widget-inbox-screen';
import WidgetVoiceScreen from '../screens/widget-voice-screen';
import WidgetContactScreen from '../screens/widget-contact-screen';

interface Props {
    organizationId: string | null
}

const WidgetView = ({organizationId}: Props) => {
  console.log({organizationId})


  const screen = useAtomValue(screenAtom); 

  const screenComponents:Record<WidgetScreen, React.ReactNode> = {
    loading: <WidgetLoadingScreen  organizationId={organizationId}/>, 
    error: <WidgetErrorScreen/>, 
    auth: <WidgetAuthScreen/>, 
    selection: <WidgetSelectionScreen/>, 
    inbox: <WidgetInboxScreen/>, 
    chat: <WidgetChatScreen/>, 
    voice: <WidgetVoiceScreen/>,
    contact: <WidgetContactScreen/>, 
  }

  return (
    <main className='flex flex-col w-full h-full overflow-hidden rounded-xl border bg-muted'>
      {screenComponents[screen]}
    </main>
  )
}

export default WidgetView