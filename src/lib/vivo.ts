// O motor de papel de parede e o desenho do Clawd sao os mesmos do app,
// copiados em /public/vivo. Sao scripts classicos que deixam globais
// (Renderer, THEMES, ripple, CLAWD, desenhaClawd, desenhaSupino,
// desenhaBarraPixel); aqui eles carregam uma vez so, em ordem, e cada
// componente espera a promessa antes de desenhar.

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Tema = { id: string; name: string; light?: boolean; wake?: boolean; click?: (x: number, y: number, t: number, r: any) => void };
export type Motor = {
  Renderer: (canvas: HTMLCanvasElement, opt: Record<string, number>) => any;
  THEMES: Tema[];
  ripple: (x: number, y: number, t: number, o: Record<string, number>) => any;
  CLAWD: { W: number; H: number; PIX: number[][]; OLHOS: number[][]; BRACOS: number[][]; PERNAS: number[][]; CORPO: number[][] };
  desenhaClawd: (ctx: CanvasRenderingContext2D, o: Record<string, unknown>) => void;
  desenhaSupino: (ctx: CanvasRenderingContext2D, o: Record<string, unknown>) => void;
  desenhaBarraPixel: (ctx: CanvasRenderingContext2D, cx: number, y: number, pw: number, alfa?: number) => void;
};

const ARQUIVOS = ["engine", "themes", "themes2", "themes3", "clawd-arte"];
let promessa: Promise<Motor> | null = null;

function script(src: string) {
  return new Promise<void>((ok, falha) => {
    const s = document.createElement("script");
    s.src = src; s.async = false;
    s.onload = () => ok(); s.onerror = () => falha(new Error(src));
    document.head.append(s);
  });
}

export function carregaMotor(): Promise<Motor> {
  promessa ??= (async () => {
    for (const a of ARQUIVOS) await script(`/vivo/${a}.js`);
    // globais lexicas dos scripts classicos: lidas pelo nome, num eval indireto
    const pega = (n: string) => (0, eval)(n);
    return { Renderer: pega("Renderer"), THEMES: pega("THEMES"), ripple: pega("ripple"), CLAWD: pega("CLAWD"), desenhaClawd: pega("desenhaClawd"), desenhaSupino: pega("desenhaSupino"), desenhaBarraPixel: pega("desenhaBarraPixel") };
  })();
  return promessa;
}
