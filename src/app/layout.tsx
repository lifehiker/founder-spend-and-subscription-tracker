import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SpendTracker",
    default: "SpendTracker — Subscription Tracker for Founders",
  },
  description:
    "Track recurring SaaS subscriptions, AI API costs, and unusual charges in one founder-friendly dashboard. Upload statements, sync receipts, and get plain-English spend summaries.",
  keywords: [
    "subscription tracker for business",
    "ai api cost tracking",
    "saas spend monitoring for startups",
    "recurring charges app for business",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
