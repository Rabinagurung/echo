import { toast } from "sonner";
import { HTML_SCRIPT, IntegrationId, JAVASCRIPT_SCRIPT, REACT_SCRIPT, NEXTJS_SCRIPT } from "./constants";

export const createScript = (integrationId: IntegrationId, organizationId: string): string => {
  const scriptMap: Partial<Record<IntegrationId, string>> = {
    html: HTML_SCRIPT,
    react: REACT_SCRIPT,
    javascript: JAVASCRIPT_SCRIPT,
    nextjs: NEXTJS_SCRIPT,
  };

  const script = scriptMap[integrationId];
  if (!script) return "";


  return script.replace(/{{ORGANIZATION_ID}}/g, organizationId);
};



export const copyToClipboard = async (text: string, successMessage = "Copied to clipboard"): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (error) {
    toast.error("Failed to copy to clipboard");
  }
};

