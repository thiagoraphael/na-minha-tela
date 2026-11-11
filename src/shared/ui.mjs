// Peças de interface do app (renderizadas no build). O comportamento fica em src/app/app.js.
// Portado de meu-site/src/apps/_shared/ui.mjs. Mudança: ícone de download inline (sem o Icon do site).
import { html, attrs, raw } from '../lib/html.mjs';

let uid = 0;
const nextId = (p) => `${p}-${++uid}`;

const ICON_DOWNLOAD = raw('<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');

/** Grupo de rádios em pílula. options: [{ value, label, swatch? }] */
export function Seg({ name, legend, options, checked, tabs = false, hideLegend = false }) {
  return html`<fieldset class="seg${tabs ? ' seg--tabs' : ''}">
    <legend class="${hideLegend ? 'visually-hidden' : 'field-group__title'}">${legend}</legend>
    ${options.map((o) => html`<label class="seg__opt"><input type="radio"${attrs({ name, value: o.value, checked: o.value === (checked ?? options[0].value) })}><span>${o.swatch ? html`<i class="seg__swatch" style="background:${o.swatch}"></i>` : ''}${o.label}</span></label>`)}
  </fieldset>`;
}

/** Campo de texto, número, cor, select, textarea ou range. */
export function Field({ label, name, type = 'text', value, placeholder, hint, options, min, max, step, rows, maxlength, inputmode, autocomplete = 'off', live }) {
  // live: rótulo com o valor do range, ex.: 'Desfoque: {v}' (o app.js atualiza com bindRangeLabels).
  if (live) label = live.replace('{v}', value);
  const id = nextId(name);
  let control;
  if (type === 'select') control = html`<select class="select"${attrs({ id, name })}>${options.map((o) => html`<option${attrs({ value: o.value, selected: o.value === value })}>${o.label}</option>`)}</select>`;
  else if (type === 'textarea') control = html`<textarea class="textarea"${attrs({ id, name, placeholder, rows: rows || 3, maxlength })}>${value || ''}</textarea>`;
  else if (type === 'range') control = html`<input class="range"${attrs({ id, name, type, value, min, max, step, 'data-label': live })}>`;
  else control = html`<input class="input${type === 'color' ? ' input--color' : ''}"${attrs({ id, name, type, value, placeholder, min, max, step, maxlength, inputmode, autocomplete })}>`;
  return html`<label class="field"${attrs({ for: id })}><span>${label}</span>${control}${hint ? html`<small class="field__hint">${hint}</small>` : ''}</label>`;
}

export function Check({ label, name, checked = false }) {
  return html`<label class="check"><input type="checkbox"${attrs({ name, checked })}><span>${label}</span></label>`;
}

/** Área de upload (clique, arrastar ou colar). */
export function Drop({ name = 'arquivo', title = 'Escolher imagem', hint = 'Ou arraste e solte aqui. Também dá pra colar com Ctrl+V.', multiple = false }) {
  return html`<div class="drop" data-drop="${name}">
    <input type="file" accept="image/*"${attrs({ name, multiple, 'aria-label': title })}>
    <span class="drop__title" aria-hidden="true">${title}</span>
    <span class="drop__hint">${hint}</span>
  </div>`;
}

/** Prévia + ações (baixar / copiar / compartilhar) + status. Copiar e compartilhar só aparecem se o navegador suportar. */
export function Preview({ label }) {
  return html`<div class="tool__preview">
    <div class="tool__stage"><canvas data-canvas role="img" aria-label="${label}"></canvas></div>
    <div class="tool__actions">
      <button class="btn btn--primary" type="button" data-download><span>Baixar PNG</span>${ICON_DOWNLOAD}</button>
      <button class="btn btn--secondary" type="button" data-copy-img hidden><span>Copiar imagem</span></button>
      <button class="btn btn--secondary" type="button" data-share hidden><span>Compartilhar</span></button>
    </div>
    <p class="tool__status" role="status" aria-live="polite" data-status></p>
  </div>`;
}

export const NoJs = () => html`<p class="tool-nojs">Esse app precisa de JavaScript ligado no navegador.</p>`;

/** Controles de fundo e efeitos. */
export function Effects({ bgLabel, bgOptions, bgChecked, tintHint, shadowLabel = 'Sombra', shadowChecked = false, extra = '' }) {
  return html`<fieldset class="field-group">
    <legend>Fundo e efeitos</legend>
    ${Seg({ name: 'fundo_tipo', legend: bgLabel, options: bgOptions, checked: bgChecked })}
    <div class="field-row" data-bg-image-only>
      ${Field({ label: '', live: 'Desfoque: {v}', name: 'desfoque', type: 'range', min: 0, max: 100, step: 1, value: 40 })}
      ${Field({ label: '', live: 'Película: {v}%', name: 'pelicula', type: 'range', min: 0, max: 90, step: 1, value: 55, hint: tintHint })}
    </div>
    ${Field({ label: '', live: 'Granulado: {v}', name: 'grao', type: 'range', min: 0, max: 100, step: 1, value: 0, hint: 'Textura de filme por cima da imagem toda.' })}
    ${Check({ label: shadowLabel, name: 'sombra', checked: shadowChecked })}
    ${extra}
  </fieldset>`;
}
