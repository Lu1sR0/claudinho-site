"use client";

import { useEffect, useRef, useState } from "react";

import { Baixar, useSistema } from "./components/Baixar";
import { Clawd } from "./components/Clawd";
import { DemoDiff, DemoPlano, DemoRaciocinio } from "./components/Demos";
import { Obra } from "./components/Obra";
import { Passeio } from "./components/Passeio";
import { Titulo } from "./components/Titulo";
import { Vivo } from "./components/Vivo";
import { DUVIDAS, FALAS_CLAWD, PASSOS, PERSONALIZAR, RECURSOS, TELAS, TEMAS_VITRINE } from "./content";
import { animaFaixa, gsap, reducedMotion, ScrollTrigger, scrollToTarget, setupInteracoes, setupReveals, startSmoothScroll } from "./lib/motion";

const GLIFOS = ["·", "✢", "✳", "✶", "✻", "✽"];

// "Peca um tema": palavras que levam a cada tema (no app, quem entende e o Claude)
const PALAVRAS: [RegExp, string][] = [
  [/claude|anthropic|laranja|da casa/i, "claude"],
  [/espa[cç]|gal[aá]x|estrela|planeta|universo|lua|cosmo/i, "galaxia"],
  [/tartaruga|mar|praia|[aá]gua|lagoa|oceano|honu|ilha/i, "lagoon"],
  [/peixe|carpa|koi|lago/i, "koi"],
  [/fogo|lareira|frio|quent|aconcheg|inverno|cabana/i, "lareira"],
  [/flor|sakura|cerejeira|jap[aã]o|rosa|primavera|jardim/i, "sakura"],
  [/chuva|lo-?fi|estud|relax|calm|janela|noite|foco/i, "chuva"],
  [/jogo|arcade|retr[oô]|game|nave|alien|pixel|fliperama/i, "arcade"],
];

function PedeTema({ aoEscolher }: { aoEscolher: (id: string) => void }) {
  const [texto, setTexto] = useState(""), [resposta, setResposta] = useState(""), [ocupado, setOcupado] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  const pede = (t: string) => {
    t = t.trim();
    if (!t || ocupado) return;
    const achou = PALAVRAS.find(([re]) => re.test(t));
    const outros = TEMAS_VITRINE.slice(1), tema = achou ? TEMAS_VITRINE.find((x) => x.id === achou[1])! : outros[Math.floor(Math.random() * outros.length)];
    const frase = achou ? `Trocando para ${tema.nome}.` : `Não tenho um tema assim, mas ${tema.nome} combina. Trocando.`;
    setTexto(""); setOcupado(true); setResposta("");
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1; setResposta(frase.slice(0, i));
      if (i >= frase.length) { clearInterval(timer.current); setOcupado(false); aoEscolher(tema.id); }
    }, 24);
  };
  return (
    <form className="pede" onSubmit={(e) => { e.preventDefault(); pede(texto); }}>
      {resposta && <p className="pede-resposta" aria-live="polite"><i aria-hidden="true">✻</i>{resposta}</p>}
      <div className="pede-campo">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Peça um tema: “quero chuva pra estudar”" aria-label="Peça um tema ao Claude" maxLength={80} />
        <button type="submit" aria-label="Enviar" disabled={ocupado}>↑</button>
      </div>
      <div className="pede-sugestoes">
        {["algo espacial", "um lago com peixes", "frio, quero fogo"].map((x) => <button type="button" key={x} onClick={() => pede(x)} data-clawd-alvo="pede, pede!">{x}</button>)}
      </div>
    </form>
  );
}

const PALETAS_SITE: [string, string, string][] = [
  ["Claude", "#d97757", "#e8936f"], ["Oceano", "#3fb6d9", ""], ["Neon", "#ff3ea5", ""],
  ["Floresta", "#5fb08a", ""], ["Ouro", "#e7b549", ""], ["Lavanda", "#a78bfa", ""],
];

function Paletas() {
  const [on, setOn] = useState("Claude");
  const aplica = ([nome, cor, cor2]: [string, string, string]) => {
    setOn(nome);
    const r = document.documentElement.style;
    r.setProperty("--acento", cor); r.setProperty("--acento-2", cor2 || `color-mix(in srgb, ${cor} 78%, white)`);
  };
  return (
    <div className="paletas">
      <span>Teste aqui: as cores desta página mudam.</span>
      <div role="group" aria-label="Cor de destaque">
        {PALETAS_SITE.map((p) => (
          <button key={p[0]} className={on === p[0] ? "on" : ""} onClick={() => aplica(p)} aria-pressed={on === p[0]} title={p[0]} data-clawd-alvo={`${p[0].toLowerCase()} fica bonito`}>
            <i style={{ background: p[1] }} /><span>{p[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Tela({ id, alt, className, prioridade }: { id: string; alt: string; className?: string; prioridade?: boolean }) {
  return (
    <img
      className={className}
      src={`/assets/telas/${id}-1440.webp`}
      srcSet={`/assets/telas/${id}-960.webp 960w, /assets/telas/${id}-1440.webp 1440w`}
      sizes="(max-width: 900px) 100vw, 1100px"
      width={1440}
      height={920}
      alt={alt}
      loading={prioridade ? "eager" : "lazy"}
      fetchPriority={prioridade ? "high" : "auto"}
      decoding="async"
    />
  );
}

function Nav() {
  const [solida, setSolida] = useState(false);
  useEffect(() => {
    const f = () => setSolida(window.scrollY > 40);
    f(); addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`nav ${solida ? "solida" : ""}`}>
      <a href="#topo" className="marca" onClick={(e) => { e.preventDefault(); scrollToTarget("#topo", 0); }}>
        <img src="/icone.png" alt="" width={28} height={28} />
        <span>Claudinho</span>
      </a>
      <nav aria-label="Seções">
        {[["#temas", "Temas"], ["#clawd", "Clawd"], ["#recursos", "Recursos"], ["#por-dentro", "Por dentro"], ["#duvidas", "Dúvidas"]].map(([h, n]) => (
          <a key={h} href={h} onClick={(e) => { e.preventDefault(); scrollToTarget(h); }}>{n}</a>
        ))}
      </nav>
      <a className="botao pequeno" href="#baixar" onClick={(e) => { e.preventDefault(); scrollToTarget("#baixar"); }}>Baixar</a>
    </header>
  );
}

function Hero() {
  const [tema, setTema] = useState("claude");
  const [claro, setClaro] = useState(false);
  const sistema = useSistema();
  useEffect(() => {
    if (reducedMotion()) return;
    // na primeira visita o Clawd de capacete monta o topo (Obra); nas outras, entra animado
    const obra = document.documentElement.classList.contains("obra");
    const ctx = gsap.context(() => {
      gsap.from(".hero-fundo", { scale: 1.12, opacity: 0, duration: 2.2, ease: "expo.out" });
      gsap.from(".hero .selo", { y: -16, opacity: 0, scale: 0.9, duration: 0.9, ease: "back.out(2)", delay: 0.1 });
      if (!obra) {
        gsap.from(".hero h1 .palavra > span", { yPercent: 115, rotate: 5, duration: 1.2, ease: "expo.out", stagger: 0.06, delay: 0.2 });
        gsap.from(".hero .sub, .hero .acoes, .hero .temas-rapidos", { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.55 });
        gsap.from(".hero .janela", { y: 120, opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.45 });
      }
      gsap.fromTo(".hero .janela", { rotateX: 14 }, { rotateX: 0, y: -40, ease: "none", scrollTrigger: { trigger: ".hero .janela", start: "top 95%", end: "bottom 30%", scrub: true } });
    });
    return () => ctx.revert();
  }, []);
  return (
    <section id="topo" className={`hero ${claro ? "claro" : ""}`}>
      <Vivo tema={tema} className="hero-fundo" aoMudarClaro={setClaro} />
      <div className="hero-conteudo">
        <p className="selo"><span>✻</span> Gratuito e aberto · feito com o Claude Code</p>
        <Titulo nivel={1} partes={["O seu Claude Code, ", ["agora com mais vida."]]} />
        <p className="sub">Um app de desktop que conversa com o Claude Code de verdade, com papéis de parede em ASCII que se mexem, o Clawd do seu lado e tudo o que você já usa: arquivos, comandos, MCPs e permissões.</p>
        <div className="acoes">
          <a className="botao magnetico" href="#baixar" data-clawd-alvo="clica, clica!" onClick={(e) => { e.preventDefault(); scrollToTarget("#baixar"); }}>
            {sistema === "mac" ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-4.2zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" /></svg> : sistema === "windows" ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5 10.5 4.5v7H3zM11.5 4.3 21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" /></svg> : null}
            {sistema === "mac" ? "Baixar para Mac" : sistema === "windows" ? "Baixar para Windows" : "Baixar o Claudinho"}
          </a>
          <a className="botao fantasma magnetico" href="#por-dentro" onClick={(e) => { e.preventDefault(); scrollToTarget("#por-dentro"); }}>Ver por dentro</a>
        </div>
        <div className="temas-rapidos" role="group" aria-label="Trocar o papel de parede do topo">
          {TEMAS_VITRINE.slice(0, 5).map((t) => (
            <button key={t.id} className={tema === t.id ? "on" : ""} onClick={() => setTema(t.id)} data-clawd-alvo={t.id === "claude" ? "esse é o da casa" : "esse é bonito"}>{t.nome}</button>
          ))}
          <span className="dica">{sistema === "celular" ? "toque no fundo ✻ arraste o Clawd" : "passe o mouse no fundo ✻ clique nele"}</span>
        </div>
      </div>
      <div className="janela-palco">
        <div className="janela">
          <Tela id="conversa" alt={TELAS[0].alt} prioridade />
        </div>
      </div>
    </section>
  );
}

function Faixa() {
  const itens = ["Papéis de parede vivos", "O Clawd do seu lado", "Permissões com diff", "Desfazer e ramificar", "Fila e plano", "Várias janelas", "278 animações ASCII", "Vídeo, imagem e GIF de fundo", "Música e sons seus", "Uso do plano com o Clawd na academia"];
  const linha = itens.flatMap((t, i) => [<span key={`t${i}`}>{t}</span>, <i key={`g${i}`}>{GLIFOS[(i % 5) + 1]}</i>]);
  const trilho = useRef<HTMLDivElement>(null);
  useEffect(() => animaFaixa(trilho.current!), []);
  return (
    <div className="faixa" aria-hidden="true">
      <div className="faixa-trilho" ref={trilho}>{linha}{linha}</div>
    </div>
  );
}

function Temas() {
  const [tema, setTema] = useState<string>(TEMAS_VITRINE[0].id);
  const atual = TEMAS_VITRINE.find((t) => t.id === tema)!;
  return (
    <section id="temas" className="secao temas">
      <div className="cabeca" data-surge>
        <p className="rotulo">Papéis de parede vivos</p>
        <Titulo partes={["O fundo ", ["respira"], " enquanto você trabalha."]} />
        <p className="texto">Quinze temas desenhados em ladrilhos de ASCII, cada um com música e sons próprios. A água responde ao mouse, as carpas fogem, o fogo estala no clique. Quando o Claude está pensando, o fundo pensa junto.</p>
      </div>
      <div className="vitrine" data-surge>
        <div className="vitrine-tela">
          <Vivo tema={tema} className="vitrine-canvas" />
          <p className="legenda"><b>{atual.nome}</b> · {atual.nota}</p>
          <PedeTema aoEscolher={setTema} />
        </div>
        <ul className="vitrine-lista" role="list">
          {TEMAS_VITRINE.map((t) => (
            <li key={t.id}><button className={t.id === tema ? "on" : ""} onClick={() => setTema(t.id)} onMouseEnter={() => setTema(t.id)} data-clawd-alvo={`${t.nome}! ${t.nota}`}>{t.nome}</button></li>
          ))}
          <li className="mais">+ 7 temas, 278 animações da biblioteca ASCII Magic e os seus vídeos, imagens e GIFs</li>
        </ul>
      </div>
    </section>
  );
}

function ClawdSecao() {
  const cards = [
    { pose: "olha" as const, titulo: "Fica do seu lado", texto: "Segue o mouse com os olhos, acena, pula no clique e comenta o projeto de tempos em tempos." },
    { pose: "digita" as const, titulo: "Trabalha junto", texto: "Digita quando o Claude escreve, avisa \"editando…\" e \"rodando comando…\", chama você quando precisa." },
    { pose: "treina" as const, titulo: "Treina com o seu plano", texto: "A janela de uso é uma academia: quanto mais você usa, mais ele sua para levantar a barra." },
    { pose: "dorme" as const, titulo: "Dorme no limite", texto: "Bateu o limite do plano? Ele larga a barra e cochila até a hora que libera." },
  ];
  return (
    <section id="clawd" className="secao clawd-secao">
      <div className="cabeca" data-surge>
        <p className="rotulo">Clawd</p>
        <Titulo partes={["Um companheiro de ", ["pixel"], "."]} />
        <p className="texto">O mascote do Claude Code mora no Claudinho. Ele reage a tudo o que o Claude faz, e um pouco ao que você faz também.</p>
      </div>
      <div className="clawd-grade" data-obra-grupo>
        {cards.map((c, i) => (
          <article key={c.pose} className="clawd-card luz inclina" data-clawd-alvo={["sou eu!", "trabalhando…", "puxado, hein", "zzz… brincadeira"][i]}>
            <div className="clawd-palco"><Clawd pose={c.pose} px={5} fala={FALAS_CLAWD} /></div>
            <h3>{c.titulo}</h3>
            <p>{c.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const DESTAQUES: [number, React.ReactNode][] = [[0, <DemoDiff key="d" />], [3, <DemoPlano key="p" />], [5, <DemoRaciocinio key="r" />]];

function Recursos() {
  return (
    <section id="recursos" className="secao recursos">
      <div className="cabeca" data-surge>
        <p className="rotulo">Tudo do Claude Code</p>
        <Titulo partes={["O mesmo motor. ", ["Muito"], " mais coisa à vista."]} />
        <p className="texto">Por baixo é o próprio Claude Code, pelo SDK oficial de agentes: as mesmas ferramentas, skills, MCPs e permissões. Em cima, uma interface que mostra o que ele está fazendo.</p>
      </div>
      <div className="recursos-destaque" data-obra-grupo>
        {DESTAQUES.map(([i, demo]) => (
          <article key={RECURSOS[i].titulo} className="destaque luz">
            {demo}
            <div><h3>{RECURSOS[i].titulo}</h3><p>{RECURSOS[i].texto}</p></div>
          </article>
        ))}
      </div>
      <div className="recursos-grade" data-obra-grupo>
        {RECURSOS.filter((_, i) => !DESTAQUES.some(([d]) => d === i)).map((r, i) => (
          <article key={r.titulo} className="recurso luz">
            <span className="glifo" aria-hidden="true">{GLIFOS[(i % 5) + 1]}</span>
            <h3>{r.titulo}</h3>
            <p>{r.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PorDentro() {
  const [aba, setAba] = useState(0);
  return (
    <section id="por-dentro" className="secao por-dentro">
      <div className="cabeca" data-surge>
        <p className="rotulo">Por dentro</p>
        <Titulo partes={["Telas de verdade, ", ["sem maquiagem"], "."]} />
      </div>
      <div className="abas" role="tablist" data-surge>
        {TELAS.map((t, i) => (
          <button key={t.id} role="tab" aria-selected={aba === i} className={aba === i ? "on" : ""} onClick={() => setAba(i)}>{t.rotulo}</button>
        ))}
      </div>
      <div className="moldura" data-abre>
        {TELAS.map((t, i) => (
          <div key={t.id} className={`tela-aba ${aba === i ? "on" : ""}`} role="tabpanel" aria-hidden={aba !== i}>
            <Tela id={t.id} alt={t.alt} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Personalizar() {
  return (
    <section className="secao personalizar">
      <div className="pers-texto" data-surge>
        <p className="rotulo">Do seu jeito</p>
        <Titulo partes={["Até o ícone ", ["é seu"], "."]} />
        <Paletas />
        <ul role="list">
          {PERSONALIZAR.map(([t, d]) => (
            <li key={t}><b>{t}</b><span>{d}</span></li>
          ))}
        </ul>
      </div>
      <div className="pers-tela" data-surge={0.1} data-parallax="40">
        <Tela id="personalizar" alt={TELAS[3].alt} />
      </div>
    </section>
  );
}

function Passos() {
  return (
    <section className="secao passos">
      <div className="cabeca" data-surge>
        <p className="rotulo">Como funciona</p>
        <Titulo partes={["Três passos e ", ["pronto"], "."]} />
      </div>
      <ol className="passos-lista" data-obra-grupo>
        <span className="passos-linha" data-linha aria-hidden="true" />
        {PASSOS.map((p) => (
          <li key={p.n} className="luz"><span className="n">{p.n}</span><h3>{p.titulo}</h3><p>{p.texto}</p></li>
        ))}
      </ol>
    </section>
  );
}

function Duvidas() {
  return (
    <section id="duvidas" className="secao duvidas">
      <div className="cabeca" data-surge>
        <p className="rotulo">Dúvidas</p>
        <Titulo partes={["Perguntas ", ["de sempre"], "."]} />
      </div>
      <div className="duvidas-lista">
        {DUVIDAS.map((d) => (
          <details key={d.p} data-surge>
            <summary>{d.p}<span aria-hidden="true">+</span></summary>
            <p>{d.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Final() {
  return (
    <section id="baixar" className="final">
      <Vivo tema="lareira" className="final-fundo" />
      <div className="final-conteudo" data-surge>
        <Clawd pose="olha" px={7} fala={FALAS_CLAWD} />
        <Titulo partes={["Bora dar ", ["vida"], " ao seu Claude Code?"]} />
        <p>Gratuito e de código aberto. Baixe, instale e abra: ele usa o Claude Code que já está no seu computador.</p>
        <Baixar />
      </div>
      <footer className="rodape">
        <p className="autor">Feito por <a href="https://luisrobertoportifolio.com" target="_blank" rel="noreferrer">Luis Roberto</a></p>
        <p>Claudinho é um projeto independente de fã. Não é afiliado nem endossado pela Anthropic. Claude, Claude Code e Clawd são marcas da Anthropic.</p>
        <p>Animações da biblioteca <a href="https://www.ascii-magic.com/ascii" target="_blank" rel="noreferrer">ASCII Magic</a> (MIT). Ideia dos papéis de parede vivos inspirada no conceito de Marko Vineli.</p>
      </footer>
    </section>
  );
}

export function App() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    startSmoothScroll();
    let desfaz = () => {};
    let vivo = true;
    document.fonts.ready.then(() => { if (!vivo) return; desfaz = setupReveals(); ScrollTrigger.refresh(); });
    const t = setTimeout(() => ScrollTrigger.refresh(), 800), interacoes = setupInteracoes();
    return () => { vivo = false; clearTimeout(t); desfaz(); interacoes(); };
  }, []);
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Faixa />
        <Temas />
        <ClawdSecao />
        <Recursos />
        <PorDentro />
        <Personalizar />
        <Passos />
        <Duvidas />
        <Final />
      </main>
      <Obra />
      <Passeio />
    </>
  );
}
