/* ==========================================================
   Demo Kit — canais Webex Contact Center para qualquer vertical
   Lê window.DEMO_CONFIG (definido no config.js de cada vertical)

   - Chat (Webex Connect Live Chat / agente de IA)
   - Voz (número de entrada no Webex CC)
   - Callback (webhook do Webex Connect -> fluxo -> Webex CC)
   - WhatsApp (número integrado ao Webex Connect)
   - Painel "Modo demo" com persona e roteiro para o vendedor
   ========================================================== */
(function () {
  'use strict';

  const C = window.DEMO_CONFIG || {};
  const canais = C.canais || {};
  const persona = C.persona || {};
  const jornadas = C.jornadas || [];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const digits = (s) => String(s || '').replace(/\D/g, '');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- Ícones ---------------- */
  const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    chat: P('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>'),
    bot: P('<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16h5"/>'),
    phone: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>'),
    callback: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/><path d="M15 3v6h6M21 3l-6 6"/>'),
    whatsapp: P('<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3 3Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2L9 9.5Z"/>'),
    calendar: P('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>'),
    flask: P('<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>'),
    shield: P('<path d="M12 3 4.5 6v6c0 4.5 3.2 8 7.5 9 4.3-1 7.5-4.5 7.5-9V6Z"/><path d="m9 12 2 2 4-4"/>'),
    pulse: P('<path d="M3 12h4l2-5 4 10 2-5h6"/>'),
    receipt: P('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/>'),
    headset: P('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20a3 3 0 0 1-3 2h-3"/>'),
    close: P('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: P('<path d="m5 12 4.5 4.5L19 7"/>'),
    play: P('<path d="M7 5v14l11-7Z"/>'),
    pill: P('<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/>'),
    user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  };
  const icon = (n) => ICONS[n] || ICONS.chat;
  window.DemoIcons = ICONS;

  /* ---------------- Status dos canais ---------------- */
  const status = {
    chat: !!(canais.chat && String(canais.chat.embedHtml || '').trim()),
    telefone: digits(canais.telefone && canais.telefone.discagem).length >= 8,
    whatsapp: digits(canais.whatsapp && canais.whatsapp.numero).length >= 10,
    callback: !!(canais.callback && /^https?:\/\//.test(canais.callback.webhookUrl || '')),
  };

  const CANAL_META = {
    chat: { nome: 'Chat com assistente virtual', desc: 'Agente de IA 24h, transfere para humano com contexto', ico: 'bot' },
    telefone: { nome: 'Ligar agora', desc: 'Central de atendimento (URA + agente)', ico: 'phone' },
    callback: { nome: 'Receber uma ligação', desc: 'Deixe seu número e retornamos em instantes', ico: 'callback' },
    whatsapp: { nome: 'WhatsApp', desc: 'Atendimento pelo WhatsApp oficial', ico: 'whatsapp' },
  };

  /* ---------------- Toast ---------------- */
  function toast(msg, kind = '') {
    let stack = $('.toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.setAttribute('role', 'status');
    t.innerHTML = msg;
    stack.appendChild(t);
    setTimeout(() => t.remove(), 5200);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
  }

  /* ---------------- Chat: injeta o snippet do Webex Connect ---------------- */
  function injectChat() {
    if (!status.chat) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = canais.chat.embedHtml;
    Array.from(tpl.content.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const s = document.createElement('script');
        Array.from(node.attributes).forEach((a) => s.setAttribute(a.name, a.value));
        if (s.src) s.async = false; // preserva a ordem dos scripts externos
        s.text = node.textContent;
        document.body.appendChild(s);
      } else if (node.nodeType === 1) {
        document.body.appendChild(node.cloneNode(true));
      }
    });
  }

  function openChat(j) {
    if (!status.chat) {
      toast('<b>Chat não configurado.</b> Cole o snippet do Live Chat em <code>config.js → canais.chat.embedHtml</code>.', 'warn');
      return;
    }
    const msg = j && j.mensagemSugerida;
    if (msg) copyText(msg);
    const sel = canais.chat.launcherSelector;
    const launcher = sel ? $(sel) : null;
    if (launcher) {
      launcher.click();
      toast(msg ? `Chat aberto. Mensagem sugerida copiada: <i>"${esc(msg)}"</i>` : 'Chat aberto.');
    } else {
      // Sem seletor: destaca a área do widget e orienta
      toast((msg ? `Mensagem sugerida copiada: <i>"${esc(msg)}"</i><br>` : '') + 'Clique no balão do chat no canto inferior direito.');
      if (sel) console.warn('[demo-kit] launcherSelector não encontrado:', sel);
    }
    closeModal();
  }

  /* ---------------- Callback: POST no webhook ---------------- */
  function toE164(tel) {
    let d = digits(tel);
    if (d.length === 10 || d.length === 11) d = '55' + d; // número BR sem DDI
    return d ? '+' + d : '';
  }

  async function sendCallback(data) {
    const url = canais.callback.webhookUrl;
    const payload = Object.assign({}, canais.callback.camposFixos || {}, data, {
      telefoneE164: toE164(data.telefone),
      vertical: C.vertical || '',
      marca: (C.marca && C.marca.nome) || '',
      origem: location.href,
      enviadoEm: new Date().toISOString(),
    });
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { http: true });
      return 'ok';
    } catch (e) {
      // Erro de CORS/rede: reenvia como "simple request" (resposta opaca)
      if (!e.http && canais.callback.fallbackNoCors !== false) {
        await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
        return 'opaque';
      }
      throw e;
    }
  }

  function callbackFormHtml(j) {
    const motivos = jornadas.map((x) => `<option value="${esc(x.id)}" ${j && j.id === x.id ? 'selected' : ''}>${esc(x.titulo)}</option>`).join('');
    return `
      <form class="callback-form" novalidate>
        <div class="form-row">
          <div class="field"><label>Nome completo</label><input name="nome" autocomplete="name" required></div>
          <div class="field"><label>Celular com DDD</label><input name="telefone" type="tel" autocomplete="tel" placeholder="(11) 90000-0000" required></div>
        </div>
        <div class="form-row">
          <div class="field"><label>${esc((C.textos && C.textos.documento) || 'CPF')}</label><input name="documento" inputmode="numeric"></div>
          <div class="field"><label>Assunto</label><select name="motivo">${motivos}<option value="outro">Outro assunto</option></select></div>
        </div>
        <div class="field"><label>Observação (opcional)</label><textarea name="observacao" rows="2"></textarea></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="btn btn-primary" type="submit">${icon('callback')} Quero receber a ligação</button>
          <button class="btn btn-sm btn-secondary" type="button" data-fill-persona>Preencher com persona da demo</button>
        </div>
      </form>`;
  }

  function wireCallbackForm(root) {
    const form = $('.callback-form', root);
    if (!form) return;
    $('[data-fill-persona]', form).addEventListener('click', () => {
      form.nome.value = persona.nome || '';
      form.telefone.value = persona.telefone || '';
      form.documento.value = persona.documento || '';
    });
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.nome || digits(data.telefone).length < 10) {
        toast('Informe nome e celular com DDD.', 'warn');
        return;
      }
      const j = jornadas.find((x) => x.id === data.motivo);
      data.motivoDescricao = j ? j.titulo : 'Outro assunto';
      if (persona.extras) data.contexto = persona.extras;
      if (!status.callback) {
        toast('<b>Callback não configurado.</b> Defina <code>canais.callback.webhookUrl</code> no config.js.', 'warn');
        console.info('[demo-kit] payload que seria enviado:', data);
        return;
      }
      const btn = $('button[type=submit]', form);
      btn.disabled = true; btn.textContent = 'Enviando…';
      try {
        const res = await sendCallback(data);
        form.outerHTML = `
          <div class="callback-ok">
            <div class="tick">${icon('check')}</div>
            <h3>Pronto, ${esc(data.nome.split(' ')[0])}!</h3>
            <p class="muted">Você receberá uma ligação no número ${esc(data.telefone)} em instantes.</p>
            ${res === 'opaque' ? '<p class="hint">Enviado em modo no-cors (sem confirmação do servidor). Verifique o log do fluxo no Webex Connect se a ligação não vier.</p>' : ''}
          </div>`;
      } catch (e) {
        btn.disabled = false; btn.innerHTML = icon('callback') + ' Tentar novamente';
        toast('Falha ao enviar o callback: ' + esc(e.message), 'err');
      }
    });
  }

  /* ---------------- Modal de canais ---------------- */
  let backdrop;
  function ensureModal() {
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = '<div class="modal" role="dialog" aria-modal="true"></div>';
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    document.body.appendChild(backdrop);
    return backdrop;
  }
  function closeModal() { if (backdrop) backdrop.classList.remove('open'); }
  function showModal(title, sub, bodyHtml) {
    const b = ensureModal();
    const m = $('.modal', b);
    m.innerHTML = `
      <div class="modal-head">
        <div>${sub ? `<div class="eyebrow">${esc(sub)}</div>` : ''}<h3>${esc(title)}</h3></div>
        <button class="icon-btn" aria-label="Fechar" data-close>${icon('close')}</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>`;
    $('[data-close]', m).addEventListener('click', closeModal);
    b.classList.add('open');
    return m;
  }

  function renderQR(el, text) {
    if (!el || !window.QRCode) return;
    el.innerHTML = '';
    new window.QRCode(el, { text, width: 164, height: 164, correctLevel: window.QRCode.CorrectLevel.M });
  }

  function openJornada(j) {
    const lista = (j.canais && j.canais.length ? j.canais : ['chat', 'telefone', 'callback', 'whatsapp']);
    const html = `
      ${j.descricao ? `<p class="muted">${esc(j.descricao)}</p>` : ''}
      <div class="channel-list">
        ${lista.map((c) => {
          const meta = CANAL_META[c]; if (!meta) return '';
          const off = !status[c];
          return `<button class="channel ${off ? 'is-disabled' : ''}" data-canal="${c}">
            <span class="ch-ico">${icon(meta.ico)}</span>
            <span><strong>${meta.nome}${off ? '<span class="badge warn">não configurado</span>' : ''}</strong><small>${meta.desc}</small></span>
          </button>`;
        }).join('')}
      </div>`;
    const m = showModal(j.titulo, 'Como prefere ser atendido?', html);
    $$('.channel', m).forEach((b) => b.addEventListener('click', () => go(b.dataset.canal, j)));
  }

  function go(canal, j) {
    if (canal === 'chat') return openChat(j);
    if (canal === 'telefone') return showPhone(j);
    if (canal === 'whatsapp') return showWhatsApp(j);
    if (canal === 'callback') return showCallback(j);
  }

  function showPhone(j) {
    if (!status.telefone) return toast('<b>Número não configurado.</b> Defina <code>canais.telefone</code> no config.js.', 'warn');
    const d = digits(canais.telefone.discagem);
    const m = showModal('Ligue para nossa central', j ? j.titulo : 'Atendimento', `
      <div class="qr-box">
        <div class="big-number">${esc(canais.telefone.numero || '+' + d)}</div>
        <div class="qr" data-qr></div>
        <p class="hint">Aponte a câmera do celular para ligar direto. ${j && j.dicaURA ? '<br>' + esc(j.dicaURA) : ''}</p>
        <a class="btn btn-primary" href="tel:+${d}">${icon('phone')} Ligar agora</a>
      </div>`);
    renderQR($('[data-qr]', m), 'tel:+' + d);
  }

  function showWhatsApp(j) {
    if (!status.whatsapp) return toast('<b>WhatsApp não configurado.</b> Defina <code>canais.whatsapp.numero</code> no config.js.', 'warn');
    const n = digits(canais.whatsapp.numero);
    const url = `https://wa.me/${n}` + (j && j.mensagemSugerida ? '?text=' + encodeURIComponent(j.mensagemSugerida) : '');
    const m = showModal('Fale pelo WhatsApp', j ? j.titulo : 'Atendimento', `
      <div class="qr-box">
        <div class="qr" data-qr></div>
        <p class="hint">Escaneie com o celular para abrir a conversa${j && j.mensagemSugerida ? ' já com a mensagem preenchida' : ''}.</p>
        <a class="btn btn-primary" href="${url}" target="_blank" rel="noopener">${icon('whatsapp')} Abrir WhatsApp</a>
      </div>`);
    renderQR($('[data-qr]', m), url);
  }

  function showCallback(j) {
    const m = showModal('Receber uma ligação', j ? j.titulo : 'Atendimento', callbackFormHtml(j));
    wireCallbackForm(m);
  }

  /* ---------------- Painel do vendedor ---------------- */
  function buildDemoPanel() {
    if (C.modoDemo === false) return;
    const launcher = document.createElement('button');
    launcher.className = 'demo-launcher';
    launcher.innerHTML = icon('play') + ' Roteiro da demo';
    const params = new URLSearchParams(location.search);
    if (params.has('apresentacao')) launcher.classList.add('hidden');

    const drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.setAttribute('aria-label', 'Painel do vendedor');

    const personaRows = [
      ['Nome', persona.nome], [(C.textos && C.textos.documento) || 'CPF', persona.documento],
      ['Celular', persona.telefone], ['E-mail', persona.email],
      ...Object.entries(persona.extras || {}),
    ].filter(([, v]) => v);

    const statusRows = Object.keys(CANAL_META).map((c) =>
      `<li><span>${CANAL_META[c].nome}</span><span class="badge ${status[c] ? 'ok' : 'warn'}">${status[c] ? 'ok' : 'pendente'}</span></li>`).join('');

    const roteiros = jornadas.map((j) => `
      <details class="script">
        <summary>${esc(j.titulo)}</summary>
        <ol>${(j.roteiro || []).map((p) => {
          const step = typeof p === 'string' ? { passo: p } : p;
          return `<li>${esc(step.passo)}${step.fala ? `<span class="say">“${esc(step.fala)}”</span>` : ''}</li>`;
        }).join('')}</ol>
        <div class="actions"><button class="btn btn-sm btn-primary" data-start="${esc(j.id)}">${icon('play')} Iniciar esta jornada</button></div>
      </details>`).join('');

    drawer.innerHTML = `
      <div class="drawer-head">
        <div><div class="eyebrow">Modo demo</div><h3>${esc((C.marca && C.marca.nome) || 'Demo')}</h3></div>
        <button class="icon-btn" aria-label="Fechar painel" data-close>${icon('close')}</button>
      </div>
      <div class="drawer-body">
        ${C.pitch ? `<p class="muted" style="font-size:.9rem">${esc(C.pitch)}</p>` : ''}
        <h4>Persona</h4>
        <dl class="kv">${personaRows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd><button class="copy" data-copy="${esc(v)}">copiar</button>`).join('')}</dl>
        <h4>Canais configurados</h4>
        <ul class="status-list">${statusRows}</ul>
        <h4>Jornadas</h4>
        ${roteiros || '<p class="hint">Nenhuma jornada no config.js.</p>'}
        <p class="hint" style="margin-top:18px"><kbd>Alt</kbd> + <kbd>D</kbd> mostra/oculta o botão do roteiro. Use <code>?apresentacao</code> na URL para começar com ele oculto.</p>
      </div>`;

    document.body.append(launcher, drawer);
    const toggle = (open) => drawer.classList.toggle('open', open);
    launcher.addEventListener('click', () => toggle(true));
    $('[data-close]', drawer).addEventListener('click', () => toggle(false));
    $$('[data-copy]', drawer).forEach((b) => b.addEventListener('click', async () => {
      if (await copyText(b.dataset.copy)) { b.textContent = 'copiado'; setTimeout(() => (b.textContent = 'copiar'), 1400); }
    }));
    $$('[data-start]', drawer).forEach((b) => b.addEventListener('click', () => {
      toggle(false);
      const j = jornadas.find((x) => x.id === b.dataset.start);
      if (j) openJornada(j);
    }));
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D' || e.code === 'KeyD')) {
        e.preventDefault(); launcher.classList.toggle('hidden'); toggle(false);
      }
    });
  }

  /* ---------------- Ligações declarativas no HTML ----------------
     <button data-jornada="agendamento">           abre o seletor de canais
     <button data-canal="chat" data-jornada="x">   vai direto para o canal
     <div data-jornadas-grid>                      renderiza os cards de jornada
     <div data-callback-inline>                    formulário de callback na página
  ------------------------------------------------------------------ */
  function wireDeclarative() {
    $$('[data-jornadas-grid]').forEach((grid) => {
      grid.innerHTML = jornadas.filter((j) => j.mostrarNaHome !== false).map((j) => `
        <button class="journey" data-jornada="${esc(j.id)}">
          <span class="j-ico">${icon(j.icone)}</span>
          <strong>${esc(j.titulo)}</strong>
          <small>${esc(j.resumo || '')}</small>
          <span class="j-go">Iniciar →</span>
        </button>`).join('');
    });
    $$('[data-callback-inline]').forEach((el) => { el.innerHTML = callbackFormHtml(null); wireCallbackForm(el); });

    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-jornada], [data-canal]');
      if (!t || t.closest('.modal') || t.closest('.drawer')) return;
      e.preventDefault();
      const j = jornadas.find((x) => x.id === t.dataset.jornada) || null;
      if (t.dataset.canal) go(t.dataset.canal, j);
      else if (j) openJornada(j);
    });

    // Preenche textos/números vindos do config
    $$('[data-cfg]').forEach((el) => {
      const val = el.dataset.cfg.split('.').reduce((o, k) => (o ? o[k] : undefined), C);
      if (val) el.textContent = val;
    });
    $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  }

  function init() {
    if (C.marca && C.marca.nome) document.title = C.marca.nome + (C.marca.tituloAba ? ' — ' + C.marca.tituloAba : '');
    wireDeclarative();
    buildDemoPanel();
    injectChat();
  }

  window.DemoKit = { openJornada, openChat, go, toast, status };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
