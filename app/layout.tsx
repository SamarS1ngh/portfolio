import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://samarsingh.is-a.dev"),
  title: {
    default: "samar singh — engineer of strange quiet machines",
    template: "%s",
  },
  description:
    "software engineer making voice agents, notification ML, indie tools, and quiet machines. hyderabad / internet.",
  keywords: ["samar singh", "software engineer", "voice ai", "indie hacker", "hyderabad", "portfolio"],
  authors: [{ name: "Samar Singh" }],
  openGraph: {
    title: "samar singh — engineer of strange quiet machines",
    description: "software engineer making voice agents, notification ML, indie tools, and quiet machines.",
    type: "website",
    url: "https://samarsingh.is-a.dev",
    siteName: "samarsingh.is-a.dev",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "samar singh — engineer of strange quiet machines",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "samar singh — engineer of strange quiet machines",
    description: "software engineer making voice agents, notification ML, indie tools, and quiet machines.",
    creator: "@samarnarangi",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-ink text-bone grain">{children}</body>
    </html>
  );
}
