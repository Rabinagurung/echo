"use client";

import { useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetScreen } from "@/modules/widget/types";
import WidgetAuthScreen from "@/modules/widget/ui/screens/widget-auth-screen";
import WidgetChatScreen from "@/modules/widget/ui/screens/widget-chat-screen";
import WidgetContactScreen from "@/modules/widget/ui/screens/widget-contact-screen";
import WidgetErrorScreen from "@/modules/widget/ui/screens/widget-error-screen";
import WidgetInboxScreen from "@/modules/widget/ui/screens/widget-inbox-screen";
import WidgetLoadingScreen from "@/modules/widget/ui/screens/widget-loading-screen";
import WidgetSelectionScreen from "@/modules/widget/ui/screens/widget-selection-screen";
import WidgetVoiceScreen from "@/modules/widget/ui/screens/widget-voice-screen";

const DEFAULT_PRIMARY_COLOR = "#3b82f6";

function resolvePrimaryColor(value: string | null) {
  if (!value) return DEFAULT_PRIMARY_COLOR;

  if (typeof CSS === "undefined" || !CSS.supports("color", value)) {
    return DEFAULT_PRIMARY_COLOR;
  }

  return value;
}

export default function WidgetPageClient() {
  const searchParams = useSearchParams();
  const screen = useAtomValue(screenAtom);

  const organizationId = searchParams.get("organizationId");
  const primaryColor = resolvePrimaryColor(searchParams.get("primaryColor"));

  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      "--echo-primary-color",
      primaryColor,
    );
  }, [primaryColor]);

  const screenComponents: Record<WidgetScreen, React.ReactNode> = {
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    error: <WidgetErrorScreen />,
    auth: <WidgetAuthScreen />,
    selection: <WidgetSelectionScreen />,
    inbox: <WidgetInboxScreen />,
    chat: <WidgetChatScreen />,
    voice: <WidgetVoiceScreen />,
    contact: <WidgetContactScreen />,
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
}
