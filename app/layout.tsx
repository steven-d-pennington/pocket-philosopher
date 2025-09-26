import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { fontMono, fontSans } from "@/lib/fonts";
import { buildMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "Pocket Philosopher",
  disableSuffix: true,
});

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
            <AnalyticsProvider>
              {children}
              <AppToaster />
            </AnalyticsProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

