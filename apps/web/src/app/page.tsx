"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import MetallicPaint from "@/components/metallic-paint";
import { Button } from "@/components/ui/button";

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const KeyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
  >
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
    <path d="m21 2-9.6 9.6" />
    <circle cx="7.5" cy="15.5" r="5.5" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const features = [
  {
    icon: <ShieldIcon />,
    title: "Secure by Design",
    description: "Enterprise-grade security with end-to-end encryption.",
  },
  {
    icon: <KeyIcon />,
    title: "Single Sign-On",
    description: "One account for all SafeCircle services.",
  },
  {
    icon: <UsersIcon />,
    title: "Unified Identity",
    description: "Manage your profile across all apps.",
  },
];

const APP_VERSION = "0.1.0";

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Metallic Logo */}
        <div className="h-48 w-48 md:h-64 md:w-64">
          <MetallicPaint
            imageSrc="/logo.svg"
            speed={0.3}
            scale={4}
            brightness={2}
            contrast={0.5}
            liquid={0.75}
            refraction={0.01}
            blur={0.015}
            fresnel={1}
            waveAmplitude={1}
            noiseScale={0.5}
            chromaticSpread={2}
            distortion={1}
            contour={0.2}
            lightColor="#99c1f1"
            darkColor="#1a5fb4"
            tintColor="#3584e4"
          />
        </div>

        {/* Hero text */}
        <div className="mt-8 max-w-2xl space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Your identity, <span className="text-primary">protected.</span>
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            SafeCircle Auth is your centralized identity hub. Create an account
            once and securely access all SafeCircle services with a single
            login.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-40">
            <Link href="/signup">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-40">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="text-primary rounded-xl bg-primary/10 p-3">
                {feature.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-4 p-6 text-sm">
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4">
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span className="text-border">•</span>
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <span className="text-border">•</span>
          <Link href="#" className="hover:text-foreground transition-colors">
            Help Center
          </Link>
        </div>
        <p className="text-muted-foreground/60 text-xs">
          SafeCircle Auth v{APP_VERSION}
        </p>
      </footer>
    </div>
  );
}
