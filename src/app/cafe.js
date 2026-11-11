// ---------- Café (Pix): botão Copiar e folha que sobe no celular depois do download (spec 6.7) ----------
// O código Pix e o QR são gerados no build (src/pix). Sem Pix configurado, não há nada na página e isto não faz nada.
const cafe = (() => {
  // Copiar o "Pix copia e cola". Se o navegador não deixar, seleciona o texto pra copiar à mão.
  $$('[data-pix-copy]').forEach((btn) => {
    const label = btn.querySelector('span') || btn;
    btn.addEventListener('click', async () => {
      const code = btn.closest('[data-pix]')?.querySelector('[data-pix-code]');
      if (!code) return;
      try { await navigator.clipboard.writeText(code.value); label.textContent = 'Copiado!'; }
      catch { code.focus(); code.select(); label.textContent = 'Selecionado, é só copiar'; }
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { label.textContent = 'Copiar'; }, 2500);
    });
  });

  const sheet = $('[data-cafe-sheet]');
  // Regra 6: só no celular e só depois de um download. Uma vez por sessão (ainda pendente na spec: mude aqui).
  const ONCE_PER_SESSION = true;
  const SEEN = 'nmt:cafe-visto';
  const isPhone = () => matchMedia('(max-width: 767px)').matches && matchMedia('(pointer: coarse)').matches;
  if (sheet) {
    sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); }); // tocar fora fecha
    $$('[data-cafe-close]', sheet).forEach((b) => b.addEventListener('click', () => sheet.close()));
  }
  function afterDownload() {
    if (!sheet || sheet.open || !isPhone()) return;
    if (ONCE_PER_SESSION) {
      try { if (sessionStorage.getItem(SEEN)) return; sessionStorage.setItem(SEEN, '1'); } catch {}
    }
    setTimeout(() => sheet.showModal(), 700); // dá tempo do aviso de download do navegador aparecer antes
  }
  return { afterDownload };
})();
