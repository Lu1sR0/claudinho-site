import type { MetadataRoute } from "next";

import { DESCRICAO } from "../lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Claudinho",
    short_name: "Claudinho",
    description: DESCRICAO,
    lang: "pt-BR",
    start_url: "/",
    display: "browser",
    background_color: "#121110",
    theme_color: "#121110",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
