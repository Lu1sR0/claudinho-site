// Clawd's drawing, shared by everything that shows him: the pixels of Claude
// Code's start-up glyphs (each pixel twice as tall as wide, like a terminal
// cell), split into body, eyes, arms and legs so each part can move.

const CLAWD = (() => {
  const LINHAS = [" ▐▛███▜▌", "▝▜█████▛▘", "  ▘▘ ▝▝"];
  const Q = { " ": [0, 0, 0, 0], "█": [1, 1, 1, 1], "▐": [0, 1, 0, 1], "▌": [1, 0, 1, 0], "▛": [1, 1, 1, 0], "▜": [1, 1, 0, 1], "▝": [0, 1, 0, 0], "▘": [1, 0, 0, 0] };
  const px = [];
  LINHAS.forEach((l, j) => [...l].forEach((c, i) => Q[c].forEach((v, k) => v && px.push([i * 2 + (k & 1), j * 2 + (k >> 1)]))));
  const x0 = Math.min(...px.map((p) => p[0])), y0 = Math.min(...px.map((p) => p[1]));
  const PIX = px.map(([x, y]) => [x - x0, y - y0]);
  const BRACOS = PIX.filter(([x, y]) => y === 2 && (x < 2 || x > 13));
  const PERNAS = PIX.filter(([, y]) => y === 4);
  return { W: 16, H: 5, PIX, OLHOS: [[4, 1], [11, 1]], BRACOS, PERNAS, CORPO: PIX.filter((p) => !BRACOS.includes(p) && !PERNAS.includes(p)) };
})();

// Clawd as inline SVG (for small places): arms, legs and eyelids in their own
// groups so CSS can wave, walk and blink him.
function clawdSvg(classe = "") {
  const r = ([x, y]) => `<rect x="${x}" y="${y * 2}" width="1.04" height="2.04"/>`;
  return `<svg class="clawd-svg ${classe}" viewBox="-1 -3 18 15" aria-hidden="true"><g class="c-corpo">${CLAWD.CORPO.map(r).join("")}</g>`
    + `<g class="c-braco-e">${CLAWD.BRACOS.filter(([x]) => x < 8).map(r).join("")}</g><g class="c-braco-d">${CLAWD.BRACOS.filter(([x]) => x > 8).map(r).join("")}</g>`
    + `<g class="c-pernas">${CLAWD.PERNAS.map(r).join("")}</g><g class="c-palpebras">${CLAWD.OLHOS.map(r).join("")}</g></svg>`;
}

// The sidebar's mark is Clawd too.
{
  const velho = document.querySelector(".side-topo .marca .marca-svg"), t = document.createElement("template");
  t.innerHTML = clawdSvg("marca-svg");
  velho?.replaceWith(t.content.firstElementChild);
}

// Clawd on a canvas, posed: { x, y, pw, ph, cor, olhar: [dx, dy], fechado,
// braco: [esq, dir] (rows up), pernas: [lifts] }.
function desenhaClawd(ctx, { x, y, pw, ph, cor = "#d77757", olhar = [0, 0], fechado = false, braco = [0, 0], pernas = [0, 0, 0, 0], bracos = true }) {
  const p = (px, py, dy = 0) => ctx.fillRect(Math.round(x + px * pw), Math.round(y + py * ph + dy), Math.ceil(pw), Math.ceil(ph));
  ctx.fillStyle = cor;
  for (const [px, py] of CLAWD.CORPO) p(px, py);
  if (bracos) for (const [px, py] of CLAWD.BRACOS) p(px, py - (px < 8 ? braco[0] : braco[1]) * 1, 0);
  CLAWD.PERNAS.forEach(([px, py], i) => p(px, py, -(pernas[i] || 0)));
  // eyes: fill the holes, then cut them where he looks (closed: a thin line)
  for (const [ex, ey] of CLAWD.OLHOS) {
    p(ex, ey);
    const ox = ex + olhar[0], oy = ey + olhar[1];
    if (fechado) ctx.clearRect(Math.round(x + ox * pw), Math.round(y + oy * ph + ph * 0.42), Math.ceil(pw), Math.max(2, Math.round(ph * 0.16)));
    else ctx.clearRect(Math.round(x + ox * pw), Math.round(y + oy * ph), Math.ceil(pw), Math.ceil(ph));
  }
}

// A pixel barbell centred on cx, its bar's top at y, in square cells of pw:
// the bar, a collar, a big plate and a small one on each side.
function desenhaBarraPixel(ctx, cx, y, pw, alfa = 1) {
  const r = (x0, y0, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(cx + x0 * pw), Math.round(y + y0 * pw), Math.ceil(w * pw), Math.ceil(h * pw)); };
  ctx.globalAlpha = alfa;
  r(-16, 0, 32, 1, "#b8b5ae");
  for (const s of [-1, 1]) {
    const lado = (a, w) => (s < 0 ? -a - w : a);
    r(lado(11, 1), -1, 1, 3, "#8e8a84");
    r(lado(12, 2), -3, 2, 7, "#3f3c39");
    r(lado(14, 1), -2, 1, 5, "#57534e");
  }
  ctx.globalAlpha = 1;
}

// Clawd pressing a barbell over his head, all on his own pixel grid. (x, y) is
// his top-left standing; sobe goes 0 (bar resting on his head, elbows out,
// knees bent) to 1 (arms straight up). Room needed: 16 cells each side of his
// centre and 8 cells (of pw) above his head.
function desenhaSupino(ctx, { x, y, pw, ph, cor = "#d77757", sobe = 0, treme = 0, fechado = false }) {
  const u = pw, n = Math.round(Math.max(0, Math.min(1, sobe)) * 4);
  const agacha = n === 0 ? u : 0, by = Math.round(y - (1 + n) * u), yb = y + agacha, x0 = x + treme;
  const r = (cx, cy, w, h) => ctx.fillRect(Math.round(x0 + cx * pw), Math.round(cy), Math.ceil(w * pw), Math.ceil(h));
  desenhaBarraPixel(ctx, x0 + 8 * pw, by, pw);
  desenhaClawd(ctx, { x: x0, y: yb, pw, ph, cor, bracos: false, fechado, pernas: [agacha, agacha, agacha, agacha] });
  // arms: shoulder out to the elbow, forearm up to a fist around the bar
  const e = n >= 2 ? 1 : 2, ombro = yb + 2 * ph;
  ctx.fillStyle = cor;
  for (const [base, dir] of [[0, -1], [14, 1]]) {
    const cot = base + dir * e;
    r(Math.min(base, cot), ombro, 2 + e, ph);
    r(cot, by, 2, ombro - by);
    r(cot - 0.5, by - u, 3, 3 * u);
  }
}
