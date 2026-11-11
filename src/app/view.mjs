// App: stories de Capa, Estante (grade) e Citação (spec 6.1 a 6.5). Comportamento em app.js.
// Portado de meu-site/src/apps/estante/view.mjs. Mudanças: status e campos da spec 6.4
// (sem rótulo próprio e comentário), tema Noite, alinhamento, sem retângulos da marca.
import { html } from '../lib/html.mjs';
import { Seg, Field, Check, Drop, Preview, NoJs, Effects } from '../shared/ui.mjs';

const TEMAS = [
  { value: 'noite', label: 'Noite', swatch: '#0E0F1A' },
  { value: 'escuro', label: 'Escuro', swatch: '#1A1A1A' },
  { value: 'rosa', label: 'Rosa', swatch: '#FF007F' },
  { value: 'roxo', label: 'Roxo', swatch: '#7301FF' },
  { value: 'lima', label: 'Lima', swatch: '#D8FB81' },
  { value: 'capa', label: 'Cor da capa', swatch: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 2 2%22%3E%3Crect width=%221%22 height=%221%22 fill=%22%23FFD23F%22/%3E%3Crect x=%221%22 width=%221%22 height=%221%22 fill=%22%23FF5C39%22/%3E%3Crect y=%221%22 width=%221%22 height=%221%22 fill=%22%233B4BFF%22/%3E%3Crect x=%221%22 y=%221%22 width=%221%22 height=%221%22 fill=%22%23F3F1EA%22/%3E%3C/svg%3E') center / cover" },
  { value: 'minha', label: 'Minha cor', swatch: 'transparent' },
];

export default function view() {
  return html`${NoJs()}
<form class="tool" id="app" data-app="estante" autocomplete="off" onsubmit="return false">
  <div class="tool__controls">
    ${Seg({ name: 'modo', legend: 'Tipo de imagem', tabs: true, options: [
      { value: 'capa', label: 'Capa' }, { value: 'estante', label: 'Estante' }, { value: 'citacao', label: 'Citação' }] })}

    <div class="field-group" data-panel-group="modo">
      <div class="field-group" data-panel="capa">
        ${Drop({ name: 'capa', title: 'Escolher capa' })}
        ${Field({ label: 'Status', name: 'status', type: 'select', value: 'lendo', options: [
          { value: 'lendo', label: 'Tô lendo' }, { value: 'jogando', label: 'Tô jogando' },
          { value: 'assistindo', label: 'Tô assistindo' }, { value: 'ouvindo', label: 'Tô ouvindo' },
          { value: 'terminei', label: 'Terminei' }] })}
        ${Field({ label: 'Título', name: 'titulo', placeholder: 'Ex.: Duna', maxlength: 80 })}
        ${Field({ label: 'Autor, estúdio ou criador', name: 'autor', placeholder: 'Ex.: Frank Herbert', maxlength: 60 })}
        ${Field({ label: 'Progresso', name: 'unidade', type: 'select', value: 'paginas', options: [
          { value: 'paginas', label: 'Páginas' }, { value: 'capitulos', label: 'Capítulos' }, { value: 'episodios', label: 'Episódios' },
          { value: 'horas', label: 'Horas' }, { value: 'porcento', label: 'Porcentagem' }, { value: 'nenhum', label: 'Sem progresso' }] })}
        <div class="field-row" data-progress-fields>
          ${Field({ label: 'Página atual', name: 'atual', type: 'number', min: 0, inputmode: 'numeric', placeholder: '120' })}
          <div data-total-field>${Field({ label: 'Total de páginas', name: 'total', type: 'number', min: 0, inputmode: 'numeric', placeholder: '680' })}</div>
        </div>
        ${Field({ label: '', live: 'Nota: {v}', name: 'nota', type: 'range', min: 0, max: 5, step: 0.5, value: 0, hint: 'Deixe em 0 pra não mostrar estrelas.' })}
      </div>

      <div class="field-group" data-panel="estante" hidden>
        ${Drop({ name: 'capas', title: 'Adicionar capas', hint: 'Até 9. Arraste, solte ou cole várias de uma vez.', multiple: true })}
        <ul class="thumbs" data-thumbs aria-label="Capas da estante"></ul>
        ${Field({ label: 'Título', name: 'e_titulo', placeholder: 'Ex.: Outubro', maxlength: 40 })}
        ${Field({ label: 'Linha de cima', name: 'e_sub', placeholder: 'Ex.: O que li, joguei e assisti', maxlength: 40 })}
        ${Seg({ name: 'e_proporcao', legend: 'Proporção', options: [{ value: 'auto', label: 'Automática' }, { value: 'retrato', label: 'Retrato' }, { value: 'quadrada', label: 'Quadrada (música)' }] })}
        ${Seg({ name: 'e_recorte', legend: 'Capas', options: [{ value: 'cortar', label: 'Mesmo tamanho' }, { value: 'inteira', label: 'Inteiras' }] })}
        ${Check({ label: 'Numerar como ranking', name: 'e_rank' })}
      </div>

      <div class="field-group" data-panel="citacao" hidden>
        ${Field({ label: 'Frase', name: 'q_texto', type: 'textarea', rows: 4, maxlength: 320, placeholder: 'Medo é o assassino da mente.', hint: 'Coloque uma palavra entre [[colchetes duplos]] pra destacar.' })}
        <div class="field-row">
          ${Field({ label: 'Quem disse', name: 'q_autor', placeholder: 'Ex.: Paul Atreides', maxlength: 50 })}
          ${Field({ label: 'Obra', name: 'q_obra', placeholder: 'Ex.: Duna', maxlength: 60 })}
        </div>
        ${Drop({ name: 'q_capa', title: 'Capa (opcional)', hint: 'Aparece pequena, ao lado do nome da obra.' })}
        <button class="mini-btn" type="button" data-clear-qcapa hidden>Tirar capa</button>
      </div>
    </div>

    <fieldset class="field-group">
      <legend>Aparência</legend>
      ${Seg({ name: 'formato', legend: 'Formato', options: [{ value: 'story', label: 'Story 9:16' }, { value: 'feed', label: 'Feed 4:5' }] })}
      ${Seg({ name: 'tema', legend: 'Cores', options: TEMAS })}
      <div class="field-row" data-custom-only hidden>
        ${Field({ label: 'Fundo', name: 'cor_fundo', type: 'color', value: '#3B4BFF' })}
        ${Field({ label: 'Destaque', name: 'cor_destaque', type: 'color', value: '#FFD23F', hint: 'Selo, barra, estrelas e palavra destacada.' })}
      </div>
      ${Seg({ name: 'alinhar', legend: 'Alinhamento', options: [{ value: 'esquerda', label: 'Esquerda' }, { value: 'centro', label: 'Centro' }] })}
    </fieldset>

    ${Effects({
      bgLabel: 'Fundo',
      bgOptions: [{ value: 'imagem', label: 'Capa desfocada' }, { value: 'cor', label: 'Cor do tema' }],
      tintHint: 'Camada da cor do tema por cima da capa, pra o texto continuar legível.',
      shadowLabel: 'Sombra na capa',
      shadowChecked: true,
      extra: html`${Field({ label: '', live: 'Borda da capa: {v}', name: 'borda', type: 'range', min: 0, max: 40, step: 1, value: 18, hint: 'Em 0, a capa fica sem borda.' })}
      <div data-border-only>
        ${Seg({ name: 'borda_cor', legend: 'Cor da borda', options: [{ value: 'auto', label: 'Papel' }, { value: 'texto', label: 'Cor do texto' }, { value: 'destaque', label: 'Destaque' }, { value: 'minha', label: 'Escolher' }] })}
        <div class="field-row" data-border-custom hidden>${Field({ label: 'Cor da borda', name: 'cor_borda', type: 'color', value: '#F3F1EA' })}</div>
      </div>
      <div data-hide-in="estante">${Check({ label: 'Capa levemente inclinada', name: 'inclinar' })}</div>
      <div data-hide-in="estante citacao">${Field({ label: '', live: 'Tamanho da capa: {v}%', name: 'tam_capa', type: 'range', min: 40, max: 100, step: 1, value: 100 })}</div>`,
    })}

    <fieldset class="field-group">
      <legend>Rodapé</legend>
      ${Field({ label: 'Seu @ (opcional)', name: 'arroba', placeholder: '@voce', maxlength: 30 })}
      ${Check({ label: 'Mostrar logo e endereço no rodapé', name: 'assinatura', checked: true })}
    </fieldset>
  </div>
  ${Preview({ label: 'Prévia da imagem' })}
</form>`;
}
