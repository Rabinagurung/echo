import { EMBED_CONFIG } from "./config";
import { chatBubbleIcon, closeIcon } from "./icons";

(function () {
  let iframe: HTMLIFrameElement | null = null;
  let container: HTMLDivElement | null = null;
  let button: HTMLButtonElement | null = null;

  let isOpen = false;

  // Get configuration from script tag
  let organizationId: string | null = null;
  let position: "bottom-right" | "bottom-left" = EMBED_CONFIG.DEFAULT_POSITION;
  let primaryColor: string = EMBED_CONFIG.DEFAULT_PRIMARY_COLOR;

  // Try to get the current script
  const currentScript = document.currentScript as HTMLScriptElement | null;
  if (currentScript) {
    readConfigFromScript(currentScript);
  } else {
    // Fallback: find script tag by src
    const scripts = document.querySelectorAll('script[src*="embed"]');
    const embedScript = Array.from(scripts).find((script) =>
      script.hasAttribute("data-organization-id"),
    ) as HTMLScriptElement | undefined;

    if (embedScript) {
      readConfigFromScript(embedScript);
    }
  }

  // Exit if no organization ID
  if (!organizationId) {
    console.error("Echo Widget: data-organization-id attribute is required");
    return;
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }
  function isValidCssColor(value: string | null): value is string {
    if (!value) return false;
    return typeof CSS !== "undefined" && CSS.supports("color", value);
  }

  function isValidPosition(
    value: string | null,
  ): value is "bottom-right" | "bottom-left" {
    return value === "bottom-right" || value === "bottom-left";
  }

  function readConfigFromScript(script: HTMLScriptElement) {
    organizationId = script.getAttribute("data-organization-id");

    const scriptPosition = script.getAttribute("data-position");
    const scriptColor = script.getAttribute("data-primary-color");

    if (isValidPosition(scriptPosition)) {
      position = scriptPosition;
    }

    if (isValidCssColor(scriptColor)) {
      primaryColor = scriptColor;
    }
  }
  function render() {
    if (button || container) return;

    // Create floating action button
    button = document.createElement("button");
    button.id = "echo-widget-button";
    button.innerHTML = chatBubbleIcon;
    button.style.cssText = `
      position: fixed;
      ${position === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
      transition: all 0.2s ease;
    `;

    button.addEventListener("click", toggleWidget);
    button.addEventListener("mouseenter", () => {
      if (button) button.style.transform = "scale(1.05)";
    });
    button.addEventListener("mouseleave", () => {
      if (button) button.style.transform = "scale(1)";
    });

    document.body.appendChild(button);

    // Create container (hidden by default)
    container = document.createElement("div");
    container.id = "echo-widget-container";
    container.style.cssText = `
      position: fixed;
      ${position === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: 999998;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;

    // Create iframe
    iframe = document.createElement("iframe");
    iframe.src = buildWidgetUrl();
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    // Add permissions for microphone and clipboard
    iframe.allow = "microphone; autoplay; clipboard-read; clipboard-write";

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Handle messages from widget
    window.addEventListener("message", handleMessage);
  }

  function buildWidgetUrl(): string {
    const url = new URL(EMBED_CONFIG.WIDGET_URL, window.location.href);

    url.searchParams.set("organizationId", organizationId!);
    url.searchParams.set("primaryColor", primaryColor);

    return url.toString();
  }

  function handleMessage(event: MessageEvent) {
    const widgetOrigin = new URL(EMBED_CONFIG.WIDGET_URL, window.location.href)
      .origin;

    if (event.origin !== widgetOrigin) return;
    if (iframe && event.source !== iframe.contentWindow) return;
    if (!event.data || typeof event.data !== "object") return;

    const { type, payload } = event.data as {
      type?: string;
      payload?: {
        height?: number;
      };
    };

    switch (type) {
      case "close":
        hide();
        break;

      case "resize":
        if (
          typeof payload?.height === "number" &&
          payload.height >= 300 &&
          payload.height <= window.innerHeight - 110 &&
          container
        ) {
          container.style.height = `${payload.height}px`;
        }
        break;
    }
  }

  function toggleWidget() {
    if (isOpen) {
      hide();
    } else {
      show();
    }
  }

  function show() {
    if (container && button) {
      isOpen = true;
      container.style.display = "block";
      // Trigger animation
      setTimeout(() => {
        if (container) {
          container.style.opacity = "1";
          container.style.transform = "translateY(0)";
        }
      }, 10);
      // Change button icon to close
      button.innerHTML = closeIcon;
    }
  }

  function hide() {
    if (container && button) {
      isOpen = false;
      container.style.opacity = "0";
      container.style.transform = "translateY(10px)";
      // Hide after animation
      setTimeout(() => {
        if (container) container.style.display = "none";
      }, 300);
      // Change button icon back to chat
      button.innerHTML = chatBubbleIcon;
      button.style.background = primaryColor;
    }
  }

  function destroy() {
    document.removeEventListener("DOMContentLoaded", render);
    window.removeEventListener("message", handleMessage);

    if (container) {
      container.remove();
      container = null;
      iframe = null;
    }

    if (button) {
      button.remove();
      button = null;
    }

    isOpen = false;
  }

  // Function to reinitialize with new config
  function reinit(
    newConfig: {
      organizationId?: string;
      position?: string;
      primaryColor?: string;
    } = {},
  ) {
    // Destroy existing widget
    destroy();

    // Update config
    if (newConfig.organizationId) {
      organizationId = newConfig.organizationId;
    }

    const nextPosition = newConfig.position ?? null;

    if (isValidPosition(nextPosition)) {
      position = nextPosition;
    }

    const nextPrimaryColor = newConfig.primaryColor ?? null;

    if (isValidCssColor(nextPrimaryColor)) {
      primaryColor = nextPrimaryColor;
    }

    // Reinitialize
    init();
  }

  // Expose API to global scope
  (window as any).EchoWidget = {
    init: reinit,
    show,
    hide,
    destroy,
  };

  // Auto-initialize
  init();
})();
