import type { Metadata } from "next";

import localFont from "next/font/local";

import "../index.css";
import Providers from "@/components/providers";

const geistSans = localFont({
  src: [
    {
      path: "./fonts/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Geist-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    {
      path: "./fonts/GeistMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeistMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SafeCircle Auth",
  description: "The Official SafeCircle Authentication Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            {/*<Header />*/}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
