import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1655 Studio · System studio for creators, coaches and consultants",
  description:
    "1655 writes the offer, builds the home base and wires up checkout and emails for creators, coaches and consultants who already sell a named offer.",
  metadataBase: new URL("https://1655.studio"),
  openGraph: {
    title: "1655 Studio",
    description: "Your content sells. Your link leaks. 1655 fixes the path in between.",
    url: "https://1655.studio",
    siteName: "1655 Studio",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
