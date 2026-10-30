# SEXORED

Framework próprio para jogar Cyberpunk RED no MapTool, com interface HTML5 em português.

O arquivo `cpred-framework.cmpgn` já existente foi preservado. O código original do projeto fica em `src/`; o pacote instalável em `dist/`. Não depende do framework CPRed 0.8 nem reutiliza suas macros.

## Compilar

No PowerShell, nesta pasta:

```powershell
.\build.ps1
```

Sem npm e sem dependências externas. A distribuição `.mtlib` é um ZIP da pasta `src`, conforme a documentação do MapTool.

Abra `src/library/public/index.html` no navegador para a prévia local. Essa prévia é independente dos dados do MapTool.

Veja `src/readme.md` para instalação, uso e limites. Veja `PESQUISA.md` para as fontes consultadas. PDFs oficiais em `referencias/` servem como apoio; não são importados automaticamente como fichas editáveis.

## Abrir

Execute `Abrir-SEXORED.bat` para abrir a campanha `dist/SEXORED-0.3.cmpgn` com o MapTool compilado nesta máquina. Ou abra essa campanha pelo menu Arquivo do MapTool existente. A biblioteca já está embutida; não é necessário importar o `.mtlib` nesse caso. Clique em `Novo personagem` para começar. Salve a ficha no painel e depois a campanha com Ctrl+S.

Para reconstruir também a campanha: `.\build-campaign.ps1`. Esse comando usa `cpred-framework.cmpgn` como modelo e escreve um novo arquivo em `dist/`, sem alterar o original.

## Tokens cyberpunk — versão 0.2

A coleção oficial Megatoken Pack inclui 680 marcadores numerados de corporações, organizações criminosas, gangues e segurança. A arte original está em `tokens/Megatoken-Pack/`, com a fonte em `tokens/FONTES.txt`.

No painel SEXORED, use **Tokens cyberpunk**, busque uma facção, selecione PC ou NPC e clique na imagem. O token será colocado perto do centro da área visível do mapa e sua ficha em branco será aberta. Salve a ficha e depois a campanha.

Para atualizar uma campanha já aberta, salve a campanha e importe `SEXORED-ATUALIZAR.mtlib` em **Arquivo → Bibliotecas de complementos / Add-On Libraries**, substituindo a biblioteca de mesmo namespace. Reabra o painel SEXORED. Não precisa reiniciar o aplicativo. Isso mantém os dados das fichas na propriedade SEXORED dos tokens existentes.

Para adicionar só as imagens usando o MapTool padrão, arraste um PNG da pasta `tokens/Megatoken-Pack` para o mapa. Esses arquivos são marcadores com logotipos e números; não são retratos de personagens.


## Versão 0.3 — Personagens e Mercado

Em **Tokens cyberpunk**, a categoria inicial **Personagens** contém 72 retratos oficiais dos pacotes Black Chrome+ e Tales of the RED+. Clique no retrato para criar um token com ficha em branco. Os 680 marcadores de facções continuam disponíveis nas outras categorias.

Na aba **07 / Mercado**, pesquise, filtre, confira o preço e escolha a quantidade. A compra desconta eurobucks e adiciona o produto em **03 / Equipamento → Inventário**, com imagem, origem e preço. Edite o saldo em Visão geral. Armas compradas ficam no inventário; equipar e instalar cyberware são ações manuais. Salve a campanha com Ctrl+S.

Catálogo: 1.448 registros, incluindo variantes, com básico, Black Chrome e DLCs presentes no Night Market Index v1.24 (janeiro de 2026). São 1.427 registros com preço fixo em eurobucks. Valores variáveis, inconsistentes ou em outra moeda ficam disponíveis para consulta. Não representa garantia de todos os DLCs publicados após essa versão do índice.

As imagens são 381 ícones de itens ou categorias, identificados nos cartões. Não há fotos oficiais públicas individuais para todos os produtos. Nomes de suplementos permanecem em inglês quando não há tradução nesta base. Referências e licença estão em src/THIRD-PARTY.md.

Atualização sem reiniciar: salve sua campanha, vá a **Arquivo → Bibliotecas de complementos / Add-On Libraries**, importe **SEXORED-ATUALIZAR.mtlib** desta pasta substituindo a biblioteca local.sexored.red e feche/reabra somente o painel SEXORED. Depois abra **07 / Mercado**.

## Versão 0.3.1 — Descrições

Nos cartões do mercado, expanda **Descrição e dados técnicos**. O mesmo conteúdo aparece na confirmação de compra e no inventário dos itens vinculados ao catálogo, incluindo compras antigas. A busca também considera o texto do resumo.

Os 515 registros do básico receberam resumos em português e/ou dados técnicos: armas (dano, ROF, capacidade, qualidade), cromos (função, Humanidade e slots), programas (efeito, classe, ATK, DEF, REZ e slots), além das outras categorias. São resumos de consulta; os efeitos não são automatizados. Os 933 registros extras cujo índice só informa nome, preço e página ficam sinalizados como descrição ainda não verificada. Não foram inventadas regras para preencher esses registros.

Atualize com SEXORED-ATUALIZAR.mtlib e feche/reabra o painel; os nomes dos recursos foram versionados para evitar cache antigo.
