import type { ReactNode } from "react";

// Um titulo cortado em palavras, cada uma atras de uma mascara, para subirem
// (ou serem construidas) uma a uma. Partes entre colchetes saem em italico.
type Parte = string | [string];

const palavras = (texto: string, chave: string): ReactNode[] =>
  texto.split(/(\s+)/).map((p, i) => (/^\s+$/.test(p) || !p ? p : <span key={`${chave}${i}`} className="palavra"><span>{p}</span></span>));

export function Titulo({ partes, nivel = 2 }: { partes: Parte[]; nivel?: 1 | 2 }) {
  const Tag = nivel === 1 ? "h1" : "h2";
  const nos: ReactNode[] = [];
  for (let i = 0, cola = ""; i < partes.length; i++) {
    const p = partes[i];
    if (typeof p === "string") { nos.push(palavras(p.slice(cola.length), `t${i}-`)); cola = ""; continue; }
    // a pontuacao logo depois do italico vai junto, para nao cair sozinha na linha de baixo
    // (so a ultima palavra fica presa a ela; o resto do italico quebra normal)
    const prox = partes[i + 1];
    cola = typeof prox === "string" ? /^[^\s]*/.exec(prox)![0] : "";
    if (!cola) { nos.push(<em key={i}>{palavras(p[0], `e${i}-`)}</em>); continue; }
    const corte = p[0].search(/\S+$/), inicio = p[0].slice(0, corte), ultima = p[0].slice(corte);
    nos.push(
      inicio && <em key={`${i}a`}>{palavras(inicio, `e${i}-`)}</em>,
      <span key={`${i}b`} className="junto"><em>{palavras(ultima, `u${i}-`)}</em>{palavras(cola, `c${i}-`)}</span>,
    );
  }
  return <Tag data-titulo aria-label={partes.map((p) => (typeof p === "string" ? p : p[0])).join("")}>{nos}</Tag>;
}
