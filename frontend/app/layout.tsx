import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/UI/ThemeProvider";
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
  title: "Notes App - Ensolvers",
  description: "Full-stack note-taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen
          flex
          flex-col
          bg-zinc-50
          dark:bg-zinc-950
          text-zinc-900
          dark:text-zinc-50
          transition-colors
          duration-200
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}