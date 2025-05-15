import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ConsultationProvider } from "../contexts/consultationContext";

// Define fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Votre Application",
  description: "Description de votre application",
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "200x200",
      },
    ],
  },
};
// Single RootLayout function that combines both implementations
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <ConsultationProvider>{children}</ConsultationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
