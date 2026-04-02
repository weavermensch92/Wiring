import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "./fonts/GeistVF.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-geist-sans",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const mono = localFont({
  src: [
    { path: "./fonts/GeistMonoVF.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-geist-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export const metadata: Metadata = {
  title: "GRIDGE Wiring AI",
  description: "AI-powered development management groupware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${sans.variable} ${mono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full">
        <TooltipProvider delay={150}>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
