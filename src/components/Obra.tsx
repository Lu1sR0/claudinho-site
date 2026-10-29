"use client";

import { useEffect, useRef } from "react";

import { reducedMotion } from "../lib/motion";
import { evento } from "../lib/metricas";
import { carregaMotor } from "../lib/vivo";
import { fonteMono } from "../lib/fonte";

// O Clawd de capacete que constroi a pagina: no topo, monta o hero peca por
// peca; depois, conforme voce rola, monta os titulos e os cartoes de cada
// secao. O conteudo aparece de ladrilhos ASCII na borda por onde ele passa.
// Ao terminar o topo ele pula para o chao e vira o Clawd que passeia.

const LARANJA = "#d97757", AMARELO = "#f2c14e";

type Linha = { itens: HTMLElement[] };
type Particula = { x: number; y: number; t0: number; vida: number };

const caixa = (els: HTMLElement[]) => {
  const rs = els.map((e) => e.getBoundingClientRect());
  return { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)), top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) };
};
// palavras de um titulo agrupadas em linhas (pela altura em que cairam)
function linhasDe(el: HTMLElement): Linha[] {
  const palavras = [...el.querySelectorAll<HTMLElement>(".palavra")];
  if (!palavras.length) return [{ itens: [el] }];
  const linhas: Linha[] = [];
  for (const p of palavras) {
    const top = p.getBoundingClientRect().top, l = linhas.find((x) => Math.abs(x.itens[0].getBoundingClientRect().top - top) < 8);
    if (l) l.itens.push(p); else linhas.push({ itens: [p] });
  }
  return linhas;
}
const mostra = (el: HTMLElement, f: number) => { el.style.clipPath = f >= 1 ? "none" : `inset(-40% ${((1 - f) * 100).toFixed(2)}% -40% -14px)`; };

export function Obra() {
  const ref = useRef<HTMLCanvasElement>(null), pular = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement, intro = html.classList.contains("obra");
    if (reducedMotion()) { html.classList.remove("obra"); return; }
    const cv = ref.current!, ctx = cv.getContext("2d")!;
    let vivo = true, raf = 0, pulou = false, limpa = () => {};

    carregaMotor().then(({ CLAWD, desenhaClawd }) => {
      if (!vivo) return;
      const px = innerWidth < 640 ? 3 : 4, PW = px, PH = px * 2, CW = CLAWD.W * PW, CH = CLAWD.H * PH;
      let dpr = 1, W = 0, H = 0;
      const redim = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
      redim(); addEventListener("resize", redim);

      // o construtor
      const ob = { x: -999, y: -999, visivel: false, alfa: 0, sai: false, olhar: [0, 1] as [number, number], passo: 0, bolha: "", feixe: null as null | { x: number; y0: number; topo: number; y1: number } };
      const particulas: Particula[] = [];
      let ativo = false;
      const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
      const quadro = () => new Promise<number>((r) => requestAnimationFrame(r));

      // he fades in and out (no burst)
      const some = () => { ob.sai = true; ob.bolha = ""; };
      // pula ate (x, y) num arco
      const vaiPara = async (x: number, y: number, ms = 220) => {
        if (!ob.visivel || ob.sai) { ob.x = x; ob.y = y; ob.visivel = true; ob.sai = false; ob.alfa = Math.min(ob.alfa, 0.2); return; }
        const x0 = ob.x, y0 = ob.y, t0 = performance.now();
        for (;;) {
          const p = Math.min(1, (performance.now() - t0) / ms);
          ob.x = x0 + (x - x0) * p; ob.y = y0 + (y - y0) * p - Math.sin(p * Math.PI) * 26; ob.olhar = [Math.sign(x - x0), 0];
          if (p >= 1 || pulou) break;
          await quadro();
        }
        ob.x = x; ob.y = y;
      };
      // constroi uma linha: o conteudo aparece da esquerda para a direita
      const constroiLinha = async (l: Linha, vel: number) => {
        let r = caixa(l.itens);
        if (pulou || r.bottom < 0 || r.top > innerHeight) { l.itens.forEach((e) => mostra(e, 1)); return; }
        await vaiPara(r.left - CW / 2, r.top - CH - 6);
        const dur = Math.max(260, ((r.right - r.left) / vel) * 1000), t0 = performance.now();
        for (;;) {
          const p = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - p, 1.6);
          r = caixa(l.itens);
          const borda = r.left + (r.right - r.left) * e;
          for (const it of l.itens) { const ir = it.getBoundingClientRect(); mostra(it, Math.max(0, Math.min(1, (borda - ir.left) / Math.max(1, ir.width)))); }
          ob.x = borda - CW / 2; ob.y = r.top - CH - 6; ob.passo += 0.35; ob.olhar = [0, 1];
          ob.feixe = { x: borda, y0: ob.y + CH, topo: r.top, y1: r.bottom };
          // a few small sparks that fade where they are
          for (let y = r.top; y < r.bottom; y += 22) if (Math.random() < 0.07) particulas.push({ x: borda + (Math.random() - 0.5) * 8, y: y + Math.random() * 18, t0: performance.now(), vida: 0.55 });
          if (p >= 1 || pulou) break;
          await quadro();
        }
        ob.feixe = null;
        l.itens.forEach((it) => mostra(it, 1));
      };
      const constroi = async (el: HTMLElement, vel: number) => { for (const l of linhasDe(el)) await constroiLinha(l, vel); };

      // laco de desenho: so roda enquanto ha obra ou particulas
      const desenha = () => {
        raf = 0;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        const agora = performance.now();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        for (let k = particulas.length - 1; k >= 0; k--) {
          const p = particulas[k], s = (agora - p.t0) / 1000;
          if (s > p.vida) { particulas.splice(k, 1); continue; }
          ctx.globalAlpha = (1 - s / p.vida) * 0.85; ctx.fillStyle = "#f6cdb3"; ctx.fillRect(Math.round(p.x - 1.5), Math.round(p.y - 1.5), 3, 3);
        }
        ctx.globalAlpha = 1;
        // the edge being built: a thin line of light, and a faint beam up to him
        if (ob.feixe) {
          const f = ob.feixe, alto = f.y1 - f.topo, g = ctx.createLinearGradient(0, f.topo, 0, f.y1);
          g.addColorStop(0, "rgba(232,147,111,0)"); g.addColorStop(0.5, "rgba(232,147,111,0.95)"); g.addColorStop(1, "rgba(232,147,111,0)");
          ctx.fillStyle = "rgba(217,119,87,0.12)"; ctx.fillRect(Math.round(f.x - 8), f.topo, 16, alto);
          ctx.fillStyle = g; ctx.fillRect(Math.round(f.x - 1), f.topo, 2, alto);
          ctx.fillStyle = "rgba(255,207,158,0.4)";
          for (let y = f.y0 + 2; y < f.topo - 2; y += 6) ctx.fillRect(Math.round(f.x - 1), Math.round(y), 2, 2);
        }
        if (ob.visivel) {
          ob.alfa += ((ob.sai ? 0 : 1) - ob.alfa) * 0.22;
          if (ob.sai && ob.alfa < 0.03) { ob.visivel = false; ob.sai = false; }
          ctx.globalAlpha = ob.alfa;
          const pa = Math.floor(ob.passo) % 2;
          desenhaClawd(ctx, { x: Math.round(ob.x), y: Math.round(ob.y), pw: PW, ph: PH, cor: LARANJA, olhar: ob.olhar, pernas: pa ? [px, 0, px, 0] : [0, px, 0, px], bracos: true, braco: ob.feixe ? [0, 1] : [0, 0] });
          desenhaCapacete(ob.x, ob.y, 0);
          if (ob.bolha) {
            ctx.font = `600 ${px <= 3 ? 10 : 11}px ${fonteMono()}`;
            const w = ctx.measureText(ob.bolha).width + 16, bx = Math.max(6, Math.min(W - w - 6, ob.x + CW / 2 - w / 2)), by = ob.y - PH - 26;
            ctx.fillStyle = "#ecebe7"; ctx.beginPath(); ctx.roundRect(bx, by, w, 20, 4); ctx.fill();
            ctx.fillStyle = "#121110"; ctx.fillText(ob.bolha, bx + w / 2, by + 10.5);
          }
          ctx.globalAlpha = 1;
        }
        if (ativo || particulas.length || ob.visivel) raf = requestAnimationFrame(desenha);
      };
      const acorda = () => { if (!raf) raf = requestAnimationFrame(desenha); };
      function desenhaCapacete(x: number, y: number, giro: number) {
        ctx.save(); ctx.translate(x + CW / 2, y); ctx.rotate(giro);
        ctx.fillStyle = AMARELO;
        ctx.fillRect(Math.round(-5 * PW), Math.round(-PH * 0.95), 10 * PW, Math.round(PH * 0.95));
        ctx.fillRect(Math.round(-6.5 * PW), Math.round(-PH * 0.3), 13 * PW, Math.round(PH * 0.4));
        ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(Math.round(-3 * PW), Math.round(-PH * 0.75), 2 * PW, Math.max(2, Math.round(PH * 0.22)));
        ctx.restore();
      }

      // ---- fila: uma obra de cada vez ---------------------------------------------------
      const fila: (() => Promise<void>)[] = [];
      let rodando = false;
      const roda = async () => {
        if (rodando) return;
        rodando = true; ativo = true; acorda();
        while (fila.length && vivo) await fila.shift()!();
        if (ob.visivel) { some(); acorda(); }
        rodando = false; ativo = false;
      };
      const enfileira = (job: () => Promise<void>) => { fila.push(job); roda(); };

      // ---- o topo -----------------------------------------------------------------------
      const termina = () => {
        html.classList.remove("obra");
        try { sessionStorage.setItem("obraVista", "1"); } catch { /* sem storage */ }
        if (pular.current) pular.current.hidden = true;
      };
      if (intro) {
        const b = pular.current!; b.hidden = false;
        const TOPO = ".hero h1 .palavra, .hero .sub, .hero .acoes, .hero .temas-rapidos";
        // pular mostra o topo na hora, sem esperar os passos da obra
        const pula = () => { pulou = true; document.querySelectorAll<HTMLElement>(TOPO).forEach((e) => mostra(e, 1)); ob.feixe = null; };
        b.onclick = pula;
        const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") pula(); };
        addEventListener("keydown", tecla);
        limpa = () => removeEventListener("keydown", tecla);
        const pecas: [string, number][] = [[".hero h1", 900], [".hero .sub", 1700], [".hero .acoes", 1100], [".hero .temas-rapidos", 1500]];
        enfileira(async () => {
          await espera(350);
          let feito = 0;
          for (let i = 0; i < pecas.length; i++) {
            if (!pulou) feito = i;
            const el = document.querySelector<HTMLElement>(pecas[i][0]);
            ob.bolha = `construindo ${Math.round((i / pecas.length) * 100)}%`;
            if (el) await constroi(el, pecas[i][1]);
          }
          document.querySelectorAll<HTMLElement>(TOPO).forEach((e) => mostra(e, 1));
          evento(pulou ? "Intro: pulada" : "Intro: assistida", pulou ? { em: `${Math.round((feito / pecas.length) * 100)}%` } : undefined);
          if (!pulou) { ob.bolha = "pronto!"; await espera(650); }
          ob.bolha = "";
          // o pulo para o chao: ele vira o Clawd que passeia
          window.dispatchEvent(new CustomEvent("obra-pronta", { detail: { x: ob.visivel ? ob.x : null, y: ob.y } }));
          ob.visivel = false; ob.alfa = 0;
          termina();
        });
      }

      // ---- as secoes: titulos e grupos de cartoes ---------------------------------------
      const titulos = [...document.querySelectorAll<HTMLElement>("main h2[data-titulo]")];
      const grupos = [...document.querySelectorAll<HTMLElement>("[data-obra-grupo]")];
      const pecasDe = (g: HTMLElement) => [...g.children].filter((c): c is HTMLElement => c instanceof HTMLElement && !c.hasAttribute("data-linha"));
      const abaixo = (el: HTMLElement) => el.getBoundingClientRect().top > innerHeight * 0.75;
      titulos.filter(abaixo).forEach((h) => h.querySelectorAll<HTMLElement>(".palavra").forEach((p) => mostra(p, 0)));
      grupos.filter(abaixo).forEach((g) => pecasDe(g).forEach((p) => mostra(p, 0)));
      const io = new IntersectionObserver((es) => es.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement; io.unobserve(el);
        if (el.hasAttribute("data-obra-grupo")) enfileira(async () => { for (const p of pecasDe(el)) await constroi(p, 2400); });
        else enfileira(() => constroi(el, 1100));
      }), { threshold: 0.35 });
      [...titulos, ...grupos].filter(abaixo).forEach((el) => io.observe(el));

      const antes = limpa;
      limpa = () => { antes(); io.disconnect(); removeEventListener("resize", redim); };
    });

    return () => { vivo = false; cancelAnimationFrame(raf); limpa(); };
  }, []);

  return (
    <>
      <canvas ref={ref} className="obra-tela" aria-hidden="true" />
      <button ref={pular} className="obra-pular" hidden>Pular <kbd>Esc</kbd></button>
    </>
  );
}
