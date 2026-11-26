import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const text = Inter({
  variable: "--font-text",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1655 Studio · Coming soon",
  description:
    "1655 helps creators, coaches and consultants who already sell a named offer stop losing buyers between their content and the sale.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
