import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AIChat } from "@/components/ai-chat";
import { ConvexClientProvider } from "@/providers/convex-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TierJobs - Find Your Next Role at Top-Tier Tech Companies",
  description: "Browse jobs at elite tech companies, ranked by tier. From S+ giants like Google and Apple to rising A-tier startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ConvexClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AIChat />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
