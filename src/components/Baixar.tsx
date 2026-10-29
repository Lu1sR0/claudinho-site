"use client";

import { useEffect, useState } from "react";

import { DOWNLOADS } from "../content";

// Qual sistema esta abrindo a pagina. Descoberto so no navegador, depois de
// montar, para o HTML do servidor e o do cliente baterem.
export type Sistema = "windows" | "mac" | "celular" | "outro";

export function useSistema(): Sistema | null {
  const [s, setS] = useState<Sistema | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } };
    const ua = navigator.userAgent, plat = nav.userAgentData?.platform || navigator.platform || "";
    // iPad se apresenta como Mac: o toque denuncia
    const toque = navigator.maxTouchPoints > 1;
    if (nav.userAgentData?.mobile || /Android|iPhone|iPod/i.test(ua) || (/Mac/i.test(plat) && toque)) setS("celular");
    else if (/Win/i.test(plat) || /Windows/i.test(ua)) setS("windows");
    else if (/Mac/i.test(plat) || /Mac OS X/i.test(ua)) setS("mac");
    else setS("outro");
  }, []);
  return s;
}

const ICONE = {
  windows: <path d="M3 5.5 10.5 4.5v7H3zM11.5 4.3 21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" />,
  mac: <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-4.2zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />,
};

type Plataforma = keyof typeof DOWNLOADS;

/** Botao de um sistema: ativo quando ha instalador, "em breve" quando nao. */
export function BotaoBaixar({ p, fantasma, pequeno }: { p: Plataforma; fantasma?: boolean; pequeno?: boolean }) {
  const d = DOWNLOADS[p], cls = `botao${fantasma ? " fantasma" : ""}${pequeno ? " pequeno" : ""}`;
  const corpo = (
    <>
      <svg viewBox="0 0 24 24" aria-hidden="true">{ICONE[p]}</svg>
      {d.url ? `Baixar para ${d.nome}` : <>Para {d.nome} <small>em breve</small></>}
    </>
  );
  return d.url
    ? <a className={cls} href={d.url} data-clawd-alvo="esse botão aí!">{corpo}</a>
    : <span className={`${cls} desligado`} aria-disabled="true" data-clawd-alvo="falta pouco pra esse sair">{corpo}</span>;
}

/** O bloco de download: o sistema de quem abriu primeiro, o outro do lado. */
export function Baixar() {
  const s = useSistema();
  const ordem: Plataforma[] = s === "mac" ? ["mac", "windows"] : ["windows", "mac"];
  const destaque = s === "windows" || s === "mac";
  return (
    <div className="baixar">
      <div className="baixar-botoes">
        {ordem.map((p, i) => <BotaoBaixar key={p} p={p} fantasma={destaque && i > 0} />)}
      </div>
      <p className="baixar-nota">
        {s === "celular" ? "O Claudinho é um app de computador: abra esta página no Windows ou no Mac para baixar."
          : s === "outro" ? "Por enquanto, Windows e Mac."
          : destaque ? `${DOWNLOADS[s].nota} · gratuito · precisa do Claude Code instalado` : "Gratuito · precisa do Claude Code instalado"}
      </p>
    </div>
  );
}
