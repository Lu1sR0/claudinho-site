// Mini-telas do app que se mexem sozinhas, para os recursos em destaque.
// So CSS: cada uma e um ciclo de 7s em loop.

export function DemoDiff() {
  return (
    <div className="demo demo-diff" aria-hidden="true">
      <div className="demo-topo"><i>✻</i> Editar <b>src/Cardapio.tsx</b></div>
      <div className="demo-codigo">
        <span className="l"><em>12</em>{"<section className=\"cardapio\">"}</span>
        <span className="l menos"><em>13</em>{"- <img src=\"pao.png\" />"}</span>
        <span className="l mais"><em>13</em><span className="digita">{"+ <img src=\"pao.webp\" loading=\"lazy\" />"}</span></span>
        <span className="l"><em>14</em>{"</section>"}</span>
      </div>
      <div className="demo-botoes"><span className="sim">Aprovar</span><span>Sempre</span><span>Negar</span><b className="ok">✓ aprovado</b></div>
    </div>
  );
}

const TAREFAS = ["Achar as imagens pesadas", "Converter para WebP", "Ativar loading lazy", "Medir de novo"];

export function DemoPlano() {
  return (
    <div className="demo demo-plano" aria-hidden="true">
      <div className="demo-topo"><i>✻</i> Plano</div>
      <ul>
        {TAREFAS.map((t, i) => <li key={t} style={{ ["--i" as string]: i }}><span className="caixa" />{t}</li>)}
      </ul>
      <div className="barra"><span /></div>
    </div>
  );
}

export function DemoRaciocinio() {
  return (
    <div className="demo demo-rac" aria-hidden="true">
      <div className="demo-topo"><i>✻</i> <span className="pensando">Pensando…</span><span className="pensou">Pensou por 4s ›</span></div>
      <div className="rac-corpo">
        <p><span>As fotos do cardápio são PNG grandes.</span></p>
        <p><span>Vou listar as imagens e ver os tamanhos,</span></p>
        <p><span>depois trocar por WebP com loading lazy.</span></p>
      </div>
      <div className="rac-resposta">Pronto! As 12 fotos agora carregam 4× mais rápido.</div>
    </div>
  );
}
