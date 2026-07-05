(function () {
  "use strict";
  const l = {
      WIDGET_URL: "https://echo-widget-vert.vercel.app",
      DEFAULT_POSITION: "bottom-right",
      DEFAULT_PRIMARY_COLOR: "#3b82f6",
    },
    f = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>`,
    v = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`;
  (function () {
    let r = null,
      e = null,
      i = null,
      d = !1,
      c = null,
      u = l.DEFAULT_POSITION,
      a = l.DEFAULT_PRIMARY_COLOR;
    const g = document.currentScript;
    if (g) b(g);
    else {
      const t = document.querySelectorAll('script[src*="embed"]'),
        o = Array.from(t).find((n) => n.hasAttribute("data-organization-id"));
      o && b(o);
    }
    if (!c) {
      console.error("Echo Widget: data-organization-id attribute is required");
      return;
    }
    function m() {
      document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", h, { once: !0 })
        : h();
    }
    function w(t) {
      return t ? typeof CSS < "u" && CSS.supports("color", t) : !1;
    }
    function x(t) {
      return t === "bottom-right" || t === "bottom-left";
    }
    function b(t) {
      c = t.getAttribute("data-organization-id");
      const o = t.getAttribute("data-position"),
        n = t.getAttribute("data-primary-color");
      (x(o) && (u = o), w(n) && (a = n));
    }
    function h() {
      i ||
        e ||
        ((i = document.createElement("button")),
        (i.id = "echo-widget-button"),
        (i.innerHTML = f),
        (i.style.cssText = `
      position: fixed;
      ${u === "bottom-right" ? "right: 20px;" : "left: 20px;"}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${a};
      color: white;
      border: none;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
      transition: all 0.2s ease;
    `),
        i.addEventListener("click", T),
        i.addEventListener("mouseenter", () => {
          i && (i.style.transform = "scale(1.05)");
        }),
        i.addEventListener("mouseleave", () => {
          i && (i.style.transform = "scale(1)");
        }),
        document.body.appendChild(i),
        (e = document.createElement("div")),
        (e.id = "echo-widget-container"),
        (e.style.cssText = `
      position: fixed;
      ${u === "bottom-right" ? "right: 20px;" : "left: 20px;"}
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
    `),
        (r = document.createElement("iframe")),
        (r.src = C()),
        (r.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `),
        (r.allow = "microphone; autoplay; clipboard-read; clipboard-write"),
        e.appendChild(r),
        document.body.appendChild(e),
        window.addEventListener("message", y));
    }
    function C() {
      const t = new URL(l.WIDGET_URL, window.location.href);
      return (
        t.searchParams.set("organizationId", c),
        t.searchParams.set("primaryColor", a),
        t.toString()
      );
    }
    function y(t) {
      const o = new URL(l.WIDGET_URL, window.location.href).origin;
      if (
        t.origin !== o ||
        (r && t.source !== r.contentWindow) ||
        !t.data ||
        typeof t.data != "object"
      )
        return;
      const { type: n, payload: s } = t.data;
      switch (n) {
        case "close":
          p();
          break;
        case "resize":
          typeof (s == null ? void 0 : s.height) == "number" &&
            s.height >= 300 &&
            s.height <= window.innerHeight - 110 &&
            e &&
            (e.style.height = `${s.height}px`);
          break;
      }
    }
    function T() {
      d ? p() : L();
    }
    function L() {
      e &&
        i &&
        ((d = !0),
        (e.style.display = "block"),
        setTimeout(() => {
          e && ((e.style.opacity = "1"), (e.style.transform = "translateY(0)"));
        }, 10),
        (i.innerHTML = v));
    }
    function p() {
      e &&
        i &&
        ((d = !1),
        (e.style.opacity = "0"),
        (e.style.transform = "translateY(10px)"),
        setTimeout(() => {
          e && (e.style.display = "none");
        }, 300),
        (i.innerHTML = f),
        (i.style.background = a));
    }
    function E() {
      (document.removeEventListener("DOMContentLoaded", h),
        window.removeEventListener("message", y),
        e && (e.remove(), (e = null), (r = null)),
        i && (i.remove(), (i = null)),
        (d = !1));
    }
    function I(t = {}) {
      (E(), t.organizationId && (c = t.organizationId));
      const o = t.position ?? null;
      x(o) && (u = o);
      const n = t.primaryColor ?? null;
      (w(n) && (a = n), m());
    }
    ((window.EchoWidget = { init: I, show: L, hide: p, destroy: E }), m());
  })();
})();
