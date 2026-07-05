export const INTEGRATIONS = [
  {
    id: "html",
    title: "HTML",
    icon: "/languages/html5.svg",
  },
  {
    id: "react",
    title: "React",
    icon: "/languages/react.svg",
  },
  {
    id: "nextjs",
    title: "Next.js",
    icon: "/languages/nextjs.svg",
  },
  {
    id: "javascript",
    title: "JavaScript",
    icon: "/languages/javascript.svg",
  },
] as const;

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];
const SCRIPT = `<script src="https://echo-widget-vert.vercel.app/embed.js" data-organization-id="{{ORGANIZATION_ID}}" data-primary-color={{PRIMARY_COLOR}}></script>`;
export const HTML_SCRIPT = SCRIPT;
export const REACT_SCRIPT = SCRIPT;
export const NEXTJS_SCRIPT = SCRIPT;
export const JAVASCRIPT_SCRIPT = SCRIPT;
