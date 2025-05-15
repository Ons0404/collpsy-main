
import React from "react";
import type { Metadata } from "next";
import { Barlow } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const barlow = Barlow({ subsets: ["latin"], weight: "500" });

export const metadata: Metadata = {
  title: "Wall-E",
  description: "Share and interact with your AI Companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "blockButton",
        },
      }}
    >
      <html lang="en">
        <link
          rel="shortcut icon"
          href="/android-icon-192x192.png"
          type="image/x-icon"
        />
        <link rel="icon" href="/android-icon-192x192.png" type="image/x-icon" />
        <body className={barlow.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
