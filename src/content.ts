// Todo o texto da pagina num lugar so.

export const TEMAS_VITRINE = [
  { id: "claude", nome: "Claude Code", nota: "o tema da casa, no laranja da Anthropic" },
  { id: "lagoon", nome: "Honu Lagoon", nota: "tartarugas e água que responde ao mouse" },
  { id: "koi", nome: "Koi Pond", nota: "carpas que fogem da sua mão" },
  { id: "galaxia", nome: "Galáxia Distante", nota: "planetas e estrelas cadentes" },
  { id: "lareira", nome: "Lareira", nota: "fogo crepitando para o fim do dia" },
  { id: "sakura", nome: "Jardim Sakura", nota: "pétalas caindo devagar" },
  { id: "chuva", nome: "Chuva Lo-fi", nota: "gotas na janela" },
  { id: "arcade", nome: "Arcade", nota: "naves e alienígenas" },
] as const;

// O que o Clawd fala quando alguem toca nele (no rodape e nos cartoes).
export const FALAS_CLAWD = [
  "oi!", "ei, faz cócegas", "bora codar?", "clica de novo que eu pulo", "sou o Clawd, prazer", "pode me arrastar, eu deixo",
  "tô de olho", "hehe", "de novo?!", "boop", "você clica bonito", "eu sou feito de quadradinhos", "minhas pernas são 4 pixels",
  "laranja é minha cor favorita", "já salvou o arquivo?", "commitou hoje?", "isso aí é bug ou feature?", "funciona na minha máquina",
  "rodou de primeira? desconfia", "git push e reza", "ponto e vírgula salva vidas", "bugs têm medo de mim", "deploy na sexta? coragem",
  "me baixa, vai", "lá no app eu tenho até academia", "eu durmo quando o plano acaba", "já tomou água hoje?",
  "o fundo ali em cima é ao vivo", "testa pedir um tema pro Claude", "meu sonho é virar sticker", "você é meu humano favorito",
  "uau, que clique", "ai, meu pixel", "segura a emoção", "último pulo… mentira", "me joga lá pro alto!", "isso é um easter egg? talvez",
  "eu sei dançar (não sei)", "tô de plantão", "um teste a mais nunca matou ninguém", "Ctrl + Z não funciona em mim",
];

export const PASSOS = [
  { n: "01", titulo: "Abra o Claudinho", texto: "Um clique no ícone do Clawd. Ele usa o Claude Code que já está no seu computador, com o seu login." },
  { n: "02", titulo: "Escolha a pasta", texto: "O projeto em que o Claude vai trabalhar. Suas conversas do terminal e do app do Claude aparecem, separadas por projeto." },
  { n: "03", titulo: "Peça qualquer coisa", texto: "Código, arquivos, comandos, um tema novo para o fundo. O Claude trabalha; você aprova o que precisa de aprovação." },
];

export const RECURSOS = [
  { titulo: "Permissões com diff", texto: "Cada edição aparece em vermelho e verde antes de você aprovar. Aprova uma vez, sempre, ou nega." },
  { titulo: "Desfazer de verdade", texto: "Passe o mouse numa mensagem sua e volte os arquivos para como estavam ali, com prévia antes." },
  { titulo: "Ramificar a conversa", texto: "Abra um novo caminho a partir de qualquer resposta. A conversa original fica intacta." },
  { titulo: "Fila e plano à vista", texto: "Escreva enquanto o Claude trabalha: entra na fila. A lista de tarefas dele fica fixa acima do campo." },
  { titulo: "Contexto e conectores", texto: "Quanto do contexto foi usado, por categoria, e o estado de cada MCP e conector, num painel ao lado." },
  { titulo: "Raciocínio visível", texto: "O que o Claude pensa antes de responder, num bloco que dobra sozinho quando ele termina." },
  { titulo: "Comandos / e skills", texto: "Digite / e veja os comandos do app, os do Claude Code e as suas skills, com descrição." },
  { titulo: "Várias janelas", texto: "Uma conversa por janela, cada uma no seu projeto. Ctrl+Shift+N abre outra." },
  { titulo: "Busca em tudo", texto: "Procura dentro das mensagens de todas as conversas, não só no título." },
];

export const PERSONALIZAR = [
  ["Fundo", "Seus vídeos, imagens e GIFs, ou papéis de parede de vídeo e de página do Wallpaper Engine, com escurecer e desfocar."],
  ["Cores", "Paletas prontas ou o seu destaque, texto e vidro."],
  ["Fontes", "Da interface e do código, inclusive arquivos seus."],
  ["Sons", "Um som seu para enviar, terminar, pedir aprovação e erro."],
  ["Música", "Sua playlist tocando, no lugar da música dos temas ou junto."],
  ["Ícone e nome", "O app com o seu ícone na barra de tarefas e o nome que quiser."],
] as const;

export const TELAS = [
  { id: "conversa", rotulo: "Conversa", alt: "O Claudinho com uma conversa: raciocínio, ferramentas usadas, uma edição com diff, a resposta com tabela e o plano fixo acima do campo, sobre o tema Galáxia Distante." },
  { id: "inicio", rotulo: "Início", alt: "Tela inicial do Claudinho com o Clawd grande, a saudação e as sugestões, sobre o tema Honu Lagoon com tartarugas em ASCII." },
  { id: "biblioteca", rotulo: "Biblioteca", alt: "O seletor de temas aberto na aba Biblioteca, com categorias e miniaturas de animações ASCII, sobre o tema Aurora." },
  { id: "personalizar", rotulo: "Personalizar", alt: "O painel Personalizar na aba Cores, com paletas, cor de destaque, texto, vidro, opacidade e desfoque." },
] as const;

export const DUVIDAS = [
  { p: "É um app oficial da Anthropic?", r: "Não. O Claudinho é um projeto independente de fã, feito com o Claude Code. Ele conversa com o Claude Code pelo SDK oficial de agentes, mas não é afiliado nem endossado pela Anthropic." },
  { p: "Quanto custa?", r: "Nada. O Claudinho é gratuito e aberto: quem quiser baixa e usa. Você só precisa do Claude Code instalado e de uma conta do Claude, como já precisaria para usar o Claude Code." },
  { p: "Gasta mais do meu plano do que o Claude Code?", r: "Não. Por baixo é o próprio Claude Code, com as mesmas instruções e ferramentas. Os papéis de parede, a música e o Clawd rodam no seu computador e não gastam nada." },
  { p: "Minhas conversas do claude.ai aparecem?", r: "Não. Aparecem as conversas do Claude Code (terminal, aba Code do app do Claude e o próprio Claudinho), que ficam salvas no seu computador. As do chat do claude.ai ficam nos servidores da Anthropic." },
  { p: "Como o Claudinho entra no Claude?", r: "Pelo Claude Code que já está no seu computador, com o login dele (o seu plano). Se preferir, dá pra usar uma chave de API da Anthropic em Personalizar → Geral → Conta; a chave fica cifrada pelo sistema." },
  { p: "O Windows avisou que o app não é reconhecido. É seguro?", r: "O instalador ainda não tem assinatura digital, então o Windows mostra esse aviso para qualquer app novo. Clique em Mais informações → Executar assim mesmo." },
  { p: "Funciona no Mac ou no Linux?", r: "O Claudinho nasceu no Windows, e a versão para Mac vem em seguida. Linux ainda não está nos planos." },
  { p: "Posso usar meus MCPs, skills e o CLAUDE.md?", r: "Sim. Tudo o que o seu Claude Code carrega o Claudinho carrega junto: MCPs, conectores, skills, comandos e memória." },
];

// Instaladores. Enquanto a url for null, o botao aparece como "em breve";
// quando sair um instalador, e so colocar o link aqui.
export const DOWNLOADS = {
  windows: { nome: "Windows", url: "https://github.com/Lu1sR0/claudinho/releases/latest/download/Claudinho-Setup.exe" as string | null, nota: "Windows 10 ou 11 · 124 MB" },
  mac: { nome: "Mac", url: null as string | null, nota: "macOS 12 ou mais novo" },
};

// O que o Clawd que passeia pela pagina fala em cada secao.
export const FALAS_SECAO: Record<string, string[]> = {
  topo: ["oi! eu moro aqui embaixo", "passa o mouse no fundo, ele mexe", "pode me arrastar, eu deixo"],
  temas: ["esses fundos rodam no app de verdade", "o Koi foge do mouse, testa", "clica no fundo pra ver"],
  clawd: ["ei, esses aí sou eu", "a academia é puxada", "dormir no limite é o melhor"],
  recursos: ["o Claude trabalha, eu fico de olho", "desfazer salva vidas"],
  "por-dentro": ["essas telas são do app de verdade", "olha eu ali no canto"],
  duvidas: ["pergunta que eu respondo", "é de graça, sério"],
  baixar: ["quentinho aqui perto do fogo", "bora?"],
};
