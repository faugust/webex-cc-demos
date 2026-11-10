/* ==========================================================
   VERTICAL TELECOM — Conecta+ (marca fictícia)
   Operadora de celular e fibra. Único arquivo a editar para a demo.
   ========================================================== */
window.DEMO_CONFIG = {
  vertical: 'telecom',

  marca: {
    nome: 'Conecta+',
    tituloAba: 'Celular e fibra',
    telefoneExibicao: '*1050 · 0800 000 1050',
  },

  pitch: 'O cliente resolve fatura, internet lenta, consumo de dados e troca de plano com a agente de IA. Pedido de cancelamento vai direto para um atendente de retenção do Webex CC, com todo o contexto.',

  textos: { documento: 'CPF' },

  canais: {
    /* 1) CHAT — Webex Connect Live Chat (agente de IA "Nina") */
    chat: {
      // Live Chat asset NinaConectaChat (Control Hub > Digital > Assets). Dominio liberado: faugust.github.io
      embedHtml: `<div id="divicw" data-bind="B31FEB26-0A74-4516-9EA5-B66CC6F4E20B" data-org="" data-guid="a9076872-fec6-4146-b133-170fa8da3258"></div><script>{3}var i={t:function(){try{var e=document.getElementById("divicw"),t=document.createElement("script");t.src="https://chat-widget.produs1.ciscoccservice.com/js/imichatinit.js?t="+new Date().toISOString(),e.insertAdjacentElement("afterend",t),t.addEventListener("load",function(){console.log(new Date().toISOString(),"Livechat script loaded successfully!")}),t.addEventListener("error",function(){console.log(new Date().toISOString(),"Error loading Livechat script");i.o(e)})}catch(e){console.error(e)}},o:function(e){e.insertAdjacentHTML("afterend",'<iframe id="tls_al_frm" frameborder="0" style="overflow:hidden;height:208px;width:394px;position:fixed;display:block;right:48px;bottom:12px;z-index:99999;display:none;"></iframe>');var t=document.getElementById("tls_al_frm"),n=t.contentWindow,d=n.document;d.open();d.write("<!doctype html><html><head><meta charset='utf-8'><title>Untitled Document</title><style>body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#99a0b0;font-size:14px}.popover__content{background-color:#fbfbfe;padding:1.5rem;border-radius:5px;width:300px;box-shadow:0 2px 5px 0 rgba(0,0,0,0.26);position:relative}.popover__message{font-weight:600;color:#56627c;font-size:16px}.pull-left{float:left}.clearfix{clear:both}.hdr-txt{width:218px;margin-top:3px}.para-txt a{text-decoration:none;color:#005cde}.close-btn{position:absolute;right:15px;top:15px}.close-btn a{text-decoration:none;font-weight:400;color:#56627c;font-size:16px}</style></head><body><div class='popover__content'><div class='close-btn'><a href='#' onclick='closeTLSAlert()'>X</a></div><div class='popover__message'><div class='pull-left hdr-txt'>This browser version is not supported on LiveChat.</div></div><div class='clearfix'></div><p class='para-txt'>Please update your browser to the latest version and re-open the website to access the widget.</p></div><script>function closeTLSAlert(){window.parent.postMessage({key:'close_tls_alert',value:'close_tls_alert',action:'close_tls_alert'},'*');}<\\/script></body></html>");d.close();t.style.display='block';window.addEventListener('message',function(e){'close_tls_alert'===e.data.action&&i.s()})},s:function(){var e=document.getElementById('tls_al_frm');e&&e.remove()}};i.t();</script>`,
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
      prefixo: '[TELECOM]',
    },
  },

  // Mesmos dados da base Airtable (tabelas TC_*), cliente TC-0001.
  persona: {
    nome: 'Ana Costa',
    documento: '390.533.447-05',
    telefone: '',
    email: 'ana.costa@exemplo.com',
    extras: {
      'Linha móvel': '11 98765-4321 · Controle 30GB',
      'Fibra': '500 Mega · Vila Madalena',
      'Fatura de outubro': 'R$ 249,70 · vence 10/11',
      'Consumo de dados': '27,4 de 30 GB · renova 15/11',
      'Variação': 'CPF 862.519.384-63 (Pedro): 2 faturas vencidas, quer cancelar',
    },
  },

  jornadas: [
    {
      id: 'fatura',
      titulo: 'Fatura e 2ª via',
      resumo: 'Valor, vencimento e código para pagar.',
      icone: 'receipt',
      canais: ['whatsapp', 'chat', 'callback'],
      mensagemSugerida: 'Quero a segunda via da minha fatura.',
      roteiro: [
        { passo: 'Abra pelo WhatsApp e envie a mensagem sugerida; informe o CPF 390.533.447-05.' },
        { passo: 'A IA mostra a fatura de outubro: R$ 249,70, vence 10/11, e explica o pacote adicional de R$ 29,90.', fala: 'A IA explica a cobrança antes de o cliente perguntar.' },
        { passo: 'Abra o link da fatura recebido.', fala: 'Código de barras no canal, sem app.' },
      ],
    },
    {
      id: 'internet-lenta',
      titulo: 'Internet lenta ou sem sinal',
      resumo: 'Diagnóstico da rede no seu endereço.',
      icone: 'wifi',
      canais: ['chat', 'whatsapp', 'telefone'],
      mensagemSugerida: 'Minha internet fibra está muito lenta.',
      dicaURA: 'Na URA, diga "internet lenta".',
      roteiro: [
        { passo: 'Envie a mensagem sugerida e informe o CPF.' },
        { passo: 'A IA identifica instabilidade na Vila Madalena (cabo rompido) com previsão às 18h.', fala: 'Diagnóstico proativo: menos visitas técnicas desnecessárias.' },
        { passo: 'Peça "quero uma visita técnica".', fala: 'A IA registra o protocolo de visita para depois da normalização.' },
      ],
    },
    {
      id: 'consumo-dados',
      titulo: 'Consumo de dados',
      resumo: 'Veja sua franquia e contrate pacote extra.',
      icone: 'signal',
      canais: ['whatsapp', 'chat'],
      mensagemSugerida: 'Quanto ainda tenho de internet no celular?',
      roteiro: [
        { passo: 'Envie a mensagem sugerida e informe o CPF.' },
        { passo: 'A IA informa 27,4 de 30 GB usados, renovação em 15/11.' },
        { passo: 'Aceite o pacote adicional de 5GB por R$ 29,90.', fala: 'Venda no autosserviço, com protocolo.' },
      ],
    },
    {
      id: 'trocar-plano',
      titulo: 'Trocar de plano',
      resumo: 'Mais internet ou fibra mais rápida.',
      icone: 'swap',
      canais: ['chat', 'whatsapp', 'callback'],
      mensagemSugerida: 'Quero um plano com mais internet.',
      roteiro: [
        { passo: 'Envie a mensagem sugerida e informe o CPF.' },
        { passo: 'A IA compara o plano atual (Controle 30GB) com as opções de 50GB e 80GB e a Fibra 1 Giga.', fala: 'Upsell guiado pelos dados do cliente.' },
        { passo: 'Escolha um plano e confirme.', fala: 'A IA registra a solicitação de troca com protocolo.' },
      ],
    },
    {
      id: 'cancelamento',
      titulo: 'Cancelamento',
      resumo: 'Fale com nosso time antes de decidir.',
      icone: 'exit',
      canais: ['whatsapp', 'chat', 'telefone'],
      mensagemSugerida: 'Quero cancelar meu plano.',
      roteiro: [
        { passo: 'Use o CPF da variação: 862.519.384-63 (Pedro).', fala: 'Cliente com faturas vencidas e intenção de cancelar.' },
        { passo: 'A IA não tenta reter sozinha: confirma e transfere para o time de retenção.', fala: 'O atendente recebe o resumo: plano, faturas vencidas e motivo.' },
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
