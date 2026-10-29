import { track } from "@vercel/analytics";

// Eventos da pagina no Vercel Analytics (painel do projeto → Analytics →
// Events). No plano Pro cada evento leva ate 2 propriedades. Em
// desenvolvimento o pacote so mostra no console, nao envia nada.
type Dados = Record<string, string | number | boolean | null>;

const jaContados = new Set<string>();
const ultimos = new Map<string, number>();

/**
 * Conta um evento. `umaVez` conta so a primeira vez por visita (secoes vistas);
 * `intervalo` (ms) ignora repeticoes rapidas do mesmo evento (cliques no fundo).
 */
export function evento(nome: string, dados?: Dados, opcoes: { umaVez?: string; intervalo?: number } = {}) {
  if (opcoes.umaVez) {
    if (jaContados.has(opcoes.umaVez)) return;
    jaContados.add(opcoes.umaVez);
  }
  if (opcoes.intervalo) {
    const agora = Date.now(), chave = nome + JSON.stringify(dados ?? {});
    if (agora - (ultimos.get(chave) ?? 0) < opcoes.intervalo) return;
    ultimos.set(chave, agora);
  }
  try { track(nome, dados); } catch { /* sem analytics, a pagina segue */ }
}
