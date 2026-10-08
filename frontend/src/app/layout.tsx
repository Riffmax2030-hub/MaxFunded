import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "@/styles/globals.css";
import PublicShell from "@/components/PublicShell";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://maxfunded.com"),
  title: {
    default: "MaxFunded — Get Funded. Trade Big. Keep 90%.",
    template: "%s | MaxFunded",
  },
  description:
    "MaxFunded is the premier proprietary trading evaluation firm. Pass our institutional 2-phase evaluation, trade accounts up to $200,000 with raw spreads on MetaTrader 5, and withdraw up to 90% profit splits via instant crypto & bank rails.",
  keywords: [
    "prop firm",
    "funded trader",
    "proprietary trading firm",
    "FTMO alternative",
    "funded trading account",
    "forex funded account",
    "trading challenge",
    "MT5 prop firm",
    "instant funded account",
    "MaxFunded",
  ],
  authors: [{ name: "MaxFunded Technologies Ltd" }],
  creator: "MaxFunded",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://maxfunded.com",
    siteName: "MaxFunded",
    title: "MaxFunded — Get Funded. Trade Big. Keep 90%.",
    description:
      "Pass our institutional evaluation, trade up to $200,000 on MT5, and keep up to 90% of your profits. Instant crypto & bank withdrawals.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MaxFunded Proprietary Trading Firm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxFunded — Get Funded. Trade Big. Keep 90%.",
    description:
      "Institutional-grade funded trading accounts up to $200,000. 90% profit split, raw spreads, instant payouts.",
    images: ["/og-image.jpg"],
    creator: "@MaxFunded",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#060709] text-neutral-100 antialiased selection:bg-[#ccff00] selection:text-black">
        {/* Google Analytics 4 (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MAXFUNDED01"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MAXFUNDED01');
          `}
        </Script>



        {/* Hidden Google Translate Element for Dynamic Site Translation */}
        <div id="google_translate_element" style={{ display: "none" }} />
        <Script id="google-translate-inline" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,de,fr,es,ar,ja,it,pt,ru',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#0d0e10",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              fontSize: "13px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            },
            success: {
              iconTheme: {
                primary: "#ccff00",
                secondary: "#000",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#fff",
              },
            },
          }}
        />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}

