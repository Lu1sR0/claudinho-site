// A familia mono para desenhar em canvas: o next/font da a ela um nome com
// hash, entao lemos a variavel do CSS uma vez e guardamos.
let mono = "";
export const fonteMono = () => mono || (mono = getComputedStyle(document.documentElement).getPropertyValue("--mono").trim() || "monospace");
