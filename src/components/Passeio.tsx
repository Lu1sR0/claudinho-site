"use client";

import { useEffect, useRef } from "react";

import { FALAS_CLAWD, FALAS_SECAO } from "../content";
import { reducedMotion } from "../lib/motion";
import { evento } from "../lib/metricas";
import { carregaMotor } from "../lib/vivo";

// O Clawd que mora no rodape da tela: anda sozinho, olha o mouse, acena,
// vai ate o que voce aponta e comenta, corre quando a pagina rola rapido,
// pula no clique e pode ser arrastado (e cai, quica e fica tonto).

const LARANJA = "#d97757";
const CLIQUE = FALAS_CLAWD;
const G = 2600, CHAO = 10;

type Modo = "anda" | "para" | "arrastado" | "cai" | "tonto";

export function Passeio() {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = raiz.current!, cv = el.querySelector("canvas")!, balao = el.querySelector<HTMLElement>(".passeio-balao")!, sombra = el.querySelector<HTMLElement>(".passeio-sombra")!;
    const quieto = reducedMotion();
    let vivo = true, raf = 0, limpa = () => {};

    carregaMotor().then(({ CLAWD, desenhaClawd }) => {
      if (!vivo) return;
      const px = innerWidth < 640 ? 3 : 4, PW = px, PH = px * 2, MX = PW * 2, MT = PH * 2;
      const CW = CLAWD.W * PW + MX * 2, CH = CLAWD.H * PH + MT + px + 2, dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = CW * dpr; cv.height = CH * dpr; cv.style.width = CW + "px"; cv.style.height = CH + "px";
      const ctx = cv.getContext("2d")!;
      const limite = (x: number) => Math.max(6, Math.min(innerWidth - CW - 6, x));

      let modo: Modo = quieto ? "para" : "anda", x = quieto ? 16 : -CW - 20, alvo = 70, alt = 0, vx = 0, vy = 0, dir = 1;
      let ate = performance.now() + 1500, fase = 0, ultimo = performance.now(), correAte = 0, olharAte = 0, olharCima = false;
      let piscaAte = 0, proxPisca = 0, falaAte = 0, ultimaFala = 0, pendente = "", tontoAte = 0, jogado = false;
      // pendulo: pendurado no ponto onde foi pego, balanca com o mouse
      let ang = 0, angV = 0, pvx = 0, pvxAnt = 0, escondido = false;
      let mx: number | null = null, my = 0, ultimoScroll = scrollY, ultimoScrollT = performance.now(), scrollParado = performance.now();
      let segura: { dx: number; dy: number; x0: number; y0: number; moveu: boolean; amostras: [number, number, number][] } | null = null;

      const fala = (t: string, forcar = false) => {
        const agora = performance.now();
        if (!forcar && agora - ultimaFala < 5000) return;
        ultimaFala = agora; falaAte = agora + 2600;
        balao.textContent = t; balao.classList.add("on");
      };
      const novoAlvo = () => {
        const longe = Math.random() < 0.35;
        alvo = limite(longe ? Math.random() * innerWidth : x + (Math.random() - 0.5) * 360);
        modo = "anda";
      };
      // entrada: se o Clawd de capacete esta construindo o topo, nasce do pulo dele
      const entra = (e?: Event) => {
        const d = (e as CustomEvent<{ x: number | null; y: number }> | undefined)?.detail;
        escondido = false; cv.style.visibility = "";
        if (d && d.x != null) {
          x = d.x - MX; alt = Math.max(0, innerHeight - CHAO - CH + MT - d.y);
          modo = "cai"; vy = 300; vx = 160; jogado = false;
          fala("pronto! agora é com você", true);
        } else { alvo = limite(60 + Math.random() * 80); pendente = FALAS_SECAO.topo[0]; }
      };
      if (quieto) { /* fica parado no canto */ }
      else if (document.documentElement.classList.contains("obra")) { escondido = true; cv.style.visibility = "hidden"; addEventListener("obra-pronta", entra, { once: true }); }
      else setTimeout(entra, 900);

      // ---- input ----------------------------------------------------------------------
      const naCaixa = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
      const baixo = (e: PointerEvent) => {
        if (!naCaixa(e)) return;
        try { cv.setPointerCapture(e.pointerId); } catch { /* ponteiro ja solto */ }
        const r = cv.getBoundingClientRect();
        segura = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moveu: false, amostras: [] };
        pvx = pvxAnt = 0;
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType === "mouse") { mx = e.clientX; my = e.clientY; }
        if (!segura) return;
        if (!segura.moveu && Math.hypot(e.clientX - segura.x0, e.clientY - segura.y0) > 5 && !quieto) {
          segura.moveu = true; modo = "arrastado"; evento("Clawd: arrastado"); ang = angV = 0; cv.style.transformOrigin = `${segura.dx}px ${segura.dy}px`; fala("ei! me põe no chão", true);
        }
        if (modo !== "arrastado") return;
        x = e.clientX - segura.dx;
        alt = Math.max(0, innerHeight - CHAO - (e.clientY - segura.dy + CH));
        segura.amostras.push([e.clientX, e.clientY, performance.now()]);
        if (segura.amostras.length > 5) segura.amostras.shift();
        const am = segura.amostras;
        if (am.length > 1) { const a = am[am.length - 2], b = am[am.length - 1]; pvx = pvx * 0.5 + ((b[0] - a[0]) / Math.max(0.008, (b[2] - a[2]) / 1000)) * 0.5; }
      };
      const solta = () => {
        if (!segura) return;
        const s = segura; segura = null;
        if (!s.moveu) {
          evento("Clawd: clique", { onde: "passeio" });
          // clique: um pulo e uma frase
          if (!quieto && alt === 0) { modo = "cai"; vy = 620; vx = 0; jogado = false; }
          fala(CLIQUE[Math.floor(Math.random() * CLIQUE.length)], true);
          return;
        }
        const a = s.amostras, p = a[0], u = a[a.length - 1], dt = Math.max(0.016, (u[2] - p[2]) / 1000);
        vx = Math.max(-1400, Math.min(1400, (u[0] - p[0]) / dt)); vy = Math.max(-1600, Math.min(1600, -(u[1] - p[1]) / dt));
        modo = "cai"; jogado = true;
      };
      cv.addEventListener("pointerdown", baixo);
      addEventListener("pointermove", move, { passive: true });
      addEventListener("pointerup", solta); addEventListener("pointercancel", solta);

      // apontar para algo marcado com data-clawd-alvo: ele vai ate la e comenta
      const aponta = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || quieto || modo === "arrastado" || modo === "cai") return;
        const a = (e.target as Element).closest<HTMLElement>("[data-clawd-alvo]");
        if (!a || performance.now() - ultimaFala < 4000) return;
        const r = a.getBoundingClientRect();
        alvo = limite(r.left + r.width / 2 - CW / 2); pendente = a.dataset.clawdAlvo || ""; modo = "anda";
      };
      document.addEventListener("pointerover", aponta);

      // rolagem: correr no sentido da rolagem; um pulinho quando ela comeca
      const rola = () => {
        const agora = performance.now(), dy = scrollY - ultimoScroll, dt = Math.max(16, agora - ultimoScrollT) / 1000, v = dy / dt;
        if (!quieto && agora - scrollParado > 2500 && alt === 0 && modo === "para") { modo = "cai"; vy = 380; vx = 0; jogado = false; }
        scrollParado = agora; ultimoScroll = scrollY; ultimoScrollT = agora;
        if (quieto || modo === "arrastado" || modo === "cai") return;
        if (Math.abs(v) > 1600 && agora > correAte) {
          // corre um trecho no sentido da rolagem; encostado na borda, volta
          let d = (v > 0 ? 1 : -1) * (180 + Math.random() * 220);
          if (limite(x + d) === x) d = -d;
          correAte = agora + 900; alvo = limite(x + d); modo = "anda";
        }
      };
      addEventListener("scroll", rola, { passive: true });

      // cada secao que entra na tela ganha um comentario
      const vistas = new Set<string>();
      const io = new IntersectionObserver((es) => es.forEach((en) => {
        const id = (en.target as HTMLElement).id;
        if (!en.isIntersecting || !FALAS_SECAO[id]) return;
        const lista = FALAS_SECAO[id], frase = vistas.has(id) ? lista[1 + Math.floor(Math.random() * (lista.length - 1))] : lista[0];
        vistas.add(id);
        setTimeout(() => { if (modo === "para" || modo === "anda") fala(frase); }, 700);
      }), { threshold: 0.4 });
      Object.keys(FALAS_SECAO).forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });

      const redim = () => { x = limite(x); alvo = limite(alvo); };
      addEventListener("resize", redim);

      limpa = () => {
        cv.removeEventListener("pointerdown", baixo); removeEventListener("pointermove", move); removeEventListener("pointerup", solta); removeEventListener("pointercancel", solta);
        document.removeEventListener("pointerover", aponta); removeEventListener("obra-pronta", entra); removeEventListener("scroll", rola); removeEventListener("resize", redim); io.disconnect();
      };

      // ---- loop -----------------------------------------------------------------------
      const quadro = (ms: number) => {
        if (!vivo) return;
        raf = requestAnimationFrame(quadro);
        const dt = Math.min(0.05, (ms - ultimo) / 1000); ultimo = ms;
        if (escondido) return;
        const t = ms / 1000, cx = x + CW / 2, cy = innerHeight - CHAO - alt - CH / 2;
        const perto = mx != null ? Math.hypot(mx - cx, my - cy) : 1e9;
        if (ms > proxPisca) { piscaAte = ms + 140; proxPisca = ms + 2000 + Math.random() * 3500; }

        let olhar: [number, number] = [0, 0], braco: [number, number] = [0, 0], pernas = [0, 0, 0, 0], bob = 0, fechado = ms < piscaAte;
        if (modo === "anda") {
          const correndo = ms < correAte, vel = correndo ? 300 : 78;
          dir = Math.sign(alvo - x) || dir;
          x += dir * vel * dt; fase += dt * (correndo ? 16 : 8);
          const passo = Math.floor(fase) % 2;
          pernas = passo ? [px, 0, px, 0] : [0, px, 0, px]; bob = passo ? -1 : 0; olhar = [dir, 0];
          if (correndo) braco = passo ? [1, 0] : [0, 1];
          if ((dir > 0 && x >= alvo) || (dir < 0 && x <= alvo)) {
            x = alvo; modo = "para"; ate = ms + 1400 + Math.random() * 2600;
            if (pendente) { fala(pendente, true); pendente = ""; olharCima = true; olharAte = ms + 1800; }
          }
        } else if (modo === "para") {
          if (olharCima && ms < olharAte) olhar = [0, -1];
          else if (mx != null && perto < 260) olhar = [Math.abs(mx - cx) < 30 ? 0 : Math.sign(mx - cx), my < cy - 60 ? -1 : 0];
          else olhar = [Math.floor(t / 1.7) % 3 - 1, 0];
          if (mx != null && perto < 120) braco = [0, Math.floor(t * 5) % 2 ? 2 : 1];
          bob = Math.round(Math.sin(t * 2)) * 0.5;
          if (!quieto && ms > ate && perto > 120) novoAlvo();
        } else if (modo === "arrastado") {
          // pendulo: a aceleracao do mouse empurra, a gravidade traz de volta
          const acc = (pvx - pvxAnt) / Math.max(dt, 0.008); pvxAnt = pvx; pvx *= Math.exp(-6 * dt);
          angV += (-17 * Math.sin(ang) + acc * 0.0018 + pvx * 0.0016) * dt;
          angV *= Math.exp(-0.6 * dt); ang = Math.max(-1.3, Math.min(1.3, ang + angV * dt));
          if (Math.abs(angV) > 7) fala("uiii!");
          braco = [2, 2]; olhar = [ang > 0.2 ? -1 : ang < -0.2 ? 1 : 0, 1];
          pernas = angV > 0 ? [-px, 0, -px, 0] : [0, -px, 0, -px];
        } else if (modo === "cai") {
          vy -= G * dt; alt += vy * dt; x += vx * dt; vx *= 0.995; ang *= Math.exp(-5 * dt);
          if (x < 6 || x > innerWidth - CW - 6) { vx = -vx * 0.5; x = limite(x); }
          braco = vy > 0 ? [1, 1] : [2, 2]; pernas = vy > 0 ? [px, px, px, px] : [-px, -px, -px, -px];
          if (alt <= 0) {
            alt = 0; ang = 0; cv.style.transformOrigin = "";
            if (vy < -700) { vy = -vy * 0.32; vx *= 0.6; }
            else if (jogado && vy < -380) { evento("Clawd: tonto"); modo = "tonto"; tontoAte = ms + 1300; vx = 0; fala("ufa…", true); }
            else { modo = "para"; ate = ms + 1200; vx = 0; }
          }
        } else if (modo === "tonto") {
          fechado = Math.floor(t * 6) % 2 === 0; olhar = [Math.round(Math.sin(t * 9)), 0];
          if (ms > tontoAte) { modo = "para"; ate = ms + 1500; }
        }
        if (modo !== "arrastado") x = modo === "anda" && x < 6 ? x : limite(x);

        // desenho
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, CW, CH);
        desenhaClawd(ctx, { x: MX, y: MT + bob, pw: PW, ph: PH, cor: LARANJA, olhar, fechado, braco, pernas });
        if (modo === "tonto") {
          ctx.fillStyle = "#f5c66b";
          for (let k = 0; k < 3; k++) { const a = t * 6 + (k * Math.PI * 2) / 3; ctx.fillRect(Math.round(CW / 2 + Math.cos(a) * PW * 5 - px / 2), Math.round(MT - PH * 0.6 + Math.sin(a) * PH * 0.5), px, px); }
        }
        const inclina = modo === "arrastado" || (modo === "cai" && Math.abs(ang) > 0.01) ? ang : modo === "cai" ? vx * 0.0003 : 0;
        cv.style.transform = `translate3d(${Math.round(x)}px, ${-Math.round(alt)}px, 0) rotate(${inclina}rad)`;
        sombra.style.transform = `translate3d(${Math.round(x + CW / 2 - 30)}px, 0, 0) scale(${Math.max(0.35, 1 - alt / 260)})`;
        sombra.style.opacity = String(Math.max(0.15, 0.5 - alt / 500));
        const meio = balao.offsetWidth / 2 + 8, bx = Math.max(meio, Math.min(innerWidth - meio, x + CW / 2));
        balao.style.transform = `translate3d(${Math.round(bx)}px, ${-Math.round(alt + CH + 10)}px, 0) translateX(-50%)`;
        if (ms > falaAte) balao.classList.remove("on");
      };
      raf = requestAnimationFrame(quadro);
    });

    return () => { vivo = false; cancelAnimationFrame(raf); limpa(); };
  }, []);

  return (
    <div ref={raiz} className="passeio" aria-hidden="true">
      <span className="passeio-sombra" />
      <span className="passeio-balao" />
      <canvas title="Clawd: clique, ou arraste" />
    </div>
  );
}
