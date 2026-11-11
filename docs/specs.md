# Na Minha Tela: especificação

Versão 0.1, 11/11/2026. Itens marcados como **[pendente]** ainda não foram decididos. Itens marcados como **[proposta]** foram sugeridos e aguardam confirmação.

## 1. Objetivo

Transformar o app "Estante" do site pessoal (thiagoraphael.com.br/apps/estante/) num site próprio chamado **Na Minha Tela**, com identidade visual própria.

O site gera imagens para stories e feed a partir da capa de um livro, jogo, série ou HQ. Ele tem só duas coisas: o app e um pedido de cafezinho via Pix. Não tem cadastro, anúncio nem servidor. A imagem é montada no aparelho da pessoa e nada é enviado para fora.

## 2. Stack

| Camada | Escolha |
|---|---|
| Build | Node, sem dependências, gerando site estático (mesmo modelo do meu-site) |
| Front-end | HTML, CSS e JS puros, módulos `.mjs` |
| Renderização da imagem | Canvas 2D no navegador |
| Hospedagem | Vercel, projeto separado do meu-site |
| Fontes | Bricolage Grotesque e IBM Plex Mono (Google Fonts) |
| Pix | BR Code + QR **[proposta: gerado no build como SVG estático]** |

Motivo de manter sem dependências: o build atual já funciona assim, o deploy fica trivial e o app não precisa de framework para um formulário e um canvas.

## 3. Origem do código

Repo de origem: `github.com/thiagoraphael/meu-site`.

| Origem | Conteúdo |
|---|---|
| `src/apps/estante/view.mjs` | Marcação da página do app |
| `src/apps/estante/app.js` | Lógica e desenho no canvas |
| `src/apps/_shared/shared.js` | Funções comuns dos apps |
| `src/apps/_shared/shared.css` | Estilos comuns |
| `src/apps/_shared/ui.mjs` | Componentes de interface |

A ideia é portar esse código, não reescrever, para preservar o que já funciona (película, granulado, compartilhamento etc.).

## 4. Estrutura de pastas [proposta]

```
na-minha-tela/
├── build.mjs              # build estático, sem dependências
├── vercel.json
├── README.md
├── src/
│   ├── index.mjs          # página única: header, hero, app, como funciona, café, rodapé
│   ├── app/
│   │   ├── app.js         # vindo de estante/app.js
│   │   ├── render.js      # desenho no canvas (separado se o app.js crescer)
│   │   └── view.mjs       # vindo de estante/view.mjs
│   ├── shared/            # vindo de apps/_shared, só o que o app usa
│   ├── pix/
│   │   ├── brcode.mjs     # monta o payload EMV + CRC16
│   │   └── qr.mjs         # encoder QR próprio, gera SVG
│   └── styles/
│       ├── tokens.css     # cores, fontes, raios
│       └── site.css
├── public/                # favicon, og-image, fontes locais se for o caso
└── dist/                  # saída do build (não versionada)
```

## 5. Identidade visual

**Logo:** "na minha tela" em minúsculas, numa moldura arredondada, com um ponto amarelo.

**Cores**

| Nome | Hex | Uso principal |
|---|---|---|
| Noite | `#0E0F1A` | Fundo do site |
| Tela | `#171A2B` | Painéis e cards |
| Papel | `#F3F1EA` | Texto e moldura das capas |
| Sinal | `#FFD23F` | Destaque, botão principal, faixa do café |
| Coral | `#FF5C39` | Acento, barra de progresso |
| Azul | `#3B4BFF` | Acento secundário |

**Tipografia:** Bricolage Grotesque para títulos e texto; IBM Plex Mono para rótulos, selos e metadados.

**Forma:** tudo arredondado. Capas com moldura grossa.

**Referência visual:** canvas de Design "Na Minha Tela" no Claude (pranchetas: página do app, identidade visual, stories de Capa, Estante e Citação, e a tela do celular depois do download).

## 6. Funcionalidades

### 6.1 Modos

| Modo | O que mostra |
|---|---|
| Capa | Uma capa, com status, título, autor, progresso, nota e comentário |
| Estante | Até 9 capas numa grade |
| Citação | Uma frase, com autor e obra de origem |

### 6.2 Formatos

| Formato | Tamanho |
|---|---|
| Story | 1080 × 1920 |
| Feed | 1080 × 1350 |

### 6.3 Entrada da capa

Escolher arquivo, arrastar e soltar, ou colar com Ctrl+V.

### 6.4 Campos do modo Capa

Status (Tô lendo, Tô jogando, Tô assistindo, Terminei), título, autor/estúdio/criador, página atual e total (gera a porcentagem e a barra de progresso), nota.

### 6.5 Aparência

* **Temas:** herdados da Estante (Escuro, Rosa, Roxo, Lima) mais "Cor da capa" e "Minha cor". No protótipo novo os swatches são Noite, Sinal, Coral, Papel e Azul. **[pendente: definir se os temas antigos saem ou convivem com a nova paleta]**
* **Fundo:** capa desfocada com intensidade ajustável, película e granulado.
* **Capa:** sombra, inclinação e tamanho ajustável.
* **Alinhamento:** Esquerda ou Centro (decidido em 11/11).
* **Rodapé da imagem:** logo "na minha tela" + endereço do site, e @ do usuário.

### 6.6 Saída

Baixar, copiar para a área de transferência e compartilhar (Web Share API).

### 6.7 Café

* No site: faixa amarela com "Pix copia e cola", botão Copiar e QR code.
* No celular: folha que sobe de baixo depois do download, com o mesmo pedido.

## 7. Regras de negócio

1. Nenhuma imagem sai do aparelho. Não há upload, API ou armazenamento em servidor.
2. Sem cadastro e sem anúncio.
3. O modo Estante aceita no máximo 9 capas.
4. Progresso = página atual ÷ total, arredondado, limitado a 0 a 100%.
5. No alinhamento centralizado, selo, título, autor, nota e rodapé vão para o centro. Capa e barra de progresso continuam com a largura total. Na Estante, a grade não muda, só cabeçalho e rodapé.
6. A folha do café aparece só depois de um download, e só no celular. **[pendente: limitar a uma vez por sessão para não irritar]**
7. Pix sem valor fixo: a pessoa digita o valor no app do banco. **[proposta]**
8. Nome do recebedor no Pix: maiúsculas, sem acento, até 25 caracteres. Cidade: até 15 caracteres. Os dois precisam bater com a conta da chave.

## 8. Decisões técnicas

| Decisão | Motivo |
|---|---|
| Portar a Estante em vez de reescrever | Preserva efeitos e fluxos que já funcionam |
| Build Node sem dependências | Mesmo modelo do meu-site, deploy simples, nada para atualizar |
| Projeto Vercel separado | Site com identidade e domínio próprios |
| Endereço antigo redireciona para o novo | Não quebra links já compartilhados; o redirect sai do meu-site (`vercel.json`) |
| Pix com valor livre e QR gerado no build **[proposta]** | Payload fixo, QR vira SVG estático, zero JS extra. Se entrarem botões de valor, o QR passa a ser gerado no cliente com encoder próprio |
| Botão "Pix copia e cola" | É o que a maioria usa no celular |
| Fontes do Google Fonts | Bricolage e Plex Mono estão lá; avaliar hospedar localmente se o desenho no canvas sofrer com carregamento tardio |

## 9. Entrega e fluxo de trabalho

Este ambiente não tem escrita no GitHub. Os commits chegam como arquivo `.bundle` em `C:\Users\Thiago\Documents\meu-site` (ou na pasta do repo novo) e o push é manual:

```
git pull <arquivo>.bundle main
git push
```

## 10. Pendências

1. Chave Pix, nome e cidade do recebedor.
2. Domínio do site novo.
3. Confirmar se o Pix é gerado no build (valor livre) ou no cliente (com botões de valor).
4. Confirmar o push dos 10 commits da seção /apps/ que estão no `apps.bundle`.
5. Acesso ao código da Estante para o port: desktop app conectado, GitHub ligado ou arquivos anexados.
6. Destino dos temas antigos (item 6.5).
7. Frequência da folha do café no celular (regra 6).
