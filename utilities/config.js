/* ==========================================================
   VERTICAL UTILITIES — Luz Viva Energia (marca fictícia)
   Distribuidora de energia elétrica. Único arquivo a editar para a demo.
   ========================================================== */
window.DEMO_CONFIG = {
  vertical: 'utilities',

  marca: {
    nome: 'Luz Viva Energia',
    tituloAba: 'Energia para a sua casa',
    telefoneExibicao: '0800 000 0000', // texto do topo do site
  },

  pitch: 'O cliente informa falta de energia, pede 2ª via ou questiona uma conta alta pelo canal que preferir. A agente de IA resolve o que é autosserviço e, quando precisa, entrega para um atendente do Webex CC com todo o contexto.',

  textos: { documento: 'CPF' },

  canais: {
    /* 1) CHAT — Webex Connect Live Chat (agente de IA "Clara") */
    chat: {
      // Live Chat asset ClaraLuzVivaChat (Control Hub > Digital > Assets). Dominio liberado: faugust.github.io
      embedHtml: `<div id="divicw" data-bind="AB8C0591-8E3F-4E98-B365-415C435E9DD8" data-org="" data-guid="7e6d6435-f695-4d96-9ef6-5deff9cdb8da"></div><script>{3}var i={t:function(){try{var e=document.getElementById("divicw"),t=document.createElement("script");t.src="https://chat-widget.produs1.ciscoccservice.com/js/imichatinit.js?t="+new Date().toISOString(),e.insertAdjacentElement("afterend",t),t.addEventListener("load",function(){console.log(new Date().toISOString(),"Livechat script loaded successfully!")}),t.addEventListener("error",function(){console.log(new Date().toISOString(),"Error loading Livechat script");i.o(e)})}catch(e){console.error(e)}},o:function(e){e.insertAdjacentHTML("afterend",'<iframe id="tls_al_frm" frameborder="0" style="overflow:hidden;height:208px;width:394px;position:fixed;display:block;right:48px;bottom:12px;z-index:99999;display:none;"></iframe>');var t=document.getElementById("tls_al_frm"),n=t.contentWindow,d=n.document;d.open();d.write("<!doctype html><html><head><meta charset='utf-8'><title>Untitled Document</title><style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#99a0b0;font-size:14px}.popover__content{background-color:#fbfbfe;padding:1.5rem;border-radius:5px;width:300px;box-shadow:0 2px 5px 0 rgba(0,0,0,0.26);position:relative}.popover__message{font-weight:600;color:#56627c;font-size:16px}.pull-left{float:left}.clearfix{clear:both}.hdr-txt{width:218px;margin-top:3px}.para-txt a{text-decoration:none;color:#005cde}.close-btn{position:absolute;right:15px;top:15px}.close-btn a{text-decoration:none;font-weight:400;color:#56627c;font-size:16px}</style></head><body><div class='popover__content'><div class='close-btn'><a href='#' onclick='closeTLSAlert()'>X</a></div><div class='popover__message'><div class='pull-left hdr-txt'>This browser version is not supported on LiveChat.</div></div><div class='clearfix'></div><p class='para-txt'>Please update your browser to the latest version and re-open the website to access the widget.</p></div><script>function closeTLSAlert(){window.parent.postMessage({key:'close_tls_alert',value:'close_tls_alert',action:'close_tls_alert'},'*');}<\\/script></body></html>");d.close();t.style.display='block';window.addEventListener('message',function(e){'close_tls_alert'===e.data.action&&i.s()})},s:function(){var e=document.getElementById('tls_al_frm');e&&e.remove()}};i.t();</script>`,
      launcherSelector: '',
    },

    /* 2) VOZ — número de entrada (DN) mapeado no Webex CC */
    telefone: {
      numero: '',
      discagem: '',
    },

    /* 3) CALLBACK — Inbound Webhook do Webex Connect */
    callback: {
      webhookUrl: '',
      camposFixos: { canalOrigem: 'portal-web' },
      fallbackNoCors: true,
    },

    /* 4) WHATSAPP — número compartilhado; o prefixo indica a vertical ao fluxo */
    whatsapp: {
      numero: '14083006708',
      prefixo: '[ENERGIA]',
    },
  },

  // Mesmos dados da base Airtable (tabelas UT_*), cliente UT-0001.
  persona: {
    nome: 'Carlos Mendes',
    documento: '529.982.247-25',
    telefone: '',
    email: 'carlos.mendes@exemplo.com',
    extras: {
      'Unidade consumidora': '3001234567',
      'Endereço': 'Rua das Acácias 210 · Vila Mariana',
      'Conta de outubro': 'R$ 289,75 (297 kWh) · vence 16/11',
      'Situação no bairro': 'Falta de energia em atendimento',
      'Variação': 'CPF 714.602.583-71 (Beatriz): fornecimento cortado por débito',
    },
  },

  jornadas: [
    {
      id: 'falta-energia',
      titulo: 'Falta de energia',
      resumo: 'Veja se há ocorrência no seu bairro e a previsão de volta.',
      icone: 'bolt',
      canais: ['whatsapp', 'chat', 'telefone'],
      mensagemSugerida: 'Estou sem energia em casa.',
      dicaURA: 'Na URA, diga "estou sem energia".',
      roteiro: [
        { passo: 'Abra pelo WhatsApp (QR code) e envie a mensagem sugerida.', fala: 'O cliente avisa pelo canal que já está na mão dele.' },
        { passo: 'Informe o CPF da persona: 529.982.247-25.', fala: 'A IA identifica a unidade consumidora e o endereço.' },
        { passo: 'A IA informa a ocorrência na Vila Mariana (queda de árvore) com previsão de volta às 17h.', fala: 'Sem fila: o cliente já sabe o que está acontecendo e quando volta.' },
        { passo: 'Peça para registrar mesmo assim.', fala: 'A IA abre um protocolo vinculado à ocorrência.' },
      ],
    },
    {
      id: 'segunda-via',
      titulo: '2ª via da conta',
      resumo: 'Linha digitável e conta em PDF no seu canal.',
      icone: 'receipt',
      canais: ['whatsapp', 'chat', 'callback'],
      mensagemSugerida: 'Preciso da segunda via da minha conta de luz.',
      roteiro: [
        { passo: 'Envie a mensagem sugerida e informe o CPF.' },
        { passo: 'A IA mostra a conta de outubro: R$ 289,75, vence 16/11.', fala: 'Autosserviço que tira volume do 0800.' },
        { passo: 'Abra o link da conta recebido.', fala: 'Linha digitável e conta no canal, sem login em portal.' },
      ],
    },
    {
      id: 'conta-alta',
      titulo: 'Minha conta veio alta',
      resumo: 'Entenda o consumo dos últimos meses.',
      icone: 'chart',
      canais: ['chat', 'whatsapp', 'callback'],
      mensagemSugerida: 'Minha conta de luz veio muito alta este mês.',
      roteiro: [
        { passo: 'Envie a mensagem sugerida e informe o CPF.' },
        { passo: 'A IA compara: 297 kWh em outubro contra média de ~193 kWh, com bandeira vermelha 2.', fala: 'A IA explica com os dados do cliente, não com texto genérico.' },
        { passo: 'Peça "quero que verifiquem meu medidor".', fala: 'A IA oferece abrir visita técnica ou falar com um atendente, que recebe o histórico.' },
      ],
    },
    {
      id: 'religacao',
      titulo: 'Religação',
      resumo: 'Paguei a conta: quando a energia volta?',
      icone: 'plug',
      canais: ['whatsapp', 'chat', 'telefone'],
      mensagemSugerida: 'Minha energia foi cortada e quero religar.',
      roteiro: [
        { passo: 'Use o CPF da variação: 714.602.583-71 (Beatriz).', fala: 'Cliente com fornecimento cortado por débito.' },
        { passo: 'A IA lista as 2 contas vencidas (R$ 139,80 e R$ 145,30).', fala: 'Transparência sobre o que falta pagar.' },
        { passo: 'Peça "quero negociar".', fala: 'A IA transfere para o atendente de negociação com o resumo da situação.' },
      ],
    },
    {
      id: 'atendente',
      titulo: 'Falar com um atendente',
      resumo: 'Retornamos sua ligação em instantes.',
      icone: 'headset',
      canais: ['callback', 'telefone', 'whatsapp'],
      mensagemSugerida: 'Quero falar com um atendente.',
      roteiro: [
        { passo: 'Peça um humano no WhatsApp ou no chat.' },
        { passo: 'A IA transfere com o histórico da conversa.', fala: 'O atendente não pergunta de novo o que a IA já sabe.' },
        { passo: 'Ou clique em "Receber uma ligação", use "Preencher com persona" e coloque SEU celular.', fala: 'O pedido vira um callback na fila do Webex CC.' },
      ],
    },
  ],
};
