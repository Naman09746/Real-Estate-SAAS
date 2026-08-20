import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CRMProvider } from "@/context/crm-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CallCRM — Enterprise Real Estate CRM",
  description: "High-velocity multi-tenant CRM designed for Indian real estate sales teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-foreground antialiased flex flex-col">
        <CRMProvider>{children}</CRMProvider>
      </body>
    </html>
  );
}
