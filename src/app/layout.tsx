import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";

import { geistMono, instrumentSerif, inter } from "../fonts";
import "../styles/globals.css";
import { AUTOR, DESCRICAO, SITE, TITULO } from "../lib/site";

const OBRA = `try{if(!sessionStorage.getItem("obraVista")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("obra")}catch(e){}`;

// A imagem de compartilhamento (opengraph-image.jpg / twitter-image.jpg) e os
// icones (icon.png, apple-icon.png, favicon.ico) ficam em src/app: o Next gera
// as tags com tamanho, tipo e endereco completo sozinho.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITULO, template: "%s · Claudinho" },
  description: DESCRICAO,
  applicationName: "Claudinho",
  keywords: [
    "Claudinho", "Claude Code", "app do Claude Code", "Claude Code para Windows", "interface para o Claude Code", "GUI do Claude Code",
    "Claude Agent SDK", "Anthropic", "Clawd", "papel de parede ASCII", "papel de parede animado", "Wallpaper Engine", "IA para programar",
  ],
  authors: [{ name: AUTOR.nome, url: AUTOR.url }],
  creator: AUTOR.nome,
  publisher: AUTOR.nome,
  category: "technology",
  alternates: { canonical: "/", languages: { "pt-BR": "/" } },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    url: "/",
    locale: "pt_BR",
    siteName: "Claudinho",
    title: TITULO,
    description: "Papéis de parede ASCII vivos, o Clawd do seu lado e tudo do Claude Code numa interface que mostra o que ele está fazendo. Grátis para Windows.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: "Papéis de parede ASCII vivos, o Clawd do seu lado e tudo do Claude Code. Grátis para Windows.",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121110",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        {/* antes de pintar: na primeira visita da sessao o Clawd constroi o topo */}
        <script dangerouslySetInnerHTML={{ __html: OBRA }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
