// Endereco e textos de busca do site, usados nos metadados, no sitemap, no
// robots e nos dados estruturados.
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://meuclaudinho.com.br").replace(/\/$/, "");

export const TITULO = "Claudinho: o app do Claude Code para Windows, com mais vida";
export const DESCRICAO =
  "Claudinho é um app gratuito para Windows que dá uma interface ao Claude Code: papéis de parede ASCII vivos, o Clawd do seu lado, diffs, desfazer e personalização total.";

export const AUTOR = { nome: "Luis Roberto", url: "https://luisrobertoportifolio.com" };
