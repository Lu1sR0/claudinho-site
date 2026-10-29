import localFont from "next/font/local";

// texto: Inter; rotulos e numeros: Geist Mono (as mesmas do app); destaques
// em italico: Instrument Serif. Pelo next/font elas vem pre-carregadas e com
// uma fonte reserva de mesmas medidas, entao o topo nao pula quando chegam.
export const inter = localFont({
  src: "./inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--f-inter",
  adjustFontFallback: "Arial",
});

export const geistMono = localFont({
  src: "./geist-mono-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--f-mono",
  fallback: ["ui-monospace", "Consolas", "monospace"],
  adjustFontFallback: false,
});

export const instrumentSerif = localFont({
  src: [
    { path: "./instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--f-serifa",
  adjustFontFallback: "Times New Roman",
});
