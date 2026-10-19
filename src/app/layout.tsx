import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SecondSpark — The Project Graveyard",
  description:
    "A modern SaaS platform that helps developers preserve abandoned projects and discover opportunities to revive them.",
  keywords: ["project graveyard", "developer tools", "open source", "code preservation", "software revival"],
  authors: [{ name: "SecondSpark" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#1F2328] selection:bg-[#DDF4FF] selection:text-[#0969DA]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
