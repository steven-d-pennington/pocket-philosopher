import "./globals.css";

import { Suspense } from "react";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";
import { PWAInstallPrompt } from "@/components/shared/pwa-install-prompt";
import { fontMono, fontSans } from "@/lib/fonts";
import { buildMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata = {
  ...buildMetadata({
    title: "Pocket Philosopher",
    disableSuffix: true,
  }),
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  viewportFit: "cover", // Handle notches and safe areas
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).origin : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource hints for performance */}
        {supabaseDomain && <link rel="preconnect" href={supabaseDomain} crossOrigin="anonymous" />}
        {supabaseDomain && <link rel="dns-prefetch" href={supabaseDomain} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <ThemeProvider>
          <QueryProvider>
            <Suspense fallback={null}>
              <AnalyticsProvider>
                <ServiceWorkerProvider>
                  {children}
                  <AppToaster />
                  <PWAInstallPrompt />
                </ServiceWorkerProvider>
              </AnalyticsProvider>
            </Suspense>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

