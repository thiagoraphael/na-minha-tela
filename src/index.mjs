// Página única: header, hero, app, como funciona, café e rodapé (spec, seção 4).
import { readFileSync } from 'node:fs';
import { html, raw } from './lib/html.mjs';
import app from './app/view.mjs';

// Logo Thiago Raphael (cópia de Design/Thiago Raphael/favicon.svg). Sai inline e na cor do texto (currentColor):
// o azul original (#1B0AD4) quase some no fundo Noite.
const LOGO_TR = readFileSync(new URL('./assets/thiago-raphael.svg', import.meta.url), 'utf8')
  .replace(/<\?xml[^>]*>\s*/, '')
  .replace(/<defs>[\s\S]*?<\/defs>\s*/, '')
  .replace(/\s(id|data-name|class)="[^"]*"/g, '')
  .replace('<svg ', '<svg class="credit__logo" width="18" height="20" fill="currentColor" aria-hidden="true" focusable="false" ')
  .replace(/>\s+</g, '><')
  .trim();

const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

// focus: na folha, o foco vai para o Copiar (e não para o campo, que abriria cursor e seleção).
const PixCode = (payload, id, { focus = false } = {}) => html`<div class="pix">
  <span class="pix__label" id="${id}">Pix copia e cola</span>
  <div class="pix__row">
    <input class="pix__code" data-pix-code readonly value="${payload}" aria-labelledby="${id}">
    <button class="btn btn--dark" type="button" data-pix-copy${focus ? raw(' autofocus') : ''}><span>Copiar</span></button>
  </div>
</div>`;

// Faixa amarela no site, com o código e o QR.
const CafeStrip = (pix) => html`<section class="cafe" id="cafe" aria-labelledby="cafe-title">
  <div class="cafe__inner wrap" data-pix>
    <div class="cafe__text">
      <h2 class="cafe__title" id="cafe-title">Curtiu? Me paga um cafezinho.</h2>
      <p>O site é de graça e continua sem anúncio. Se quiser ajudar, manda um Pix de qualquer valor. Você escolhe quanto no app do banco.</p>
      ${PixCode(pix.payload, 'pix-faixa')}
    </div>
    <figure class="cafe__qr">${raw(pix.svg)}<figcaption>Ou aponte a câmera do app do banco</figcaption></figure>
  </div>
</section>`;

// Folha que sobe no celular depois do download (sem QR: não dá pra escanear a própria tela).
const CafeSheet = (pix) => html`<dialog class="sheet" data-cafe-sheet aria-labelledby="sheet-title">
  <div class="sheet__body" data-pix>
    <span class="sheet__grip" aria-hidden="true"></span>
    <h2 class="sheet__title" id="sheet-title">Imagem salva! Que tal um cafezinho?</h2>
    <p>Se o Na Minha Tela te ajudou, um Pix de qualquer valor mantém o site no ar e sem anúncio.</p>
    ${PixCode(pix.payload, 'pix-folha', { focus: true })}
    <button class="sheet__close" type="button" data-cafe-close>Agora não</button>
  </div>
</dialog>`;

const PASSOS = [
  ['Escolha a capa', 'Escolha o arquivo, arraste para a área ou cole com Ctrl+V. Dá para fazer de uma capa, de uma estante com até 9 ou de uma citação.'],
  ['Ajuste do seu jeito', 'Status, progresso, nota, cores, alinhamento e efeitos. A prévia muda na hora.'],
  ['Baixe e poste', 'Story ou feed. Baixe, copie ou compartilhe direto do celular.'],
];

export default function page({ assets, pix }) {
  return html`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Na Minha Tela</title>
<meta name="description" content="Monte stories e posts com a capa do livro, jogo, série ou HQ do momento. A imagem é feita no seu aparelho e nada é enviado.">
<meta name="theme-color" content="#0E0F1A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_CSS}">
<link rel="stylesheet" href="${assets.css}">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<header class="site-header wrap">
  <a class="logo" href="/" aria-label="Na Minha Tela, início"><span>na minha tela</span><i class="logo__dot" aria-hidden="true"></i></a>
  ${pix ? html`<a class="site-header__cafe" href="#cafe">Pagar um café</a>` : ''}
</header>
<main>
  <div class="wrap">
    <h1 class="page-title">Mostra o que tá <em>na sua tela</em>.</h1>
    <p class="page-lede">Monte stories e posts com a capa do livro, jogo, série ou HQ do momento. A imagem é feita no seu aparelho e nada é enviado.</p>
    ${app()}
  </div>

  <section class="how wrap" aria-labelledby="how-title">
    <h2 class="section-title" id="how-title">Como funciona</h2>
    <ol class="how__list" role="list">
      ${PASSOS.map(([t, d], i) => html`<li class="how__item"><span class="how__n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`)}
    </ol>
  </section>

  ${pix ? CafeStrip(pix) : ''}
</main>
<footer class="site-footer wrap">
  <p>Tudo é feito no seu navegador. A imagem nunca sai do seu aparelho.</p>
  <p>Sem cadastro e sem anúncio.</p>
  <p class="credit">Desenvolvido por <a href="https://www.thiagoraphael.com.br/">${raw(LOGO_TR)}<span>Thiago Raphael</span></a></p>
</footer>
${pix ? CafeSheet(pix) : ''}
<script src="${assets.js}" defer></script>
</body>
</html>
`;
}
