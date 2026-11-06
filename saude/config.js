/* ==========================================================
   VERTICAL SAÚDE — Hospital Vida Plena (marca fictícia)
   Este é o ÚNICO arquivo que precisa ser editado para a demo.
   ========================================================== */
window.DEMO_CONFIG = {
  vertical: 'saude',

  marca: {
    nome: 'Hospital Vida Plena',
    tituloAba: 'Cuidado completo, 24h',
    telefoneExibicao: '+1 (209) 379-8323', // texto do topo do site
  },

  // Aparece no topo do painel "Roteiro da demo"
  pitch: 'Paciente começa no site, é atendido pelo agente de IA e, quando precisa, cai no agente humano do Webex CC com todo o contexto — sem repetir nada.',

  textos: { documento: 'CPF' },

  canais: {
    /* 1) CHAT — Webex Connect Live Chat (agente de IA)
       Webex Connect > Assets > Apps > (seu app Live Chat) > copie o snippet
       e cole entre as crases abaixo, exatamente como veio. */
    chat: {
      embedHtml: ``,
      // Opcional: seletor CSS do balão do widget, para os botões do site abrirem o chat sozinhos.
      // Descubra inspecionando o balão no navegador (botão direito > Inspecionar).
      launcherSelector: '',
    },

    /* 2) VOZ — número de entrada (DN) mapeado no Webex CC para o fluxo de saúde */
    telefone: {
      numero: '+1 (209) 379-8323', // entry point "Mais Saude" -> fluxo MaisSaude
      discagem: '+12093798323',
    },

    /* 3) CALLBACK — Webhook de entrada do Webex Connect (Inbound Webhook)
       O fluxo recebe o JSON e dispara o callback no Webex CC.
       Campos enviados: nome, telefone, telefoneE164, documento, motivo,
       motivoDescricao, observacao, contexto, vertical, marca, origem, enviadoEm */
    callback: {
      webhookUrl: 'https://hooks.us.webexconnect.io/events/XSI5XJMP8A', // fluxo WEB_Callback_Portal
      camposFixos: { canalOrigem: 'portal-web' }, // vão em todo POST
      fallbackNoCors: true, // se o webhook bloquear CORS, reenvia sem ler a resposta
    },

    /* 4) WHATSAPP — número conectado ao Webex Connect (só dígitos com DDI) */
    whatsapp: {
      numero: '14083006708', // app "CIsco Live Demo" (serviço Cisco_Brasil) no Webex Connect
    },
  },

  /* Persona da demo — o vendedor usa estes dados durante a apresentação.
     Use os mesmos dados que existem no seu mock/CRM do fluxo. */
  // Mesmos dados da base Airtable DEV_Clinica_Agendamento (paciente PAC-0001).
  persona: {
    nome: 'Maria Oliveira',
    documento: '123.456.789-09',
    telefone: '',            // celular do vendedor para receber callbacks
    email: 'maria.oliveira@exemplo.com',
    extras: {
      'Convênio': 'CONV_UNIMED (base de teste)',
      'Carteirinha': '0012345678',
      'Exames': 'Hemograma e colesterol prontos · eco em análise',
      'Autorizações': 'Ressonância em análise · eco autorizado',
      'Financeiro': '1 boleto em aberto · 1 vencido',
    },
  },

  /* Jornadas — cada uma vira um card no site e um roteiro no painel.
     canais: quais opções aparecem quando o paciente clica (ordem importa).
     mensagemSugerida: copiada para a área de transferência ao abrir o chat
     e pré-preenchida no WhatsApp. */
  jornadas: [
    {
      id: 'agendamento',
      titulo: 'Agendar consulta',
      resumo: 'Escolha especialidade, médico e horário.',
      icone: 'calendar',
      canais: ['chat', 'whatsapp', 'telefone', 'callback'],
      mensagemSugerida: 'Olá, quero agendar uma consulta de cardiologia.',
      dicaURA: 'Na URA, diga "agendar consulta".',
      roteiro: [
        { passo: 'Clique em "Agendar consulta" e escolha WhatsApp ou chat.', fala: 'O paciente entra pelo canal que preferir.' },
        { passo: 'Envie a mensagem sugerida (já copiada).' },
        { passo: 'Informe o CPF da persona: 123.456.789-09.', fala: 'A IA identifica a paciente e o convênio dela no cadastro.' },
        { passo: 'Escolha um dos horários e confirme com "sim".', fala: 'O agendamento é gravado na hora, com protocolo.' },
        { passo: 'Peça "quero falar com uma pessoa".', fala: 'O atendente recebe o histórico e o resumo da IA no Agent Desktop.' },
      ],
    },
    {
      id: 'exames',
      titulo: 'Resultados de exames',
      resumo: 'Consulte e receba seus laudos.',
      icone: 'flask',
      canais: ['whatsapp', 'chat', 'callback'],
      mensagemSugerida: 'Oi, quero ver o resultado dos meus exames.',
      roteiro: [
        { passo: 'Abra pelo WhatsApp (QR code) e envie a mensagem sugerida.' },
        { passo: 'Informe o CPF da persona.' },
        { passo: 'A IA lista: hemograma e colesterol PRONTOS, ecocardiograma EM ANÁLISE (previsão 09/11).', fala: 'Autoatendimento que tira volume da central.' },
        { passo: 'Peça o laudo do colesterol e abra o link recebido.', fala: 'O laudo chega no próprio canal, sem login em portal.' },
      ],
    },
    {
      id: 'autorizacao',
      titulo: 'Autorização de procedimento',
      resumo: 'Acompanhe a liberação junto ao seu convênio.',
      icone: 'shield',
      canais: ['whatsapp', 'chat', 'telefone', 'callback'],
      mensagemSugerida: 'Minha ressonância já foi autorizada pelo convênio?',
      dicaURA: 'Na URA, escolha a opção de autorizações.',
      roteiro: [
        { passo: 'Envie a mensagem sugerida e informe o CPF.', fala: 'Aqui o hospital conversa com o fluxo da operadora.' },
        { passo: 'A IA mostra a ressonância EM ANÁLISE (previsão 10/11) e o ecocardiograma AUTORIZADO.' },
        { passo: 'Aceite agendar o ecocardiograma autorizado.', fala: 'Uma jornada puxa a outra, no mesmo atendimento.' },
        { passo: 'Variação: use o CPF 037.365.999-78 (João) para mostrar guia PENDENTE DE DOCUMENTO e transferência.' },
      ],
    },
    {
      id: 'pronto-atendimento',
      titulo: 'Pronto atendimento',
      resumo: 'Orientação inicial e tempo de espera.',
      icone: 'pulse',
      canais: ['chat', 'whatsapp', 'telefone'],
      mensagemSugerida: 'Estou com febre e dor no corpo desde ontem. Qual pronto-socorro está mais vazio?',
      roteiro: [
        { passo: 'Envie a mensagem sugerida.', fala: 'A IA não faz diagnóstico: orienta e mostra a unidade com menor espera.' },
        { passo: 'A IA indica Morumbi (8 min) com endereço.' },
        { passo: 'Agora escreva "estou com dor no peito e falta de ar".', fala: 'Sinal de alerta: a IA orienta ligar 192 e transfere para a enfermagem, com prioridade.' },
      ],
    },
    {
      id: 'financeiro',
      titulo: 'Financeiro e 2ª via',
      resumo: 'Boletos, coparticipação e pendências.',
      icone: 'receipt',
      canais: ['whatsapp', 'chat', 'callback'],
      mensagemSugerida: 'Preciso da segunda via do meu boleto.',
      roteiro: [
        { passo: 'Abra pelo WhatsApp e envie a mensagem sugerida; informe o CPF.' },
        { passo: 'A IA lista 2 pendências: R$ 45,00 (vence 20/11) e R$ 82,50 (vencido).' },
        { passo: 'Escolha o vencido e abra o link do boleto.', fala: 'Linha digitável e boleto no canal, sem ligar para o financeiro.' },
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
        { passo: 'Ligue para a central (QR code) ou peça um humano no WhatsApp.' },
        { passo: 'No WhatsApp, a IA transfere com o contexto da conversa.', fala: 'O atendente não pergunta de novo o que a IA já sabe.' },
        { passo: 'Ou clique em "Receber uma ligação", use "Preencher com persona" e coloque SEU celular.', fala: 'O pedido vira um callback na fila do Webex CC.' },
        { passo: 'Fique disponível no Agent Desktop: o Webex CC liga para você e mostra nome, CPF e motivo do formulário.' },
      ],
    },
  ],
};
