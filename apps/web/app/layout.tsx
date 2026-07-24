import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";

import { AgentationProvider } from "@/components/providers/agentation-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "AI-powered cross-platform task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} ${jetbrains.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <AgentationProvider />
      </body>
    </html>
  );
}
