// ---------- App: capa, estante e citação em story (1080×1920) ou feed (1080×1350) ----------
// Portado de meu-site/src/apps/estante/app.js. Mudanças principais:
// - identidade nova: fontes, cantos arredondados, moldura grossa nas capas, logo "na minha tela";
// - tema Noite (paleta nova) ao lado dos temas herdados;
// - alinhamento à esquerda ou ao centro (regra 5);
// - progresso arredondado e limitado a 0–100% (regra 4), com "Página 120 de 680" no singular;
// - sem rótulo próprio, comentário e retângulos da marca;
// - folha do café depois do download (cafe.js).
const form = $('[data-app="estante"]');
if (form) {
  const canvas = $('[data-canvas]');
  const ctx = canvas.getContext('2d');
  const status = $('[data-status]');
  const thumbsEl = $('[data-thumbs]');
  const W = 1080;
  const state = { capa: null, capaPal: null, capas: [], qCapa: null };
  const MAX_CAPAS = 9; // regra 3
  const SITE = CONFIG.dominio || '';

  const STATUS = { lendo: 'TÔ LENDO', jogando: 'TÔ JOGANDO', assistindo: 'TÔ ASSISTINDO', ouvindo: 'TÔ OUVINDO', terminei: 'TERMINEI' };

  // Temas: fundo, texto, selo, barra (accent), estrelas, trilho da barra, palavra destacada e espaço vazio.
  const THEMES = {
    noite: { bg: COR.noite, fg: COR.papel, chipBg: COR.sinal, chipFg: COR.noite, accent: COR.coral, stars: COR.sinal, track: mix(COR.noite, COR.papel, 0.18), hl: COR.sinal, empty: COR.tela },
    escuro: { bg: BRAND.escuro, fg: BRAND.claro, chipBg: BRAND.lima, chipFg: BRAND.escuro, accent: BRAND.lima, track: BRAND.raised, hl: BRAND.rosa, empty: BRAND.raised },
    rosa: { bg: BRAND.rosa, fg: BRAND.escuro, chipBg: BRAND.escuro, chipFg: BRAND.lima, accent: BRAND.escuro, track: BRAND.claro, hl: BRAND.claro, empty: BRAND.escuro },
    roxo: { bg: BRAND.roxo, fg: BRAND.claro, chipBg: BRAND.lima, chipFg: BRAND.escuro, accent: BRAND.lima, track: BRAND.escuro, hl: BRAND.lima, empty: BRAND.escuro },
    lima: { bg: BRAND.lima, fg: BRAND.escuro, chipBg: BRAND.roxo, chipFg: BRAND.claro, accent: BRAND.roxo, track: BRAND.escuro, hl: BRAND.rosa, empty: BRAND.escuro },
  };
  // Tema "cor da capa": fundo com a cor que mais aparece, texto no contraste certo, destaque com as outras cores.
  function coverTheme(pal) {
    if (!pal || !pal.length) return THEMES.noite;
    // Fundo com a segunda cor mais presente (com a primeira a capa sumiria no fundo); sem ela, a primeira escurecida.
    const alt = pal.slice(1).find((c) => contrast(c.hex, pal[0].hex) >= 1.5);
    const bg = alt ? alt.hex : rgbToHex(...pal[0].rgb.map((v) => v * 0.45));
    const fg = readableOn(bg);
    const others = pal.filter((c) => c.hex !== bg && contrast(c.hex, bg) > 1.6);
    const accent = others.find((c) => contrast(c.hex, bg) >= 3)?.hex || fg;
    return { bg, fg, chipBg: fg, chipFg: bg, accent, track: mix(bg, fg, 0.22), hl: accent, empty: mix(bg, fg, 0.14) };
  }
  // Tema "minha cor": fundo e destaque escolhidos; texto e trilho calculados pelo contraste.
  function customTheme() {
    const bg = val('cor_fundo') || COR.azul;
    let accent = val('cor_destaque') || COR.sinal;
    const fg = readableOn(bg);
    if (contrast(accent, bg) < 1.4) accent = fg;
    return { bg, fg, chipBg: accent, chipFg: readableOn(accent), accent, track: mix(bg, fg, 0.22), hl: accent, empty: mix(bg, fg, 0.14) };
  }
  function theme() {
    const v = radioValue('tema', form);
    $('[data-custom-only]', form).hidden = v !== 'minha';
    const sw = $('input[name="tema"][value="minha"] + span .seg__swatch', form);
    if (sw) sw.style.background = val('cor_fundo') || COR.azul;
    let t;
    if (v === 'minha') t = customTheme();
    else if (v === 'capa') {
      const mode = radioValue('modo', form);
      t = coverTheme(mode === 'capa' ? state.capaPal : mode === 'citacao' ? state.qCapa?.pal : state.capas[0]?.pal);
    } else t = THEMES[v] || THEMES.noite;
    return { stars: t.accent, ...t, frame: borderColor(t) };
  }
  // Cor da borda das capas. Automática: Papel; em fundo claro, onde ela sumiria, vai na cor do texto.
  function borderColor(t) {
    const v = radioValue('borda_cor', form);
    if (v === 'texto') return t.fg;
    if (v === 'destaque') return t.accent;
    if (v === 'minha') return val('cor_borda') || COR.papel;
    return contrast(t.bg, COR.papel) < 1.4 ? t.fg : COR.papel;
  }
  // Espessura da borda: o controle vale para a capa do story (padrão 18); os outros tamanhos seguem na proporção.
  const border = (base) => (base * Number(val('borda') || 0)) / 18;

  const val = (n) => form.elements[n]?.value?.trim() ?? '';
  const checked = (n) => !!form.elements[n]?.checked;

  // Rascunho (só os textos; as imagens não são guardadas).
  const DRAFT = 'estante:draft';
  const TEXTS = ['desfoque', 'pelicula', 'grao', 'tam_capa', 'borda', 'cor_borda', 'cor_fundo', 'cor_destaque','status', 'titulo', 'autor', 'unidade', 'atual', 'total', 'nota', 'e_titulo', 'e_sub', 'q_texto', 'q_autor', 'q_obra', 'arroba'];
  const RADIOS = ['modo', 'formato', 'tema', 'e_recorte', 'fundo_tipo', 'alinhar', 'borda_cor'];
  const CHECKS = { e_rank: false, assinatura: true, sombra: true, inclinar: false };
  function loadDraft() {
    const d = store.get(DRAFT, null);
    if (!d) return;
    TEXTS.forEach((n) => { if (d[n] != null && form.elements[n]) form.elements[n].value = d[n]; });
    RADIOS.forEach((n) => d[n] && setRadio(n, d[n], form));
    Object.keys(CHECKS).forEach((n) => { if (typeof d[n] === 'boolean' && form.elements[n]) form.elements[n].checked = d[n]; });
  }
  function saveDraft() {
    const d = {};
    TEXTS.forEach((n) => { d[n] = form.elements[n]?.value ?? ''; });
    RADIOS.forEach((n) => { d[n] = radioValue(n, form); });
    Object.keys(CHECKS).forEach((n) => { d[n] = checked(n); });
    store.set(DRAFT, d);
  }

  // ---------- Desenho ----------
  const font = (kind, size) => ({ display: `800 ${size}px ${FONTS.body}`, chip: `600 ${size}px ${FONTS.mono}`, mono: `500 ${size}px ${FONTS.mono}`, body: `400 ${size}px ${FONTS.body}` }[kind]);

  // Alinhamento (regra 5): x de um bloco de largura w dentro da faixa [x0, x0 + span].
  const centered = () => radioValue('alinhar', form) === 'centro';
  const alignX = (w, x0, span) => (centered() ? x0 + (span - w) / 2 : x0);
  const fillAligned = (text, x0, y, span) => ctx.fillText(text, alignX(ctx.measureText(text).width, x0, span), y);

  // Selo em pílula. Devolve a altura.
  function chip(text, x0, y, size, t, span) {
    ctx.font = font('chip', size);
    const padX = size * 0.75, padY = size * 0.5;
    const w = ctx.measureText(text).width + padX * 2;
    const h = size + padY * 2;
    const x = alignX(w, x0, span);
    ctx.fillStyle = t.chipBg;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = t.chipFg;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + h / 2 + size * 0.04);
    ctx.textBaseline = 'alphabetic';
    return h;
  }

  function star(cx, cy, r, fill, stroke, part = 1) {
    const path = new Path2D();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.46 : r;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      i ? path.lineTo(x, y) : path.moveTo(x, y);
    }
    path.closePath();
    ctx.lineWidth = Math.max(3, r * 0.12);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke;
    ctx.stroke(path);
    if (part > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - r, cy - r, r * 2 * part, r * 2);
      ctx.clip();
      ctx.fillStyle = fill;
      ctx.fill(path);
      ctx.restore();
    }
  }
  // Cinco estrelas + "3,5/5", alinhadas como o resto do texto.
  function rating(nota, x0, y, r, t, span, size) {
    const label = `${String(nota).replace('.', ',')}/5`;
    ctx.font = font('mono', size);
    const x = alignX(r * 2.5 * 5 + 10 + ctx.measureText(label).width, x0, span);
    for (let i = 0; i < 5; i++) star(x + r + i * r * 2.5, y + r, r, t.stars, t.fg, Math.max(0, Math.min(1, nota - i)));
    ctx.fillStyle = t.fg;
    ctx.font = font('mono', size);
    ctx.fillText(label, x + r * 2.5 * 5 + 10, y + r + size * 0.35);
  }
  // Barra de progresso arredondada, sempre com a largura toda (regra 5).
  function bar(x, y, w, h, pct, t) {
    ctx.fillStyle = t.track;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    if (pct > 0) {
      ctx.fillStyle = t.accent;
      roundRect(ctx, x, y, Math.max(h, (w * pct) / 100), h, h / 2);
      ctx.fill();
    }
  }

  // Rodapé: @ e logo (com o endereço, quando houver). À esquerda: @ num canto e logo no outro. Ao centro: os dois juntos.
  function footer(H, P, bottom, t) {
    const at = val('arroba');
    const sig = checked('assinatura');
    if (!at && !sig) return;
    const size = 28, y = H - bottom + 10;
    ctx.font = font('mono', size);
    const atTxt = at ? (at.startsWith('@') ? at : `@${at}`) : '';
    const atW = atTxt ? ctx.measureText(atTxt).width : 0;
    const lw = sig ? logoWidth(ctx, size, SITE) : 0;
    ctx.fillStyle = t.fg;
    if (centered()) {
      const gap = atTxt && sig ? size * 1.2 : 0;
      let x = (W - (atW + gap + lw)) / 2;
      if (atTxt) { ctx.font = font('mono', size); ctx.fillStyle = t.fg; ctx.fillText(atTxt, x, y); x += atW + gap; }
      if (sig) drawLogo(ctx, x, y, size, t.fg, SITE);
    } else {
      if (atTxt) ctx.fillText(atTxt, P, y);
      if (sig) drawLogo(ctx, W - P - lw, y, size, t.fg, SITE);
    }
  }

  // Capa com moldura grossa (fica por fora de x, y, w, h), sombra e inclinação opcionais.
  // Sem imagem, desenha o espaço reservado com um aviso. src = recorte da imagem (modo "mesmo tamanho").
  const tilted = () => checked('inclinar') && radioValue('modo', form) !== 'estante';
  function framed(img, x, y, w, h, t, { frame, src = null, label = 'Envie a capa' }) {
    const r = Math.max(frame * 1.6, Math.min(w, h) * 0.045);
    const inner = frame > 0 ? Math.max(3, r - frame * 0.7) : r;
    ctx.save();
    if (tilted()) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((-2.5 * Math.PI) / 180);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }
    // Sem borda: a imagem é pintada direto no formato arredondado (como padrão de preenchimento), num passo só
    // com a sombra. Pintar um fundo e recortar a imagem por cima deixava um fio de cor vazando nos cantos.
    if (frame <= 0) {
      let fill = t.empty;
      if (img) {
        const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
        const [sx, sy, sw, sh] = src || [0, 0, iw, ih];
        const kx = w / sw, ky = h / sh;
        fill = ctx.createPattern(img, 'no-repeat');
        fill.setTransform(new DOMMatrix([kx, 0, 0, ky, x - sx * kx, y - sy * ky]));
      }
      withShadow(ctx, checked('sombra'), () => { ctx.fillStyle = fill; roundRect(ctx, x, y, w, h, inner); ctx.fill(); }, w / 700);
      if (!img) placeholderText(x, y, w, h, t, label);
      ctx.restore();
      return;
    }
    withShadow(ctx, checked('sombra'), () => {
      ctx.fillStyle = t.frame;
      roundRect(ctx, x - frame, y - frame, w + frame * 2, h + frame * 2, r);
      ctx.fill();
    }, w / 700);
    roundRect(ctx, x, y, w, h, inner);
    ctx.clip();
    if (img) src ? ctx.drawImage(img, ...src, x, y, w, h) : ctx.drawImage(img, x, y, w, h);
    else {
      ctx.fillStyle = t.empty;
      ctx.fillRect(x, y, w, h);
      placeholderText(x, y, w, h, t, label);
    }
    ctx.restore();
  }
  // Aviso dentro do espaço vazio da capa.
  function placeholderText(x, y, w, h, t, label) {
    ctx.fillStyle = mix(t.empty, readableOn(t.empty), 0.5);
    ctx.font = font('mono', Math.max(20, Math.min(36, w / 9)));
    const lines = wrapLines(ctx, label, w - 40);
    lines.forEach((l, i) => { const lw = ctx.measureText(l).width; ctx.fillText(l, x + (w - lw) / 2, y + h / 2 + 10 + (i - (lines.length - 1) / 2) * 44); });
  }

  // Margens: o story deixa espaço pra barra de perfil e pra caixa de resposta do Instagram.
  const frame = () => (radioValue('formato', form) === 'feed' ? { H: 1350, P: 80, top: 96, bottom: 96 } : { H: 1920, P: 88, top: 230, bottom: 250 });
  const hasFooter = () => !!val('arroba') || checked('assinatura');

  // Unidades de progresso: [singular, plural, rótulo do campo "atual", rótulo do total, exemplos].
  const UNIDADE = {
    paginas: ['página', 'páginas', 'Página atual', 'Total de páginas', '120', '680'],
    capitulos: ['capítulo', 'capítulos', 'Capítulo atual', 'Total de capítulos', '12', '40'],
    episodios: ['episódio', 'episódios', 'Episódio atual', 'Total de episódios', '5', '24'],
    horas: ['hora', 'horas', 'Horas', '', '18', ''],
    porcento: [null, null, 'Porcentagem', '', '35', ''],
  };
  // Campos de progresso conforme a unidade: sem progresso esconde os dois; porcentagem e horas não têm total.
  const SEM_TOTAL = ['porcento', 'horas'];
  function syncProgressFields() {
    const un = val('unidade');
    $('[data-progress-fields]', form).hidden = un === 'nenhum';
    $('[data-total-field]', form).hidden = SEM_TOTAL.includes(un);
    const u = UNIDADE[un];
    if (!u) return;
    const setLabel = (name, text, ph) => {
      const el = form.elements[name];
      el.closest('label').querySelector('span').textContent = text;
      el.placeholder = ph;
    };
    setLabel('atual', u[2], u[4]);
    if (u[3]) setLabel('total', u[3], u[5]);
    if (un === 'porcento') form.elements.atual.max = 100; else form.elements.atual.removeAttribute('max');
  }

  // Dados comuns da capa (story e feed). Progresso: regra 4 (arredondado, limitado a 0–100%).
  function capaData() {
    const un = val('unidade') || 'paginas';
    const atual = Math.max(0, Math.floor(Number(val('atual')) || 0));
    // Horas não têm total: sai só "18 horas", sem barra.
    const total = SEM_TOTAL.includes(un) ? 0 : Math.max(0, Math.floor(Number(val('total')) || 0));
    const clampPct = (v) => Math.min(100, Math.max(0, Math.round(v)));
    let prog = null;
    if (un === 'porcento') {
      if (atual) { const pct = clampPct(atual); prog = { txt: `${pct}%`, pct }; }
    } else if (un !== 'nenhum' && (atual || total)) {
      const [s1, s2] = UNIDADE[un] || UNIDADE.paginas;
      const nome = (n) => (n === 1 ? s1 : s2);
      if (!total) prog = { txt: `${atual} ${nome(atual)}`, pct: null };
      else {
        const pct = clampPct((atual / total) * 100);
        prog = { txt: `${s1[0].toUpperCase()}${s1.slice(1)} ${atual} de ${total} · ${pct}%`, pct };
      }
    }
    return { label: STATUS[val('status')] || STATUS.lendo, titulo: val('titulo'), autor: val('autor'), prog, nota: Math.max(0, Math.min(5, Number(val('nota')) || 0)) };
  }
  const coverScale = () => Number(val('tam_capa') || 100) / 100;

  // Feed 4:5: capa à esquerda, texto à direita.
  function drawCapaFeed(f, t) {
    const { H, P, top, bottom } = f;
    const d = capaData();
    const FR = border(14);
    const footerH = hasFooter() ? 60 : 0;
    const colGap = 56;
    const coverW = Math.round((W - P * 2) * 0.46);
    const textX = P + coverW + colGap, textW = W - P - textX;
    const areaH = H - top - bottom - footerH;
    const img = state.capa;
    const k = coverScale();
    const boxW = coverW - FR * 2, boxH = areaH - FR * 2;
    const [cw0, ch0] = img ? containSize(img, boxW, boxH) : [boxW, Math.min(boxH, boxW * 1.5)];
    const cw = cw0 * k, ch = ch0 * k;
    framed(img, P + (coverW - cw) / 2, top + (areaH - ch) / 2, cw, ch, t, { frame: FR });

    // Coluna de texto centralizada na altura da capa.
    const blocks = [];
    blocks.push({ h: 32 * 2 + 30, draw: (y) => chip(d.label, textX, y, 32, t, textW) });
    let ts = 76;
    ctx.font = font('display', ts);
    let tl = d.titulo ? wrapLines(ctx, d.titulo, textW) : [];
    while (tl.length > 3 && ts > 48) { ts -= 4; ctx.font = font('display', ts); tl = wrapLines(ctx, d.titulo, textW); }
    tl = clampLines(ctx, tl, 3, textW);
    if (tl.length) blocks.push({ h: tl.length * ts * 0.98 + 18, draw: (y) => { ctx.font = font('display', ts); ctx.fillStyle = t.fg; tl.forEach((l, i) => fillAligned(l, textX, y + ts * 0.82 + i * ts * 0.98, textW)); } });
    if (d.autor) blocks.push({ h: 34 + 26, draw: (y) => { ctx.font = font('body', 32); ctx.fillStyle = t.fg; fillAligned(clampLines(ctx, wrapLines(ctx, d.autor, textW), 1, textW)[0], textX, y + 28, textW); } });
    if (d.prog) blocks.push({ h: 28 + (d.prog.pct != null ? 28 : 0) + 30, draw: (y) => {
      ctx.font = font('mono', 26); ctx.fillStyle = t.fg; fillAligned(clampLines(ctx, [d.prog.txt], 1, textW)[0], textX, y + 23, textW);
      if (d.prog.pct != null) bar(textX, y + 42, textW, 14, d.prog.pct, t);
    } });
    if (d.nota > 0) blocks.push({ h: 44 + 30, draw: (y) => rating(d.nota, textX, y, 21, t, textW, 26) });
    const total = blocks.reduce((a, b) => a + b.h, 0);
    let y = top + Math.max(0, (areaH - total) / 2);
    for (const b of blocks) { b.draw(y); y += b.h; }
    footer(H, P, bottom - 40, t);
    return `${d.label}: ${d.titulo || 'sem título'}${d.autor ? `, de ${d.autor}` : ''}`;
  }

  function drawCapa(f, t) {
    if (f.H < 1500) return drawCapaFeed(f, t);
    const { H, P, top, bottom } = f;
    const d = capaData();
    const FR = border(18);
    const maxW = W - P * 2;
    let y = top;
    y += chip(d.label, P, y, 44, t, maxW) + 56;

    // Blocos de baixo (medidos antes, pra capa ocupar o que sobra).
    const titleSize = 92;
    ctx.font = font('display', titleSize);
    const titleLines = d.titulo ? clampLines(ctx, wrapLines(ctx, d.titulo, maxW), 2, maxW) : [];
    ctx.font = font('body', 40);
    const autor = d.autor ? clampLines(ctx, wrapLines(ctx, d.autor, maxW), 1, maxW)[0] : '';
    const gap = 30, barH = 20;
    let below = 0;
    if (titleLines.length) below += titleLines.length * titleSize * 0.98 + gap;
    if (autor) below += 40 + gap;
    if (d.prog) below += 34 + (d.prog.pct != null ? 18 + barH : 0) + gap;
    if (d.nota > 0) below += 60 + gap;
    const footerH = hasFooter() ? 60 : 0;
    const coverBox = Math.max(200, H - bottom - footerH - y - below - 46);

    // Capa (ou espaço reservado) centralizada. O tamanho encolhe a capa no espaço dela, sem mexer no texto.
    const img = state.capa;
    const k = coverScale();
    const boxW = maxW - FR * 2, boxH = coverBox - FR * 2;
    const [cw0, ch0] = img ? containSize(img, boxW, boxH) : [Math.min(boxW, (boxH * 2) / 3), boxH];
    const cw = cw0 * k, ch = ch0 * k;
    framed(img, (W - cw) / 2, y + FR + (ch0 - ch) / 2, cw, ch, t, { frame: FR });
    y += ch0 + FR * 2 + 50;

    ctx.fillStyle = t.fg;
    if (titleLines.length) {
      ctx.font = font('display', titleSize);
      titleLines.forEach((l, i) => fillAligned(l, P, y + titleSize * 0.82 + i * titleSize * 0.98, maxW));
      y += titleLines.length * titleSize * 0.98 + gap;
    }
    if (autor) {
      ctx.font = font('body', 40);
      fillAligned(autor, P, y + 33, maxW);
      y += 40 + gap;
    }
    if (d.prog) {
      ctx.font = font('mono', 34);
      fillAligned(d.prog.txt, P, y + 29, maxW);
      y += 34;
      if (d.prog.pct != null) { y += 18; bar(P, y, maxW, barH, d.prog.pct, t); y += barH; }
      y += gap;
    }
    if (d.nota > 0) rating(d.nota, P, y, 29, t, maxW, 34);
    footer(H, P, bottom - 40, t);
    return `${d.label}: ${d.titulo || 'sem título'}${d.autor ? `, de ${d.autor}` : ''}`;
  }

  // Estante: no centro, só cabeçalho e rodapé mudam; a grade é sempre a mesma (regra 5).
  function drawEstante(f, t) {
    const { H, P, top, bottom } = f;
    const feed = H < 1500;
    const maxW = W - P * 2;
    let y = top;
    const sub = val('e_sub');
    if (sub) y += chip(sub.toUpperCase(), P, y, feed ? 30 : 36, t, maxW) + (feed ? 24 : 34);
    const title = val('e_titulo') || 'Minha estante';
    let size = feed ? 110 : 140;
    ctx.font = font('display', size);
    while (ctx.measureText(title).width > maxW && size > 56) { size -= 4; ctx.font = font('display', size); }
    ctx.fillStyle = t.fg;
    fillAligned(title, P, y + size * 0.82, maxW);
    y += size + (feed ? 36 : 56);

    const footerH = hasFooter() ? 70 : 0;
    const areaW = maxW, areaH = H - bottom - footerH - y;
    const list = state.capas;
    const n = Math.max(list.length, 1);
    const cols = n === 1 ? 1 : n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const gap = feed ? 24 : 30;
    const cellW = Math.min((areaW - gap * (cols - 1)) / cols, ((areaH - gap * (rows - 1)) / rows) * (2 / 3));
    const cellH = cellW * 1.5;
    const fr = border(Math.max(5, Math.round(cellW * 0.035)));
    const gridW = cols * cellW + (cols - 1) * gap, gridH = rows * cellH + (rows - 1) * gap;
    const gx = (W - gridW) / 2, gy = y + (areaH - gridH) / 2;
    const inteira = radioValue('e_recorte', form) === 'inteira';
    const rank = checked('e_rank');
    for (let i = 0; i < n; i++) {
      // A última fileira incompleta fica centralizada.
      const row = Math.floor(i / cols), inRow = row === rows - 1 ? n - row * cols : cols;
      const x = gx + (gridW - (inRow * cellW + (inRow - 1) * gap)) / 2 + (i % cols) * (cellW + gap), yy = gy + row * (cellH + gap);
      const iw = cellW - fr * 2, ih = cellH - fr * 2;
      const it = list[i];
      if (!it) { framed(null, x + fr, yy + fr, iw, ih, t, { frame: fr, label: 'Adicione capas' }); continue; }
      let bx = x + fr, by = yy + fr;
      if (inteira) {
        const [w, h] = containSize(it.img, iw, ih);
        bx += (iw - w) / 2; by += ih - h;
        framed(it.img, bx, by, w, h, t, { frame: fr });
      } else framed(it.img, bx, by, iw, ih, t, { frame: fr, src: coverRect(it.img, iw, ih) });
      if (rank) {
        const s = Math.max(26, cellW * 0.13);
        ctx.font = font('display', s);
        const label = String(i + 1);
        const bh = s * 1.3, bw = Math.max(bh, ctx.measureText(label).width + s * 0.8);
        const rx = x + fr + s * 0.25, ry = (inteira ? by : yy + fr) + s * 0.25;
        ctx.fillStyle = t.chipBg;
        roundRect(ctx, rx, ry, bw, bh, bh / 2);
        ctx.fill();
        ctx.fillStyle = t.chipFg;
        ctx.fillText(label, rx + (bw - ctx.measureText(label).width) / 2, ry + bh * 0.76);
      }
    }
    footer(H, P, bottom - 40, t);
    return `${title}: estante com ${list.length} ${list.length === 1 ? 'capa' : 'capas'}`;
  }

  // Frase com uma palavra destacada ([[assim]]): tokens na mesma linha, a destacada em outra cor.
  function quoteLayout(text, size, maxW) {
    const tokens = [];
    String(text).split(/(\[\[.+?\]\])/).forEach((part) => {
      const acc = /^\[\[(.+)\]\]$/.exec(part);
      (acc ? acc[1] : part).split(/(\s+)/).forEach((w) => { if (w && !/^\s+$/.test(w)) tokens.push({ w, acc: !!acc }); else if (w && /\n/.test(w)) tokens.push({ br: true }); });
    });
    ctx.font = font('display', size);
    const sp = ctx.measureText(' ').width;
    const lines = [[]];
    let lineW = 0;
    for (const tk of tokens) {
      if (tk.br) { lines.push([]); lineW = 0; continue; }
      const ww = ctx.measureText(tk.w).width;
      const add = (lines[lines.length - 1].length ? sp : 0) + ww;
      if (lineW + add > maxW && lines[lines.length - 1].length) { lines.push([]); lineW = 0; }
      const cur = lines[lines.length - 1];
      tk.x = cur.length ? lineW + sp : 0;
      tk.width = ww;
      lineW = tk.x + ww;
      cur.push(tk);
    }
    return { lines: lines.filter((l) => l.length), lh: size * 1.06 };
  }

  function drawCitacao(f, t) {
    const { H, P, top, bottom } = f;
    const feed = H < 1500;
    const maxW = W - P * 2;
    const text = val('q_texto') || 'Escreva a [[frase]] que ficou na sua cabeça.';
    const autor = val('q_autor'), obra = val('q_obra');
    const qc = state.qCapa;
    const footerH = hasFooter() ? 70 : 0;
    const metaH = autor || obra || qc ? (qc ? (feed ? 200 : 260) : 110) : 0;
    const markSize = feed ? 260 : 340;
    const availH = H - top - bottom - footerH - metaH - markSize * 0.55 - (feed ? 40 : 70);

    // Maior tamanho que cabe.
    let size = feed ? 100 : 116, lay;
    for (; size >= 40; size -= 4) { lay = quoteLayout(text, size, maxW); if (lay.lines.length * lay.lh <= availH) break; }

    ctx.fillStyle = t.accent;
    ctx.font = font('display', markSize);
    const mw = ctx.measureText('“').width;
    ctx.fillText('“', centered() ? (W - mw) / 2 : P - markSize * 0.04, top + markSize * 0.72);

    const blockH = lay.lines.length * lay.lh;
    const metaGap = feed ? 40 : 60;
    // Frase + autor centralizados juntos no espaço livre.
    let y = top + markSize * 0.55 + Math.max(0, (availH + metaH - blockH - (metaH ? metaGap + metaH : 0)) / 2);
    ctx.font = font('display', size);
    for (const line of lay.lines) {
      const last = line[line.length - 1];
      const lx = alignX(last.x + last.width, P, maxW);
      for (const tk of line) {
        ctx.fillStyle = tk.acc ? t.hl : t.fg;
        ctx.fillText(tk.w, lx + tk.x, y + size * 0.86);
      }
      y += lay.lh;
    }
    y += metaGap;

    if (metaH) {
      const fr = border(8);
      const aSize = feed ? 36 : 42, oSize = feed ? 32 : 38;
      ctx.font = font('mono', aSize); const aw = autor ? ctx.measureText(autor).width : 0;
      ctx.font = font('body', oSize); const ow = obra ? ctx.measureText(obra).width : 0;
      let cw = 0, ch = 0;
      if (qc) [cw, ch] = containSize(qc.img, metaH * 0.75 - fr * 2, metaH - fr * 2);
      const textGap = qc ? 36 + fr : 0;
      let x = alignX((qc ? cw + fr : 0) + textGap + Math.max(aw, ow), P, maxW);
      if (qc) { framed(qc.img, x + fr, y + fr, cw, ch, t, { frame: fr }); x += cw + fr + textGap; }
      const ty = qc ? y + metaH / 2 - 10 : y + 40;
      ctx.fillStyle = t.fg;
      if (autor) { ctx.font = font('mono', aSize); ctx.fillText(autor, x, ty); }
      if (obra) { ctx.font = font('body', oSize); ctx.fillText(obra, x, ty + (autor ? (feed ? 50 : 58) : 0)); }
    }
    footer(H, P, bottom - 40, t);
    return `Citação: ${text.replace(/\[\[|\]\]/g, '')}${autor ? `, ${autor}` : ''}`;
  }

  function draw() {
    const f = frame();
    if (canvas.width !== W || canvas.height !== f.H) { canvas.width = W; canvas.height = f.H; }
    const t = theme();
    const mode = radioValue('modo', form);
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, f.H);
    // Capa no fundo: a do modo aberto (na estante, a primeira).
    const bgImg = mode === 'capa' ? state.capa : mode === 'citacao' ? state.qCapa?.img : state.capas[0]?.img;
    const useImg = radioValue('fundo_tipo', form) === 'imagem';
    $$('[data-bg-image-only]', form).forEach((el) => { el.hidden = !useImg; });
    $$('[data-hide-in]', form).forEach((el) => { el.hidden = el.dataset.hideIn.split(' ').includes(mode); });
    syncProgressFields();
    $('[data-border-only]', form).hidden = !Number(val('borda'));
    $('[data-border-custom]', form).hidden = radioValue('borda_cor', form) !== 'minha';
    if (useImg && bgImg) drawBackdrop(ctx, bgImg, W, f.H, { blur: Number(val('desfoque')) * 0.9, tint: t.bg, dim: Number(val('pelicula')) / 100 });
    const desc = mode === 'estante' ? drawEstante(f, t) : mode === 'citacao' ? drawCitacao(f, t) : drawCapa(f, t);
    applyGrain(ctx, W, f.H, Number(val('grao')));
    canvas.setAttribute('aria-label', `Prévia do ${f.H > 1500 ? 'story' : 'post'}. ${desc}`);
    saveDraft();
  }
  const render = scheduler(draw);

  // ---------- Imagens ----------
  async function addImage(file) {
    const img = await fileToImage(file);
    return { img, pal: extractPalette(img, 5, { max: 64 }) };
  }
  bindDrop($('[data-drop="capa"]'), async ([file]) => {
    try { const r = await addImage(file); state.capa = r.img; state.capaPal = r.pal; render(); say(status, 'Capa carregada.'); }
    catch (e) { say(status, e.message, 5000); }
  }, { paste: false });

  function renderThumbs() {
    thumbsEl.replaceChildren(...state.capas.map((it, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="thumbs__n">${i + 1}</span><div class="thumbs__bar"><button type="button" data-move="-1" aria-label="Mover capa ${i + 1} pra trás">←</button><button type="button" data-del aria-label="Remover capa ${i + 1}">×</button><button type="button" data-move="1" aria-label="Mover capa ${i + 1} pra frente">→</button></div>`;
      const im = document.createElement('img');
      im.src = it.img.src;
      im.alt = `Capa ${i + 1}`;
      li.prepend(im);
      li.dataset.i = i;
      return li;
    }));
  }
  thumbsEl.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = Number(b.closest('li').dataset.i);
    if (b.hasAttribute('data-del')) state.capas.splice(i, 1);
    else {
      const j = i + Number(b.dataset.move);
      if (j < 0 || j >= state.capas.length) return;
      [state.capas[i], state.capas[j]] = [state.capas[j], state.capas[i]];
    }
    renderThumbs();
    render();
    const again = thumbsEl.querySelector(`li[data-i="${Math.min(i, state.capas.length - 1)}"] button${b.dataset.move ? `[data-move="${b.dataset.move}"]` : '[data-del]'}`);
    again?.focus();
  });
  bindDrop($('[data-drop="capas"]'), async (files) => {
    const free = MAX_CAPAS - state.capas.length;
    if (free <= 0) { say(status, 'A estante já tem 9 capas. Remova uma pra trocar.', 4000); return; }
    for (const file of files.slice(0, free)) {
      try { state.capas.push(await addImage(file)); } catch (e) { say(status, e.message, 5000); }
    }
    if (files.length > free) say(status, `Entraram só ${free}. O limite é 9 capas.`, 4000);
    renderThumbs();
    render();
  }, { paste: false });
  const clearQ = $('[data-clear-qcapa]');
  bindDrop($('[data-drop="q_capa"]'), async ([file]) => {
    try { state.qCapa = await addImage(file); clearQ.hidden = false; render(); } catch (e) { say(status, e.message, 5000); }
  }, { paste: false });
  clearQ.addEventListener('click', () => { state.qCapa = null; clearQ.hidden = true; render(); });

  // Colar (Ctrl+V) vai pro modo aberto.
  document.addEventListener('paste', async (e) => {
    if (e.target.closest && e.target.closest('input:not([type="file"]), textarea')) return;
    const files = [...(e.clipboardData?.items || [])].filter((i) => i.kind === 'file').map((i) => i.getAsFile()).filter((f) => f && f.type.startsWith('image/'));
    if (!files.length) return;
    e.preventDefault();
    const mode = radioValue('modo', form);
    const zone = mode === 'estante' ? 'capas' : mode === 'citacao' ? 'q_capa' : 'capa';
    const input = $(`[data-drop="${zone}"] input`);
    const dt = new DataTransfer();
    (mode === 'estante' ? files : files.slice(0, 1)).forEach((f) => dt.items.add(f));
    input.files = dt.files;
    input.dispatchEvent(new Event('change'));
  });

  // ---------- Exportar ----------
  const fileName = () => `na-minha-tela-${radioValue('modo', form)}-${radioValue('formato', form)}.png`;
  bindExport(canvas, {
    name: fileName,
    text: () => (SITE ? `Feito em ${SITE}` : 'Feito no Na Minha Tela'),
    status,
    // Antes de exportar: garante as fontes e redesenha na hora (sem esperar o próximo quadro).
    before: async () => { await fontsReady(); draw(); },
    onDownload: () => cafe.afterDownload(),
  });

  loadDraft();
  bindRangeLabels(form);
  bindTabs('modo', form, render);
  form.addEventListener('input', (e) => {
    if (e.target.name === 'cor_fundo' || e.target.name === 'cor_destaque') setRadio('tema', 'minha', form);
    if (e.target.name === 'cor_borda') setRadio('borda_cor', 'minha', form);
    render();
  });
  form.addEventListener('change', render);
  render();
  fontsReady().then(render);
  document.fonts?.addEventListener?.('loadingdone', render);
}
