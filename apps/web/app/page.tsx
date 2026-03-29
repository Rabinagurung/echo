"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  MessageSquare,
  Bot,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Headphones,
  Globe,
  Clock,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimateIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const features = [
  {
    icon: Bot,
    title: "AI-Powered Responses",
    description:
      "Gemini 2.0 Flash answers customer questions instantly using your knowledge base.",
  },
  {
    icon: Zap,
    title: "Instant Resolution",
    description:
      "Resolve common queries automatically and escalate complex issues to your team.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with Clerk authentication and encrypted data storage.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track conversations, resolution rates, and customer satisfaction in one dashboard.",
  },
  {
    icon: Globe,
    title: "Embeddable Widget",
    description:
      "Add Echo to any website with a single script tag. Fully customizable to match your brand.",
  },
  {
    icon: Headphones,
    title: "Voice AI Integration",
    description:
      "Connect Vapi for voice-based customer support alongside your chat widget.",
  },
];

const steps = [
  {
    step: "01",
    title: "Sign Up & Create Org",
    description: "Create your account and set up your organization in seconds.",
  },
  {
    step: "02",
    title: "Upload Knowledge Base",
    description:
      "Add documents, FAQs, and guides so the AI learns your business.",
  },
  {
    step: "03",
    title: "Embed the Widget",
    description:
      "Copy one script tag and paste it into your website. You're live.",
  },
];

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-clip">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="size-4" />
            </div>
            Echo
          </Link>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Button asChild size="sm">
                <Link href="/conversations">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
        {/* Grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 70% 50% at 50% 40%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 50% at 50% 40%, black, transparent)",
            opacity: 0.5,
          }}
        />

        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, oklch(0.62 0.19 260 / 0.25), transparent 70%)",
              opacity: mounted ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, oklch(0.55 0.18 300 / 0.2), transparent 70%)",
              opacity: mounted ? 1 : 0,
              transition: "opacity 1.5s ease 0.3s",
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s",
            }}
          >
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary"
            >
              <Sparkles className="size-3.5" />
              AI-Powered Customer Support
            </Badge>
          </div>

          <h1
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s",
            }}
          >
            Customer support
            <br />
            that{" "}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.62 0.19 260), oklch(0.55 0.22 300))",
              }}
            >
              never sleeps
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s",
            }}
          >
            Echo uses AI to resolve customer queries instantly, escalate when
            needed, and give your team superpowers — all from a beautiful
            embeddable widget.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.55s",
            }}
          >
            <Link href={isSignedIn ? "/conversations" : "/sign-up"}>
              <Button size="lg" className="gap-2 px-6 text-base shadow-md">
                {isSignedIn ? "Go to Dashboard" : "Start Free"}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-6 text-base"
              >
                See it in Action
                <ChevronDown className="size-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div
          className="relative z-10 mt-20 grid w-full max-w-xl grid-cols-3 gap-6 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.7s",
          }}
        >
          {[
            { value: "< 1s", label: "Avg. Response" },
            { value: "24/7", label: "Availability" },
            { value: "90%", label: "Auto-Resolved" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center ${i < 2 ? "border-r border-border" : ""}`}
            >
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimateIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for modern support
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Powerful AI, seamless integrations, and a widget that takes 30
              seconds to install.
            </p>
          </AnimateIn>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <AnimateIn key={feature.title} delay={i * 0.08}>
                <div className="group rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-4xl px-6">
          <AnimateIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Three simple steps to transform your customer support.
            </p>
          </AnimateIn>

          <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <AnimateIn
                key={step.step}
                delay={i * 0.12}
                className="text-center"
              >
                <div className="relative mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary font-mono text-lg font-bold text-primary-foreground shadow-md">
                  {step.step}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section id="demo" className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimateIn className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Try Echo right now
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Click the chat bubble in the bottom-right corner to see exactly
              what your customers will experience.
            </p>
          </AnimateIn>

          <AnimateIn delay={0.15}>
            <div className="mx-auto mt-12 flex justify-center">
              <div className="relative w-full max-w-[600px]">
                {/* Glow behind image */}
                <div
                  className="absolute -inset-4 -z-10 rounded-3xl blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.62 0.19 260 / 0.15), transparent 70%)",
                  }}
                />
                <div className="overflow-hidden rounded-2xl border bg-card p-12 shadow-xl text-center">
                  <MessageSquare className="mx-auto size-16 text-primary" />
                  <h3 className="mt-6 text-xl font-semibold">Live Chat Demo</h3>
                  <p className="mt-2 text-muted-foreground">
                    Use the chat widget in the bottom-right corner to start a
                    conversation with our AI support agent.
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Embed script — loads the chat widget as a floating bubble (bottom-right) */}
      <Script
        src="/embed.js"
        data-organization-id={process.env.NEXT_PUBLIC_ORG_ID || ""}
        strategy="lazyOnload"
      />

      {/* CTA */}
      <section className="relative border-t py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)",
            opacity: 0.3,
          }}
        />
        <AnimateIn className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Clock className="size-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Stop making customers wait
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join teams using Echo to deliver instant, AI-powered support around
            the clock. Free to get started.
          </p>
          <Link
            href={isSignedIn ? "/conversations" : "/sign-up"}
            className="mt-8 inline-block"
          >
            <Button size="lg" className="gap-2 px-6 text-base shadow-md">
              {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </AnimateIn>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="size-4" />
            Echo &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {isSignedIn ? (
              <Link
                href="/conversations"
                className="transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="transition-colors hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="transition-colors hover:text-foreground"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
