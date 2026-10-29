import type { ReactNode } from "react";

// Um titulo cortado em palavras, cada uma atras de uma mascara, para subirem
// uma a uma quando aparecem. Partes entre colchetes saem em italico (<em>).
type Parte = string | [string];

const palavras = (texto: string, chave: string): ReactNode[] =>
  texto.split(/(\s+)/).map((p, i) => (/^\s+$/.test(p) || !p ? p : <span key={`${chave}${i}`} className="palavra"><span>{p}</span></span>));

export function Titulo({ partes, nivel = 2 }: { partes: Parte[]; nivel?: 1 | 2 }) {
  const Tag = nivel === 1 ? "h1" : "h2";
  return (
    <Tag data-titulo aria-label={partes.map((p) => (typeof p === "string" ? p : p[0])).join("")}>
      {partes.map((p, i) => (typeof p === "string" ? palavras(p, `t${i}-`) : <em key={i}>{palavras(p[0], `e${i}-`)}</em>))}
    </Tag>
  );
}
