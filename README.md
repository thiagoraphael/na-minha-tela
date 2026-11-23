<div align="center">

# na minha tela

**Story e post com a capa do livro, jogo, série ou HQ do momento.**

Grátis, sem cadastro e sem servidor. A imagem é montada no seu aparelho e nada é enviado.

[naminhatela.com.br](https://www.naminhatela.com.br/)

![Na Minha Tela](docs/capa.png)

</div>

## O que dá pra fazer

Envie a capa (escolhendo o arquivo, arrastando ou colando com Ctrl+V), ajuste e baixe.

**Três modos**

| Modo | O que mostra |
|---|---|
| Capa | Uma capa com status, título, autor, progresso e nota |
| Estante | Até 9 capas numa grade |
| Citação | Uma frase, com quem disse e a obra |

**Ajustes**

- Status: tô lendo, jogando, assistindo, ouvindo ou terminei
- Progresso por páginas, capítulos, episódios, horas ou porcentagem
- Nota de 0 a 5, com meia estrela
- Story 9:16 (1080×1920) ou feed 4:5 (1080×1350)
- Temas prontos, cor da capa ou uma cor sua
- Alinhamento à esquerda ou ao centro
- Fundo com a capa desfocada ou com a cor do tema, película, granulado, sombra, borda, inclinação e tamanho da capa
- Rodapé com o seu @ e o endereço do site

**Saída**: baixar PNG, copiar a imagem ou compartilhar direto pelo celular.

## Como funciona por dentro

Toda a imagem é desenhada com **Canvas 2D** no navegador. A capa nunca sai do aparelho: não tem upload, API, banco de dados nem cadastro.

| Camada | Escolha |
|---|---|
| Front-end | HTML, CSS e JavaScript puros, com módulos ES |
| Imagem | Canvas 2D |
| Build | Script em Node, sem dependências, que gera um site estático |
| Hospedagem | Vercel |
| Fontes | Bricolage Grotesque e IBM Plex Mono |

O projeto não tem nenhuma dependência no `package.json`. Isso é proposital: não tem nada para atualizar e o build roda em qualquer Node recente.

## Rodando localmente

```bash
git clone https://github.com/thiagoraphael/na-minha-tela.git
cd na-minha-tela
npm run build   # gera o site em dist/
npm run dev     # serve localmente
```

Precisa de Node 18 ou mais recente.

## Estrutura

```
src/
  app/        lógica da ferramenta e desenho no canvas
  shared/     utilidades e componentes de interface
  pix/        BR Code e QR do Pix
  styles/     tokens e estilos do site
public/       favicon, imagem de compartilhamento e outros arquivos estáticos
build.mjs     build estático
```

## Identidade

| Cor | Hex |
|---|---|
| Noite | `#0E0F1A` |
| Tela | `#171A2B` |
| Papel | `#F3F1EA` |
| Sinal | `#FFD23F` |
| Coral | `#FF5C39` |
| Azul | `#3B4BFF` |

## Contribuindo

Achou um bug ou tem uma ideia? Abre uma [issue](https://github.com/thiagoraphael/na-minha-tela/issues). Pull requests são bem-vindos. Para mudanças maiores, abra uma issue antes pra gente conversar.

## Apoie

O site é de graça e sem anúncio. Se ele te ajudou, dá pra mandar um cafezinho pelo Pix, direto na [página do site](https://www.naminhatela.com.br/).

## Licença

[MIT](LICENSE) © Thiago Raphael

---

Feito por [Thiago Raphael](https://thiagoraphael.com.br) · [@thiagoraphael.dev](https://www.instagram.com/thiagoraphael.dev/)
