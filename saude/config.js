/* ==========================================================
   VERTICAL SAÚDE — Hospital Vida Plena (marca fictícia)
   Este é o ÚNICO arquivo que precisa ser editado para a demo.
   ========================================================== */
window.DEMO_CONFIG = {
  vertical: 'saude',

  marca: {
    nome: 'Hospital Vida Plena',
    tituloAba: 'Cuidado completo, 24h',
    telefoneExibicao: '(11) 4000-0000', // texto do topo do site
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
      numero: '',     // como exibir, ex.: '(11) 4000-0000'
      discagem: '',   // com DDI, ex.: '+551140000000'
    },

    /* 3) CALLBACK — Webhook de entrada do Webex Connect (Inbound Webhook)
       O fluxo recebe o JSON e dispara o callback no Webex CC.
       Campos enviados: nome, telefone, telefoneE164, documento, motivo,
       motivoDescricao, observacao, contexto, vertical, marca, origem, enviadoEm */
    callback: {
      webhookUrl: '',
      camposFixos: { canalOrigem: 'portal-web' }, // vão em todo POST
      fallbackNoCors: true, // se o webhook bloquear CORS, reenvia sem ler a resposta
    },

    /* 4) WHATSAPP — número conectado ao Webex Connect (só dígitos com DDI) */
    whatsapp: {
      numero: '', // ex.: '5511900000000'
    },
  },

  /* Persona da demo — o vendedor usa estes dados durante a apresentação.
     Use os mesmos dados que existem no seu mock/CRM do fluxo. */
  persona: {
    nome: 'Maria Oliveira',
    documento: '123.456.789-09',
    telefone: '',            // celular do vendedor para receber callbacks
    email: 'maria.oliveira@exemplo.com',
    extras: {
      'Operadora': 'Saúde+ (demo)',
      'Carteirinha': '0012 3456 7890 0001',
      'Plano': 'Saúde+ Executivo — Apartamento',
      'Médico': 'Dr. Ricardo Lima (Cardiologia)',
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
      mensagemSugerida: 'Olá, quero agendar uma consulta com cardiologista.',
      dicaURA: 'Na URA, diga "agendar consulta".',
      roteiro: [
        { passo: 'Clique em "Agendar consulta" e escolha o chat.', fala: 'O paciente entra pelo canal que preferir — aqui, o site.' },
        { passo: 'Cole a mensagem sugerida no chat (já está copiada).' },
        { passo: 'O agente de IA pede o CPF — informe o da persona.', fala: 'A IA identifica a paciente e já sabe o convênio dela.' },
        { passo: 'Escolha um dos horários oferecidos e confirme.' },
        { passo: 'Peça "quero falar com uma pessoa" para mostrar a transferência.', fala: 'O agente humano recebe o histórico e o resumo da IA no Agent Desktop.' },
      ],
    },
    {
      id: 'exames',
      titulo: 'Resultados de exames',
      resumo: 'Consulte e receba seus laudos.',
      icone: 'flask',
      canais: ['chat', 'whatsapp', 'callback'],
      mensagemSugerida: 'Quero ver o resultado do meu exame de sangue.',
      roteiro: [
        { passo: 'Abra o chat ou WhatsApp pela jornada "Resultados de exames".' },
        { passo: 'Informe o CPF da persona quando solicitado.' },
        { passo: 'A IA lista os exames disponíveis e envia o laudo.', fala: 'Autoatendimento resolve sem ocupar a central.' },
      ],
    },
    {
      id: 'autorizacao',
      titulo: 'Autorização de procedimento',
      resumo: 'Acompanhe a liberação junto ao seu convênio.',
      icone: 'shield',
      canais: ['chat', 'telefone', 'callback'],
      mensagemSugerida: 'Preciso saber se minha ressonância já foi autorizada pelo convênio.',
      dicaURA: 'Na URA, escolha a opção de autorizações.',
      roteiro: [
        { passo: 'Mostre que a paciente é beneficiária da operadora Saúde+.', fala: 'Aqui conectamos o hospital ao fluxo da operadora que já construímos.' },
        { passo: 'Inicie pelo telefone ou chat e informe a carteirinha da persona.' },
        { passo: 'O fluxo consulta o status da guia e informa a paciente.' },
        { passo: 'Se pendente, ofereça callback quando a autorização sair.', fala: 'Proatividade: o hospital avisa, a paciente não precisa ligar de novo.' },
      ],
    },
    {
      id: 'pronto-atendimento',
      titulo: 'Pronto atendimento',
      resumo: 'Orientação de triagem e tempo de espera.',
      icone: 'pulse',
      canais: ['chat', 'telefone'],
      mensagemSugerida: 'Estou com febre alta e dor de cabeça desde ontem, devo ir ao pronto-socorro?',
      roteiro: [
        { passo: 'Abra o chat pela jornada "Pronto atendimento".' },
        { passo: 'Descreva os sintomas (mensagem sugerida já copiada).' },
        { passo: 'A IA faz a pré-triagem e escala para a enfermagem.', fala: 'Casos sensíveis vão para um humano qualificado, com prioridade na fila.' },
      ],
    },
    {
      id: 'financeiro',
      titulo: 'Financeiro e 2ª via',
      resumo: 'Boletos, orçamentos e reembolso.',
      icone: 'receipt',
      canais: ['chat', 'whatsapp', 'callback'],
      mensagemSugerida: 'Preciso da segunda via do boleto da minha internação.',
      roteiro: [
        { passo: 'Inicie pelo WhatsApp (QR code) para mostrar o canal móvel.' },
        { passo: 'A IA identifica a paciente e envia a 2ª via.' },
      ],
    },
    {
      id: 'atendente',
      titulo: 'Falar com um atendente',
      resumo: 'Retornamos sua ligação em instantes.',
      icone: 'headset',
      canais: ['callback', 'telefone', 'chat'],
      mensagemSugerida: 'Quero falar com um atendente.',
      roteiro: [
        { passo: 'Clique em "Receber uma ligação".' },
        { passo: 'Use "Preencher com persona" e coloque SEU celular.', fala: 'O pedido entra no Webex CC como callback.' },
        { passo: 'Atenda no Agent Desktop e mostre a tela pop com os dados do formulário.' },
      ],
    },
  ],
};
