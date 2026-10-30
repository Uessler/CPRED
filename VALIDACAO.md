# Validação — 30/10/2026

- 9 testes de modelo passaram: bases de perícia, d10 normal/crítico, dano d6, validação e round-trip JSON.
- Add-on aceito pelo importador nativo do MapTool compilado (7219059e19).
- Teste de integração rodou dentro do painel HTML5 real do MapTool, com fetch para MTScript, sem simular respostas.
- Criação de token PC, persistência de nome/atributos/PV, 66 linhas de perícia, rolagem de ataque, desconto de munição persistido e exportação JSON: passaram.
- Layout renderizado no JavaFX do MapTool e revisado visualmente.
- Sem validação em sessão multiplayer remota nesta etapa.

O teste em `tests/smoke-ui.js` usa um personagem próprio e não deve ser incluído no pacote de produção: ele cria um token e executa rolagens de teste. O build normal inclui apenas `src/`.

## Versão 0.2 — Tokens

- 680 PNGs verificados contra o catálogo; 680 IDs únicos e arquivos existentes.
- Galeria HTML5 renderizada no JavaFX do MapTool; busca Arasaka retorna 10 imagens; paginação de 60.
- Criação por clique: NPC e PC com tipo e imagem corretos, colocados no mapa e carregados na ficha. Teste de integração real passou (SEXORED_TOKENS_TEST ALL_OK).
- Arquivos originais preservados em tokens/Megatoken-Pack; atribuição em tokens/FONTES.txt.

## Correção 0.2.1

O MapTool/JavaFX pode manter app.js em cache ao substituir uma biblioteca. O build agora gera nomes versionados para HTML, CSS e JavaScript e atualiza o ponto de entrada da macro. Isso força o carregamento da interface atualizada sem reiniciar o aplicativo.

## Versão 0.3 — Mercado e retratos

- 13 testes de modelo e catálogo passaram, incluindo nomes/preços de referência, IDs/imagens existentes, metadados do inventário e equivalência de preços no servidor.
- Integração real no MapTool: compra de 2 Airhypos por 100 eb, desconto de 1.000 para 900 eb e 2 unidades no inventário; passou.
- Repetir a mesma transação não cobra novamente; sem saldo não altera dinheiro ou inventário; preço informado pelo cliente é ignorado; recompra soma unidades; recibos sobrevivem ao salvamento e carregamento; passaram.
- Clique no primeiro retrato oficial cria token e abre ficha; passou. 72 retratos oficiais e 680 marcadores têm IDs distintos.
- Ícones SVG são distribuídos como fonte e derivados PNG de 256 px, pois a versão compilada do MapTool não exibia os SVGs corretamente pelo protocolo lib:.
- Testes de integração usam campanhas e perfis separados. Nenhum personagem da campanha original é usado nos testes. Ainda sem validação em multiplayer remoto.
- Cobertura: índice oficial v1.24, janeiro de 2026. Não garante exaustividade de publicações posteriores. 21 entradas sem preço fixo válido em eurobucks não permitem compra automática.

## Versão 0.3.1 — Descrições

14 testes passaram. Integração no MapTool confirmou descrição e REZ do Worm no mercado, descrição na confirmação, compra e descrição preservada por vínculo ao catálogo no inventário. Sandevistan exibiu resumo e dados de Humanidade. Layout revisado visualmente no JavaFX. Resultado DESCRIPTIONS ALL_OK.
