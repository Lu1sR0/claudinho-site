# Claudinho — site

Landing page do Claudinho. Next.js 16 (App Router), React 19, Tailwind v4, GSAP + ScrollTrigger e Lenis.

```bash
npm install
npm run dev      # http://localhost:5191
npx next build   # build estático
```

## Onde está cada coisa

- `src/App.tsx` — todas as seções da página.
- `src/content.ts` — todo o texto (temas, recursos, passos, dúvidas).
- `src/styles/globals.css` — tokens e estilos.
- `src/components/Vivo.tsx` — fundo ASCII vivo, rodando o mesmo motor do app (`public/vivo/*.js`, copiado de `claude-vivo/src/renderer`).
- `src/components/Clawd.tsx` — o Clawd em canvas (olha, digita, treina, dorme).
- `public/assets/telas/` — capturas reais do app (WebP 1440 e 960).

Se o motor ou os temas mudarem no app, copie de novo `engine.js`, `themes*.js` e `clawd-arte.js` para `public/vivo/`.

O botão de download está desligado ("Em breve para Windows") até existir um instalador.
