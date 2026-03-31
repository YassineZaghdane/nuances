import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Nuances Parfums | Parfumerie Nabeul",
  description:
    "Nuances Parfums — Parfumerie à Nabeul. Huiles et parfums d'exception, partenaire V.o Aromatiques.",
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
