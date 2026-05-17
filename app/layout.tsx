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
  metadataBase: new URL("https://samar.dev"),
  title: {
    default: "samar narangi — engineer of strange quiet machines",
    template: "%s",
  },
  description:
    "software engineer making voice agents, notification ML, indie tools, and quiet machines. hyderabad / internet.",
  keywords: ["samar narangi", "software engineer", "voice ai", "indie hacker", "hyderabad", "portfolio"],
  authors: [{ name: "Samar Narangi" }],
  openGraph: {
    title: "samar narangi",
    description: "engineer of strange quiet machines",
    type: "website",
    url: "https://samar.dev",
    siteName: "samar.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "samar narangi",
    description: "engineer of strange quiet machines",
    creator: "@samarnarangi",
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
