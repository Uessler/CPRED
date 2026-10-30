# Pesquisa e decisões

Consultado em 30/10/2026.

- [Formato de add-ons do MapTool](https://wiki.rptools.info/index.php/Technical_definition_of_Add-on_Libraries): `.mtlib`, `library.json`, eventos e macros públicas.
- [frame5](https://wiki.rptools.info/index.php/frame5_%28roll_option%29): painéis com HTML5, CSS e JavaScript.
- [Comunicação assíncrona com macros](https://wiki.rptools.info/index.php/Asynchronous_Javascript_Requests): chamadas fetch para MTScript. A API de dados não reabre painéis, evitando o bloqueio entre as threads Swing e JavaFX.
- Código-fonte do MapTool no repositório RPTools/maptool, commit 7219059e19: assinaturas de createToken, createMacro, html.frame5, funções de propriedade e importador de add-ons.
- [Downloads oficiais](https://rtalsoriangames.com/downloadable-content/): ficha Core, Edgerunners Folio, Single Shot Pack, mapas e tokens.
- [FAQ oficial](https://rtalsoriangames.com/wp-content/uploads/2021/07/RTG-CPR-CoreBookFAQv1.3.pdf): distinções entre rolagens de perícia, iniciativa e testes de morte.
- [Política da editora](https://rtalsoriangames.com/homebrew-content-policy/): fichas e automações da comunidade, resumos e referências sem reproduzir o livro inteiro.

## Arquitetura

Interface em HTML/CSS/JS sem bibliotecas remotas; pode rodar offline. MTScript cuida dos tokens, persistência e dados do chat. O estado da ficha fica em JSON numa propriedade do token. Nada é salvo em servidores externos. As permissões de leitura/edição exigem GM, dono do token ou token pertencente a todos. A lista só mostra tokens da camada Token no mapa atual.

## Próximas etapas

1. Especialidades múltiplas e criação assistida por pontos.
2. Integração com rastreador de iniciativa e automação de dano/ablação.
3. Netrunning com cyberdecks e arquiteturas próprias.
4. Retratos, gerenciamento de NPCs e biblioteca de equipamento com referências de páginas.
