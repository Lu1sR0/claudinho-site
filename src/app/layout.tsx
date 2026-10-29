import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";

// texto: Inter; rotulos e numeros: Geist Mono (as mesmas do app); destaques
// em italico: Instrument Serif.
import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "../styles/globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meuclaudinho.com.br";
const OBRA = `try{if(!sessionStorage.getItem("obraVista")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("obra")}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Claudinho: o seu Claude Code, agora com mais vida",
  description:
    "Um app de desktop que conversa com o Claude Code de verdade, com papéis de parede em ASCII vivos, o Clawd do seu lado, permissões com diff, desfazer, ramificar e personalização total.",
  authors: [{ name: "Luis Roberto", url: "https://luisrobertoportifolio.com" }],
  icons: { icon: [{ url: "/icone.png", type: "image/png" }], apple: "/apple-touch-icon.png" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Claudinho",
    title: "Claudinho: o seu Claude Code, agora com mais vida",
    description: "Papéis de parede ASCII vivos, o Clawd do seu lado e tudo do Claude Code numa interface que mostra o que ele está fazendo.",
    images: [{ url: "/assets/telas/conversa-1440.webp", width: 1440, height: 920 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121110",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
