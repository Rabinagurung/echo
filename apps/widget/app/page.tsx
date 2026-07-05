import { Suspense } from "react";
import WidgetPageClient from "@/modules/widget/ui/views/widget-page-client";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WidgetPageClient />
    </Suspense>
  );
}
