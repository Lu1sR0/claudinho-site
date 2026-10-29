"use client";

// Um papel de parede vivo do Claudinho, com o mesmo motor do app: ASCII em
// ladrilhos, agua que responde ao mouse, clique que faz cada tema reagir e a
// transicao em onda ao trocar de tema. So anima quando esta na tela.

import { useEffect, useRef } from "react";

import { evento } from "../lib/metricas";
import { carregaMotor, type Motor, type Tema } from "../lib/vivo";

type Props = { tema: string; className?: string; escala?: number; aoMudarClaro?: (claro: boolean) => void };

export function Vivo({ tema, className, escala = 1, aoMudarClaro }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const estado = useRef<{ motor?: Motor; big?: ReturnType<Motor["Renderer"]>; atual?: Tema; t0: number }>({ t0: performance.now() });
  const avisa = useRef(aoMudarClaro);
  avisa.current = aoMudarClaro;

  useEffect(() => {
    const cv = ref.current!;
    let vivo = true, visivel = true, raf = 0, ultimo = performance.now();
    let cru: { x: number; y: number } | null = null, mouse: { x: number; y: number; vx: number; vy: number; v: number } | null = null, ultimaOnda: { x: number; y: number } | null = null;
    const agora = () => (performance.now() - estado.current.t0) / 1000;
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { rootMargin: "120px" });
    io.observe(cv);
    const local = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, dentro: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom }; };
    const move = (e: PointerEvent) => { const p = local(e); cru = p.dentro ? p : null; if (p.dentro && estado.current.atual) estado.current.big?.mark(p.x, p.y); };
    const clica = (e: PointerEvent) => {
      const p = local(e), s = estado.current;
      if (!p.dentro || !s.atual || (e.target as HTMLElement).closest("a, button, input, .passeio, .clawd")) return;
      s.atual.click?.(p.x, p.y, agora(), s.big);
      evento("Fundo clicado", { tema: s.atual.id }, { intervalo: 2000 });
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", clica);

    carregaMotor().then((motor) => {
      if (!vivo) return;
      const s = estado.current;
      s.motor = motor;
      s.big = motor.Renderer(cv, { cw: 14 * escala, ch: 20 * escala, ss: 3 });
      const ajusta = () => { const r = cv.getBoundingClientRect(); s.big.resize(r.width, r.height); };
      ajusta();
      const ro = new ResizeObserver(ajusta); ro.observe(cv);
      const loop = (ms: number) => {
        if (!vivo) { ro.disconnect(); return; }
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (ms - ultimo) / 1000); ultimo = ms;
        if (!visivel || !s.atual) return;
        const t = agora();
        if (cru) {
          mouse ??= { x: cru.x, y: cru.y, vx: 0, vy: 0, v: 0 };
          const nx = mouse.x + (cru.x - mouse.x) * Math.min(1, dt * 14), ny = mouse.y + (cru.y - mouse.y) * Math.min(1, dt * 14);
          const vx = (nx - mouse.x) / (dt || 0.016), vy = (ny - mouse.y) / (dt || 0.016);
          mouse = { x: nx, y: ny, vx, vy, v: mouse.v + (Math.hypot(vx, vy) - mouse.v) * Math.min(1, dt * 8) };
        } else mouse = null;
        if (mouse && s.atual.wake && mouse.v > 160 && (!ultimaOnda || Math.hypot(mouse.x - ultimaOnda.x, mouse.y - ultimaOnda.y) > 90)) {
          ultimaOnda = { x: mouse.x, y: mouse.y };
          s.big.add(motor.ripple(mouse.x, mouse.y, t, { speed: 140, life: 1.1, force: 160, alpha: 0.45 }));
        }
        s.big.frame(s.atual, t, dt, mouse && { x: mouse.x, y: mouse.y, vx: mouse.vx, vy: mouse.vy, speed: mouse.v });
        const dentro = new Set<string>();
        if (mouse) for (const h of s.big.hits) if (Math.hypot(mouse.x - h.x, mouse.y - h.y) < h.r) { dentro.add(h.key); if (!s.big.hover.has(h.key)) s.big.hover.set(h.key, t); }
        for (const key of [...s.big.hover.keys()]) if (!dentro.has(key) && t - s.big.hover.get(key) > 2.5) s.big.hover.delete(key);
      };
      raf = requestAnimationFrame(loop);
      trocaTema(tema);
    });
    return () => { vivo = false; cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", move); removeEventListener("pointerdown", clica); };
    // o tema muda pelo efeito abaixo; este so monta o motor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function trocaTema(id: string) {
    const s = estado.current;
    if (!s.motor || !s.big) return;
    const novo = s.motor.THEMES.find((x) => x.id === id);
    if (!novo || novo === s.atual) return;
    if (s.atual && s.big.W > 0) { try { s.big.transicao(s.big.W / 2, s.big.H / 2, (performance.now() - s.t0) / 1000); } catch { /* sem quadro anterior */ } }
    s.atual = novo; s.big.reset();
    avisa.current?.(!!novo.light);
  }
  useEffect(() => { trocaTema(tema); }, [tema]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
