# SEXORED · Edgerunner Console

Framework não oficial para uso com Cyberpunk RED. Versão 0.2.0, testada no MapTool SNAPSHOT-7219059e19 que compilamos.

## Usar

O caminho mais simples é abrir `dist/SEXORED-0.2.cmpgn` no MapTool, ou executar `Abrir-SEXORED.bat`. A campanha já inclui a biblioteca e abre o painel automaticamente. O iniciador usa o MapTool compilado nesta máquina e um perfil separado em `perfil-maptool/`.

Para instalar em outra campanha:

1. Importe `sexored-0.2.0.mtlib` em Arquivo → Bibliotecas de complementos / Add-On Libraries.
2. Abra o painel Campanha e clique em `SEXORED · Ficha`.
3. Selecione um token na lista da ficha ou use `Novo personagem` (mestre).
4. Edite os campos e clique em `Salvar ficha`. Salve a campanha com Ctrl+S.

Se o botão não estiver visível, execute no chat:

`[h, macro("open@lib:local.sexored.red"): ""]`

Cada ficha ocupa a propriedade `SEXORED` do respectivo token. Duplicar/exportar o token leva a ficha junto. A lista mostra tokens da camada Token do mapa atual, acessíveis ao jogador. Clique em Atualizar tokens depois de trocar de mapa. O botão abre um painel HTML5 redimensionável e acoplável.

## Incluído

- Ficha editável em português; atributos, função, vida, Humanidade, sorte, IP e dinheiro.
- Perícias da ficha básica com atributos associados, campo de especialidade e rolagem.
- Rolagens pelo MapTool: d10 com um dado adicional no 1 ou 10; resultado no chat público.
- Ataques, dano d6, recarga com aviso para descontar munição de reserva manualmente.
- Inventário, cyberware, Lifepath e notas.
- Exportação JSON e importação de fichas no formato SEXORED (não importa PDFs nem o framework 0.8).
- Referências para fichas e personagens oficiais nos PDFs em `referencias/`.

## Limites desta versão

Criação livre, sem validação de orçamento de pontos. Fichas novas usam atributos 5 e perícias 0 como ponto de partida, não como personagem legal pronto. Especialidades adicionais podem ser anotadas, mas ainda não há múltiplas linhas da mesma perícia. Não há Netrunning automatizado, tabelas de distância, habilidades de função, aplicação de críticos, iniciativa no rastreador, efeitos automáticos de armadura/ferimentos nem cálculo automático de EMP a partir da Humanidade. Informe modificadores explicitamente. Empate com DV e testes de morte devem ser resolvidos conforme o livro. O dano recebido é o dano final após proteção; SP/ablação são manuais. Dano com dois ou mais seis avisa de crítico; o dano adicional e a lesão são aplicados manualmente. Sem suporte a regras de AP, autofire e explosivos automatizadas. O histórico é local ao painel e é limpo ao mudar de personagem.

Não feche ou recarregue o painel com alterações pendentes. Dados só ficam no arquivo `.cmpgn` depois de salvar a campanha. A prévia no navegador usa armazenamento local e não se comunica com o MapTool.

Cyberpunk RED é propriedade da R. Talsorian Games. Este conteúdo não é oficial, não tem afiliação ou endosso. Textos e PDFs oficiais mantêm os direitos de seus titulares.

## Tokens oficiais

Versão 0.2: botão Tokens cyberpunk com 680 marcadores de facções do Megatoken Pack da R. Talsorian Games. Busca, filtros e páginas de 60 imagens. Selecione PC/NPC e clique no marcador para adicioná-lo ao centro do mapa atual. Fichas existentes são mantidas ao atualizar apenas o add-on. Originais e atribuição em `tokens/` na pasta do projeto.

