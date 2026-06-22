import type { Metadata } from "next";
import { Orbitron, Saira_Condensed } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const tech = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-tech",
  display: "swap",
});

const display = Saira_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - Seminovos em ${site.city}/${site.state}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.name}: seminovos selecionados com procedência em ${site.city}. Atendimento direto pelo WhatsApp.`,
  openGraph: {
    title: `${site.name} - Seminovos em ${site.city}/${site.state}`,
    description: site.tagline,
    type: "website",
    locale: "pt_BR",
    siteName: site.name,
    images: [{ url: "/hero/challenger.jpg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${tech.variable} ${display.variable}`}>
      <body className="bg-aurora min-h-screen antialiased">{children}</body>
    </html>
  );
}
