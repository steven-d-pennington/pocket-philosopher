import type { Metadata } from "next";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pocket Philosopher",
  description:
    "A daily practice companion blending Stoic, Taoist, and Existentialist wisdom with habits, reflections, and AI mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <AppToaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
