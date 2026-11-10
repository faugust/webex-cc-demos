/* Página de 2ª via de fatura das verticais Utilities e Telecom.
   Lê os mesmos CSVs importados no Airtable (dados/<vertical>/Faturas.csv e Clientes.csv).
   Uso: <body data-vertical="utilities"> ... <article id="doc"> ... <script src="../assets/js/fatura.js"> */
(function () {
  'use strict';
  const vertical = document.body.dataset.vertical;
  const BASE = `../dados/${vertical}/`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso || '—');
  const mes = (ref) => {
    if (!/^\d{4}-\d{2}$/.test(ref || '')) return ref || '—';
    const [a, m] = ref.split('-');
    return ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(m) - 1] + '/' + a;
  };
  const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function parseCSV(text) {
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c !== '\r') cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    const [h, ...data] = rows.filter((r) => r.length > 1);
    return data.map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] || ''])));
  }
  const load = (f) => fetch(BASE + f).then((r) => { if (!r.ok) throw new Error(f); return r.text(); }).then(parseCSV);

  function linhas(f, c) {
    if (vertical === 'utilities') {
      return `
        <dt>Titular</dt><dd>${esc(c.nome)}</dd>
        <dt>Unidade consumidora</dt><dd>${esc(c.unidade_consumidora)}</dd>
        <dt>Endereço</dt><dd>${esc(c.endereco)} · ${esc(c.bairro)}</dd>
        <dt>Referência</dt><dd>${mes(f.referencia)} · ${esc(f.consumo_kwh)} kWh · bandeira ${esc(f.bandeira)}</dd>`;
    }
    return `
      <dt>Titular</dt><dd>${esc(c.nome)}</dd>
      <dt>Linha</dt><dd>${esc(c.linha_movel)}${c.plano_fibra ? ' · ' + esc(c.plano_fibra) : ''}</dd>
      <dt>Referência</dt><dd>${mes(f.referencia)}</dd>
      <dt>Itens</dt><dd>${esc(f.detalhes)}</dd>`;
  }

  async function render() {
    const id = new URLSearchParams(location.search).get('id');
    const box = document.getElementById('doc');
    try {
      const [faturas, clientes] = await Promise.all([load('Faturas.csv'), load('Clientes.csv')]);
      const f = faturas.find((x) => x.id_fatura === id);
      if (!f) throw new Error('nao encontrada');
      const c = clientes.find((x) => x.id_cliente === f.id_cliente) || {};
      const pago = f.status === 'PAGO';
      const venc = f.status === 'VENCIDO';
      box.innerHTML = `
        <div class="doc-head"><div><div class="eyebrow">2ª via da fatura</div><h1>${money(f.valor)}</h1></div>
          <span class="badge ${pago ? 'ok' : 'warn'}">${pago ? 'Paga' : venc ? 'Vencida' : 'Em aberto'}</span></div>
        <dl class="doc-grid">
          ${linhas(f, c)}
          <dt>Vencimento</dt><dd>${br(f.vencimento)}${venc ? ' · pagamento com multa de 2% e juros' : ''}</dd>
          <dt>Documento</dt><dd>${esc(f.id_fatura)}</dd>
        </dl>
        ${f.linha_digitavel ? `
          <h3>Linha digitável</h3>
          <div class="linha"><code>${esc(f.linha_digitavel)}</code><button class="btn btn-sm btn-secondary" id="copiar">Copiar</button></div>
          <div class="barcode" aria-hidden="true"></div>` : ''}
        <p class="hint">Fatura de demonstração, sem valor de pagamento.</p>`;
    } catch (e) {
      box.innerHTML = '<p class="muted">Fatura não encontrada. Verifique o link recebido.</p>';
    }
  }

  document.addEventListener('click', async (e) => {
    if (e.target.id !== 'copiar') return;
    try { await navigator.clipboard.writeText(document.querySelector('.linha code').textContent); e.target.textContent = 'Copiado'; } catch (_) {}
  });
  render();
})();
