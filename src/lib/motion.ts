import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;

/** Scroll suave (Lenis) dirigindo o ScrollTrigger pelo mesmo relogio do GSAP. */
export function startSmoothScroll() {
  if (lenis || reducedMotion()) return;
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Rola ate uma secao respeitando o Lenis quando ele existe. */
export function scrollToTarget(alvo: string, offset = -24) {
  const el = document.querySelector<HTMLElement>(alvo);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reducedMotion() ? "auto" : "smooth" });
}

/** Elementos com [data-surge] sobem e aparecem quando entram na tela. */
export function setupReveals() {
  if (reducedMotion()) return () => {};
  // revert() devolve o estilo original: sem isso, o efeito rodando duas vezes
  // (StrictMode) partiria de opacity 0 e o elemento nunca apareceria.
  const ctx = gsap.context(() => {
    gsap.utils.toArray<HTMLElement>("[data-surge]").forEach((el) =>
      gsap.from(el, {
        y: 36, opacity: 0, duration: 1, ease: "expo.out",
        delay: Number(el.dataset.surge) || 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }),
    );
    // as telas de "Por dentro" abrem de um recorte enquanto a pagina rola
    gsap.utils.toArray<HTMLElement>("[data-abre]").forEach((el) =>
      gsap.fromTo(el, { clipPath: "inset(9% 7% 9% 7% round 28px)", scale: 0.94 }, {
        clipPath: "inset(0% 0% 0% 0% round 16px)", scale: 1, ease: "none",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.6 },
      }),
    );
    // parallax suave
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) =>
      gsap.fromTo(el, { y: Number(el.dataset.parallax) || 60 }, {
        y: -(Number(el.dataset.parallax) || 60), ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      }),
    );
    // a linha que liga os passos se enche enquanto passa
    gsap.utils.toArray<HTMLElement>("[data-linha]").forEach((el) =>
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 80%", end: "bottom 60%", scrub: 0.5 } }),
    );
  });
  return () => ctx.revert();
}

/** Luz que segue o mouse nos cartoes, inclinacao 3D e botoes magneticos. */
export function setupInteracoes() {
  if (reducedMotion() || !matchMedia("(hover: hover)").matches) return () => {};
  const move = (e: PointerEvent) => {
    const alvo = e.target as Element;
    const luz = alvo.closest<HTMLElement>(".luz");
    if (luz) {
      const r = luz.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      luz.style.setProperty("--mx", `${x * 100}%`); luz.style.setProperty("--my", `${y * 100}%`);
      if (luz.classList.contains("inclina")) gsap.to(luz, { rotateY: (x - 0.5) * 10, rotateX: (0.5 - y) * 10, transformPerspective: 700, duration: 0.5, ease: "power3.out" });
    }
    const mag = alvo.closest<HTMLElement>(".magnetico");
    if (mag) {
      const r = mag.getBoundingClientRect();
      gsap.to(mag, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: "power3.out" });
    }
  };
  // so quando o mouse sai de verdade (nao quando passa para um filho)
  const sai = (e: PointerEvent) => {
    const de = e.target as Element, para = e.relatedTarget as Node | null;
    const card = de.closest?.<HTMLElement>(".inclina"), mag = de.closest?.<HTMLElement>(".magnetico");
    if (card && !card.contains(para)) gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" });
    if (mag && !mag.contains(para)) gsap.to(mag, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerout", sai, true);
  return () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", sai, true); };
}

/** A faixa corre sozinha e acelera (e entorta) com a velocidade da rolagem. */
export function animaFaixa(trilho: HTMLElement) {
  if (reducedMotion()) return () => {};
  let pos = 0, vel = 0, ultimo = scrollY;
  const tick = () => {
    const d = scrollY - ultimo; ultimo = scrollY;
    vel += (d - vel) * 0.12;
    const metade = trilho.scrollWidth / 2;
    pos -= 0.55 + Math.min(14, Math.abs(vel) * 0.35);
    if (pos <= -metade) pos += metade;
    trilho.style.transform = `translate3d(${pos}px,0,0) skewX(${Math.max(-12, Math.min(12, -vel * 0.4))}deg)`;
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
