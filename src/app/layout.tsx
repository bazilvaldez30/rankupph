import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/constants";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: `${SITE.name} — Premium Dota 2 Boosting, Duo Queue & Coaching`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "Dota 2 Boosting",
    "Dota 2 Boosting Worldwide",
    "Global Dota 2 Services",
    "Dota 2 MMR Boosting",
    "Dota 2 Duo Queue",
    "International Dota 2 Coaching",
    "Worldwide Calibration Services",
    "Global Ranked Wins Services",
    "Dota 2 Boosting SEA EU NA",
    "RankUpPH",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: env.appUrl,
    siteName: SITE.name,
    title: `${SITE.name} — Premium Dota 2 Services`,
    description: SITE.description,
    // og:image is provided by app/opengraph-image.tsx (generated).
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Premium Dota 2 Services`,
    description: SITE.description,
    creator: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Per-page canonicals are set in each route's metadata (Organization +
  // sitewide JSON-LD live on the homepage).
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} dark`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
