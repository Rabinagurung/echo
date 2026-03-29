import { NextRequest, NextResponse } from "next/server";
// Dynamically set CSP `frame-ancestors` for the widget based on the
// organization's allowed embed domains, so only approved parent sites
// can iframe this page. If the domain lookup fails, fall back to allowing
// all embeds to avoid breaking the widget.

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) {
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    return response;
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    return response;
  }

  try {
    // Derive the Convex HTTP actions URL from the client URL
    // e.g. https://foo-123.convex.cloud → https://foo-123.convex.site
    const httpUrl = convexUrl.replace(".cloud", ".site");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `${httpUrl}/allowed-domains?organizationId=${encodeURIComponent(organizationId)}`,
      { next: { revalidate: 60 }, signal: controller.signal },
    );

    clearTimeout(timeout);

    if (!res.ok) {
      response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
      return response;
    }

    const { allowedDomains } = (await res.json()) as {
      allowedDomains: string[];
    };

    if (allowedDomains && allowedDomains.length > 0) {
      // Convert domain entries to CSP frame-ancestors sources.
      // CSP requires scheme+host+port for non-standard ports.
      // - Full origins like "http://localhost:3002" are passed through as-is.
      // - Bare hostnames like "example.com" become "https://example.com http://example.com".
      // - Wildcards like "*.example.com" become "https://*.example.com http://*.example.com".
      const sources = allowedDomains
        .map((d: string) => d.trim())
        .filter(Boolean)
        .flatMap((d) => {
          if (d.startsWith("http://") || d.startsWith("https://")) {
            return [d];
          }
          return [`https://${d}`, `http://${d}`];
        })
        .join(" ");
      response.headers.set(
        "Content-Security-Policy",
        `frame-ancestors 'self' ${sources}`,
      );
    } else {
      response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    }
  } catch {
    // If the fetch fails, block all framing to be safe
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  }

  return response;
}

export const config = {
  matcher: "/",
};
