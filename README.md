# Na Minha Tela

Gera imagens para stories a partir da capa de um livro, jogo, série ou HQ. Tudo é montado no navegador, e nada sai do aparelho.

Especificação: [`docs/specs.md`](docs/specs.md).

## Rodar

```
node build.mjs          # gera dist/
npm run dev             # build + servidor local em dist/
```

Não tem dependências. Precisa só de Node 18 ou mais novo.

Dentro do Google Drive, a sincronização às vezes trava arquivos de `dist/` e o build não consegue apagar a pasta. Nesse caso, gere a saída em outro lugar com `OUT_DIR`, por exemplo `OUT_DIR=C:/temp/nmt-dist node build.mjs`. Na Vercel isso não acontece, porque o build roda lá.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `build.mjs` | Build estático: renderiza `src/index.mjs`, junta CSS/JS com hash e grava em `dist/` |
| `src/index.mjs` | Página única |
| `src/app/` | App: `view.mjs` (marcação), `app.js` (lógica e canvas) e `cafe.js` (Copiar Pix e folha do celular) |
| `src/pix/` | `brcode.mjs` (payload EMV + CRC16) e `qr.mjs` (encoder QR → SVG), usados no build |
| `src/shared/` | Base portada de `meu-site/src/apps/_shared` |
| `src/styles/` | `tokens.css` (identidade) e `site.css` |
| `content/site.json` | Domínio e dados do Pix |
| `public/` | Copiado direto para `dist/` |

## Configuração

Em `content/site.json`:

- `dominio`: aparece no rodapé das imagens. Vazio, sai só o logo.
- `pix.chave`, `pix.nome` e `pix.cidade`: com os três preenchidos, o build gera o Pix copia e cola e o QR, e a página ganha a faixa do café e a folha do celular. Faltando algum, os dois ficam fora da página. O nome precisa ter até 25 caracteres e a cidade até 15, sem contar acentos. Os dois têm que bater com a conta da chave.

O build avisa no terminal o que está faltando.

## Estado

- [x] Modos Capa, Estante (até 9 capas) e Citação
- [x] Formatos Story (1080×1920) e Feed (1080×1350)
- [x] Entrada por arquivo, arrastar e soltar, e Ctrl+V
- [x] Temas Noite, Escuro, Rosa, Roxo, Lima, Cor da capa e Minha cor
- [x] Alinhamento à esquerda ou ao centro
- [x] Capa desfocada, película, granulado, sombra, inclinação e tamanho da capa
- [x] Rodapé com logo, endereço e @
- [x] Baixar, copiar e compartilhar
- [x] Café: faixa com QR e Pix copia e cola, e folha no celular depois do download (precisa dos dados do Pix)
