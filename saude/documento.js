/* Páginas de laudo e boleto da demo.
   Lê os mesmos CSVs importados no Airtable (dados/saude/*.csv). */
(function () {
  'use strict';
  const BASE = '../dados/saude/';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso || '—');
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

  async function render() {
    const tipo = document.body.dataset.doc;
    const id = new URLSearchParams(location.search).get('id');
    const box = document.getElementById('doc');
    try {
      const pacientes = await load('Pacientes_ref.csv');
      const lista = await load(tipo === 'laudo' ? 'Exames.csv' : 'Faturas.csv');
      const item = lista.find((x) => (x.id_exame || x.id_fatura) === id);
      if (!item) throw new Error('nao encontrado');
      const p = pacientes.find((x) => x.id_paciente === item.id_paciente) || {};
      box.innerHTML = tipo === 'laudo' ? laudo(item, p) : boleto(item, p);
    } catch (e) {
      box.innerHTML = '<p class="muted">Documento não encontrado. Verifique o link recebido.</p>';
    }
  }

  function laudo(e, p) {
    const pronto = e.status === 'PRONTO';
    return `
      <div class="doc-head"><div><div class="eyebrow">Laudo de exame</div><h1>${esc(e.nome_exame)}</h1></div>
        <span class="badge ${pronto ? 'ok' : 'warn'}">${pronto ? 'Liberado' : 'Em análise'}</span></div>
      <dl class="doc-grid">
        <dt>Paciente</dt><dd>${esc(p.nome)}</dd>
        <dt>Código</dt><dd>${esc(e.id_exame)}</dd>
        <dt>Coleta</dt><dd>${br(e.data_coleta)} · Unidade ${esc(e.unidade)}</dd>
        <dt>Solicitante</dt><dd>${esc(e.medico_solicitante)}</dd>
        <dt>${pronto ? 'Liberado em' : 'Previsão'}</dt><dd>${br(e.previsao_resultado)}</dd>
      </dl>
      <h3>Conclusão</h3>
      <p>${esc(e.resumo)}</p>
      <p class="hint">Documento de demonstração. Dados fictícios. Interprete seus resultados sempre com seu médico.</p>`;
  }

  function boleto(f, p) {
    const pago = f.status === 'PAGO';
    const venc = f.status === 'VENCIDO';
    return `
      <div class="doc-head"><div><div class="eyebrow">2ª via de boleto</div><h1>${money(f.valor)}</h1></div>
        <span class="badge ${pago ? 'ok' : 'warn'}">${pago ? 'Pago' : venc ? 'Vencido' : 'Em aberto'}</span></div>
      <dl class="doc-grid">
        <dt>Pagador</dt><dd>${esc(p.nome)}</dd>
        <dt>Descrição</dt><dd>${esc(f.descricao)}</dd>
        <dt>Vencimento</dt><dd>${br(f.vencimento)}${venc ? ' · pagamento com juros de 1% a.m.' : ''}</dd>
        <dt>Documento</dt><dd>${esc(f.id_fatura)}</dd>
      </dl>
      ${f.linha_digitavel ? `
        <h3>Linha digitável</h3>
        <div class="linha"><code>${esc(f.linha_digitavel)}</code><button class="btn btn-sm btn-secondary" id="copiar">Copiar</button></div>
        <div class="barcode" aria-hidden="true"></div>` : ''}
      <p class="hint">Boleto de demonstração, sem valor de pagamento.</p>`;
  }

  document.addEventListener('click', async (e) => {
    if (e.target.id !== 'copiar') return;
    try { await navigator.clipboard.writeText(document.querySelector('.linha code').textContent); e.target.textContent = 'Copiado'; } catch (_) {}
  });
  render();
})();
