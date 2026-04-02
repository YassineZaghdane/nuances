import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Raleway } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-raleway",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Nuances Parfums",
  title: {
    default: "Nuances Parfums",
    template: "%s · Nuances",
  },
  description:
    "Parfumerie à Nabeul — huiles et parfums d'exception. Partenaire V.o Aromatiques.",
};

export const viewport: Viewport = {
  themeColor: "#1A1208",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable} ${raleway.variable}`}>
      <body className="min-h-screen bg-cream font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
