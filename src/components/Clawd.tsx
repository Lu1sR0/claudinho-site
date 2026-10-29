"use client";

// O Clawd em canvas, nas poses do app: "olha" segue o mouse com os olhos e
// acena quando o mouse passa por cima; "digita" trabalha; "treina" levanta a
// barra (o folego desce com o tempo); "dorme" fica com os olhos fechados e
// solta z. Um clique faz ele pular.

import { useEffect, useRef } from "react";

import { evento } from "../lib/metricas";
import { carregaMotor } from "../lib/vivo";
import { fonteMono } from "../lib/fonte";

export type Pose = "olha" | "digita" | "treina" | "dorme";
type Props = { pose?: Pose; px?: number; className?: string; fala?: string[]; onde?: string };

const LARANJA = "#d97757";

export function Clawd({ pose = "olha", px = 6, className, fala, onde = "topo" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null), balao = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    let vivo = true, raf = 0, mx: number | null = null, my: number | null = null, dentro = false, pulo = -9, fase = 0, ultimo = performance.now(), proxPisca = 0, piscaAte = 0, timer = 0;
    const gotas: { x: number; y: number; vx: number; vy: number; t: number }[] = [], zs: { x: number; y: number; t: number }[] = [];
    const move = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const entra = () => { dentro = true; mostra(fala?.[0] ?? "oi"); };
    const sai = () => (dentro = false);
    const clica = () => { pulo = performance.now(); evento("Clawd: clique", { onde, pose }); if (fala?.length) mostra(fala[Math.floor(Math.random() * fala.length)]); };
    const mostra = (t: string) => {
      const b = balao.current; if (!b) return;
      b.textContent = t; b.classList.add("on"); clearTimeout(timer);
      timer = window.setTimeout(() => b.classList.remove("on"), 2200);
    };
    addEventListener("pointermove", move, { passive: true });
    cv.addEventListener("pointerenter", entra); cv.addEventListener("pointerleave", sai); cv.addEventListener("click", clica);

    carregaMotor().then(({ CLAWD, desenhaClawd, desenhaSupino, desenhaBarraPixel }) => {
      if (!vivo) return;
      // a barra pede espaco: 8 celulas para cada lado e, levantada, 8 acima da cabeca
      const comBarra = pose === "treina" || pose === "dorme";
      const PW = px, PH = px * 2, M = comBarra ? px * 9 : px * 6, MT = pose === "treina" ? px * 10 : px * 6;
      const W = CLAWD.W * PW + M * 2, H = CLAWD.H * PH + MT + px * 6, dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
      const ctx = cv.getContext("2d")!;
      const loop = (ms: number) => {
        if (!vivo) return;
        raf = requestAnimationFrame(loop);
        const r = cv.getBoundingClientRect();
        if (r.bottom < -50 || r.top > innerHeight + 50) return;
        const dt = Math.min(0.05, (ms - ultimo) / 1000); ultimo = ms;
        const t = ms / 1000, cx = r.left + W / 2, cy = r.top + MT + PH * 1.5;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        if (ms > proxPisca) { piscaAte = ms + 140; proxPisca = ms + 2200 + Math.random() * 3600; }
        let dy = Math.sin(t * 1.8) * px * 0.25;
        const p = (ms - pulo) / 650; if (p >= 0 && p < 1) dy -= Math.sin(p * Math.PI) * px * 4;
        const olhar = mx != null && pose === "olha" ? [Math.abs(mx - cx) < 40 ? 0 : Math.sign(mx - cx), my! < cy - 80 ? -1 : 0] : pose === "digita" ? [1, 0] : [0, 0];
        const baseY = MT;
        // ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.ellipse(W / 2, baseY + CLAWD.H * PH + px * 1.2, CLAWD.W * PW / 2.3, px * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        if (pose === "treina") {
          fase += dt * 1.6;
          const sobe = (1 - Math.cos(fase * Math.PI * 2)) / 2;
          desenhaSupino(ctx, { x: M, y: baseY, pw: PW, ph: PH, cor: LARANJA, sobe, fechado: ms < piscaAte || sobe > 0.85 });
          if (Math.random() < dt * 1.2) gotas.push({ x: M + (Math.random() < 0.5 ? 0 : CLAWD.W * PW), y: baseY + px, vx: (Math.random() - 0.5) * 50, vy: -40 - Math.random() * 30, t: ms });
        } else if (pose === "dorme") {
          desenhaBarraPixel(ctx, W / 2, baseY + CLAWD.H * PH - 4 * PW, PW);
          desenhaClawd(ctx, { x: M, y: baseY + Math.round(px * 1.3 + Math.round(Math.sin(t * 1.2)) * px * 0.3), pw: PW, ph: PH, cor: LARANJA, fechado: true, pernas: [px, px, px, px] });
          if (Math.random() < dt * 0.9) zs.push({ x: W - M - px * 2, y: baseY, t: ms });
        } else {
          const digita = pose === "digita";
          const braco = digita ? [(Math.floor(t * 8) % 2) * 0.5, ((Math.floor(t * 8) + 1) % 2) * 0.5] : dentro ? [0, Math.floor(t * 5) % 2 ? 2 : 1] : [0, 0];
          const pernas = digita ? [0, (Math.floor(t * 8) % 2) * px * 0.5, 0, ((Math.floor(t * 8) + 1) % 2) * px * 0.5] : [0, 0, 0, 0];
          desenhaClawd(ctx, { x: M, y: baseY + dy, pw: PW, ph: PH, cor: LARANJA, olhar, fechado: ms < piscaAte, braco, pernas });
          if (digita) for (let k = 0; k < 3; k++) { const f = (t * 1.4 + k / 3) % 1; ctx.globalAlpha = Math.sin(f * Math.PI); ctx.fillStyle = LARANJA; ctx.fillRect(M + 10 * PW + k * px * 1.4, baseY - px - f * px * 3, px * 0.6, px * 0.6); ctx.globalAlpha = 1; }
        }
        for (let k = gotas.length - 1; k >= 0; k--) { const g = gotas[k], s = (ms - g.t) / 1000; if (s > 0.9) { gotas.splice(k, 1); continue; } ctx.globalAlpha = 1 - s / 0.9; ctx.fillStyle = "#8fc9e8"; ctx.fillRect(g.x + g.vx * s, g.y + g.vy * s + 140 * s * s, Math.max(2, px * 0.45), Math.max(3, px * 0.8)); }
        for (let k = zs.length - 1; k >= 0; k--) { const z = zs[k], s = (ms - z.t) / 1000; if (s > 2) { zs.splice(k, 1); continue; } ctx.globalAlpha = Math.sin((s / 2) * Math.PI); ctx.fillStyle = "#ecebe7"; ctx.font = `600 ${px * 2}px ${fonteMono()}`; ctx.fillText("z", z.x + Math.sin(s * 3) * px, z.y - s * px * 4); }
        ctx.globalAlpha = 1;
      };
      raf = requestAnimationFrame(loop);
    });
    return () => { vivo = false; cancelAnimationFrame(raf); clearTimeout(timer); removeEventListener("pointermove", move); cv.removeEventListener("pointerenter", entra); cv.removeEventListener("pointerleave", sai); cv.removeEventListener("click", clica); };
  }, [pose, px, fala]);

  return (
    <span className={`clawd ${className ?? ""}`}>
      <span ref={balao} className="clawd-balao" />
      <canvas ref={ref} role="img" aria-label="Clawd, o mascote em pixel do Claude Code" />
    </span>
  );
}
